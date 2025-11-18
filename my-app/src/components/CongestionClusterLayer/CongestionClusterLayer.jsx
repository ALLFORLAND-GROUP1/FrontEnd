import React, { useEffect, useMemo, useState } from 'react';
import { CircleMarker, Tooltip, Popup, useMap, Marker } from 'react-leaflet';
import L from 'leaflet';
import { Tooltip as MuiTooltip } from '@mui/material';
import { getColorForValue, getRadiusForCount } from './CongestionClusterLayerStyle';

// 선택 시간과 가장 가까운 CSV 컬럼 추정
function findClosestTimeColumn(selectedTime, row) {
  if (!selectedTime || !row) return null;
  const [sh, sm] = String(selectedTime).split(':').map(Number);
  const target = sh * 60 + sm;
  const cols = Object.keys(row).filter(k => /^\d{1,2}:\d{2}$/.test(k));
  let best = null;
  let min = Infinity;
  for (const c of cols) {
    const [h, m] = c.split(':').map(Number);
    const minutes = h * 60 + m;
    const diff = Math.abs(minutes - target);
    if (diff < min) {
      min = diff;
      best = c;
    }
  }
  return best;
}

function computeStationCongestions(markers, subwayData, selectedTime, selectedDay) {
  if (!Array.isArray(markers) || !Array.isArray(subwayData)) return [];
  const rowsByKey = new Map();
  for (const r of subwayData) {
    const key = `${r.name || r['name']}-${r.ho || r['ho']}-${r.date || r.day || ''}`;
    if (!rowsByKey.has(key)) rowsByKey.set(key, []);
    rowsByKey.get(key).push(r);
  }

  const result = [];
  for (const m of markers) {
    const keyA = `${m.name}-${m.ho}-${selectedDay || ''}`;
    const keyB = `${m.name}-${m.ho}-`; 
    const candidates = rowsByKey.get(keyA) || rowsByKey.get(keyB) || [];

    if (candidates.length === 0) continue;
    const col = findClosestTimeColumn(selectedTime, candidates[0]);
    if (!col) continue;

    // 상/하행(또는 내/외선) 데이터 유연 처리: 둘 다 있으면 평균, 한쪽만 있으면 그것 사용
    const byDir = new Map();
    for (const r of candidates) {
      const dir = r.upDown || r.direction || r.dir || '';
      const v = Number(String(r[col]).replace(/[^0-9.]+/g, ''));
      if (!Number.isNaN(v) && v >= 0) byDir.set(dir || `row${byDir.size}`, v);
    }
    if (byDir.size === 0) continue; // 데이터 없으면 제외
    const arr = Array.from(byDir.values());
    const avg = arr.length === 1 ? arr[0] : (arr[0] + arr[1]) / 2;
    if (!(avg > 0)) continue;

    result.push({
      name: m.name,
      ho: m.ho,
      lat: m.lat,
      lng: m.lng,
      value: Math.max(0, Math.min(100, avg)),
    });
  }
  return result;
}

function clusterByGrid(points, zoom) {
  if (!points.length) return [];
  // 고배율(14+)에서는 클러스터링 안함 → 각 역마다 작은 배지
  if (zoom >= 14) {
    return points.map(p => ({ lat: p.lat, lng: p.lng, avg: p.value, count: 1, name: p.name, ho: p.ho }));
  }
  // 저배율: 격자 클러스터링
  const step = zoom <= 9 ? 0.1 : zoom <= 11 ? 0.05 : zoom <= 13 ? 0.025 : 0.015;
  const buckets = new Map();
  for (const p of points) {
    const gx = Math.floor(p.lng / step);
    const gy = Math.floor(p.lat / step);
    const key = `${gx}:${gy}`;
    let b = buckets.get(key);
    if (!b) {
      b = { sumLat: 0, sumLng: 0, sumVal: 0, count: 0, items: [] };
      buckets.set(key, b);
    }
    b.sumLat += p.lat;
    b.sumLng += p.lng;
    b.sumVal += p.value;
    b.count += 1;
    b.items.push(p);
  }
  const clusters = [];
  buckets.forEach(b => {
    const lat = b.sumLat / b.count;
    const lng = b.sumLng / b.count;
    const avg = b.sumVal / b.count;
    clusters.push({ lat, lng, avg, count: b.count });
  });
  return clusters;
}

export default function CongestionClusterLayer({
  markers,
  subwayData,
  selectedTime,
  selectedDay,
  showFromZoom = 8,
  onMarkerClick,
  onMarkerClickOnly,
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const [markerPos, setMarkerPos] = useState(null);
  const [dist, setDist] = useState(0);
  const [dur, setDur] = useState(0);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  useEffect(() => {
    // 전용 pane 생성
    if (!map.getPane('congestionClusters')) {
      const p = map.createPane('congestionClusters');
      p.style.zIndex = 400; // 가장 아래
    }
    // 숫자 라벨용 pane (클러스터 위, 팝업 아래)
    if (!map.getPane('congestionLabels')) {
      const lp = map.createPane('congestionLabels');
      lp.style.zIndex = 450; // 클러스터(400) 위, 팝업(600-700) 아래
      lp.style.pointerEvents = 'none';
    }
    const onZoom = () => setZoom(map.getZoom());
    map.on('zoomend', onZoom);
    return () => map.off('zoomend', onZoom);
  }, [map, zoom]);

  const stations = useMemo(
    () => computeStationCongestions(markers || [], subwayData || [], selectedTime, selectedDay),
    [markers, subwayData, selectedTime, selectedDay],
  );
  const clusters = useMemo(() => clusterByGrid(stations, zoom), [stations, zoom]);

  if (zoom < showFromZoom) return null;

  const isHighZoom = zoom >= 14; // 고배율: 작은 배지, 저배율: 큰 클러스터

  // 숫자 라벨 아이콘 생성기 - 중앙정렬된 숫자만 표시
  const makeLabelIcon = num => {
    return L.divIcon({
      className: 'congestion-label-center',
      html: `<div style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; font-size: 14px; font-weight: 700; color: #1a1a1a; text-shadow: 0 0 4px rgba(255,255,255,1), 0 0 8px rgba(255,255,255,0.8), 1px 1px 2px rgba(255,255,255,0.9); pointer-events: none;">${num}</div>`,
      iconSize: [1, 1],
      iconAnchor: [0, 0],
    });
  };

  return (
    <>
      {clusters.map((c, idx) => {
        const color = getColorForValue(c.avg);
        const radius = isHighZoom ? 18 : Math.max(15, Math.min(35, 15 + c.count * 2));

        // 고배율일 때 해당 역의 방향별 데이터 찾기
        const directions =
          isHighZoom && c.name
            ? subwayData.filter(row => row['date'] === selectedDay && row['ho'] === c.ho && row['name'] === c.name)
            : [];
        const upDownTypes = [...new Set(directions.map(row => row['upDown']))];
        const col = directions.length > 0 ? findClosestTimeColumn(selectedTime, directions[0]) : null;

        return (
          <React.Fragment key={idx}>
            <CircleMarker
              center={[c.lat, c.lng]}
              pane="congestionClusters"
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: isHighZoom ? 0.85 : 0.6,
                weight: 2,
              }}
              radius={radius}
              eventHandlers={{
                click: e => {
                  if (onMarkerClick && c.name) {
                    setMarkerPos({ lat: c.lat, lng: c.lng });
                    onMarkerClick({ lat: c.lat, lng: c.lng }, c.name).then(distance => {
                      setDist(parseFloat(distance.info.distance));
                      setDur(parseFloat(distance.info.duration));
                    });
                  }
                },
              }}
            >
              {/* 고배율에서 클릭 시 기존 Popup 표시 */}
              {isHighZoom && c.name && (
                <Popup closeButton={true} maxWidth={280} className="subway-popup-modern">
                  <div className="subway-info-card">
                    <div className="subway-header">
                      <div className="subway-title">
                        <span className="subway-name">{c.name}</span>
                        {c.ho && <span className={`subway-line line-${c.ho}`}>{c.ho}호선</span>}
                      </div>
                      <div className="subway-datetime">
                        <span className="date">📅 {selectedDay}</span>
                        <span className="time">⏰ {selectedTime}</span>
                      </div>
                    </div>

                    <div className="subway-content">
                      <div className="intervals-title">🚇 혼잡도 </div>
                      <div className="intervals-list">
                        {upDownTypes.map((type, i) => {
                          const row = directions.find(d => d['upDown'] === type);
                          const interval = col && row ? row[col] : '0';
                          let intervalClass = 'no-service';
                          let intervalNum = null;
                          if (interval !== '0') {
                            intervalNum = parseFloat(interval);
                            if (intervalNum < 20) {
                              intervalClass = 'interval-0';
                            } else if (intervalNum < 40) {
                              intervalClass = 'interval-10';
                            } else if (intervalNum < 60) {
                              intervalClass = 'interval-20';
                            } else if (intervalNum < 80) {
                              intervalClass = 'interval-30';
                            } else if (intervalNum < 100) {
                              intervalClass = 'interval-40';
                            } else {
                              intervalClass = 'interval-50';
                            }
                          }
                          return (
                            <button
                              key={i}
                              className="interval-item"
                              onClick={e => {
                                if (onMarkerClickOnly) {
                                  onMarkerClickOnly(markerPos, c.name, dist, dur, type, intervalNum);
                                }
                              }}
                            >
                              <span className="direction">{type}</span>
                              <span className={`interval ${intervalClass}`}>{interval}</span>
                            </button>
                          );
                        })}
                      </div>

                      {col && (
                        <div className="closest-time">
                          <span className="time-icon">⏱️</span>
                          가장 가까운 시간: <strong>{col}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              )}
            </CircleMarker>
          </React.Fragment>
        );
      })}

      {/* 숫자 라벨: 중앙정렬 */}
      {clusters.map((c, idx) => {
        const tooltipTitle = c.name ? `${c.name}` : null;

        const labelMarker = (
          <Marker
            key={`label-${idx}`}
            position={[c.lat, c.lng]}
            icon={makeLabelIcon(Math.round(c.avg))}
            pane="congestionLabels"
            interactive={false}
          />
        );

        // 고배율에서만 툴팁 표시
        if (isHighZoom && tooltipTitle) {
          return (
            <MuiTooltip
              key={`label-${idx}`}
              title={tooltipTitle}
              arrow
              placement="top"
              enterDelay={200}
              leaveDelay={0}
              PopperProps={{
                sx: {
                  '& .MuiTooltip-tooltip': {
                    backgroundColor: 'rgba(50, 50, 50, 0.95)',
                    color: '#fff',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '6px 10px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  },
                  '& .MuiTooltip-arrow': {
                    color: 'rgba(50, 50, 50, 0.95)',
                  },
                },
              }}
            >
              <span>{labelMarker}</span>
            </MuiTooltip>
          );
        }

        return labelMarker;
      })}
    </>
  );
}

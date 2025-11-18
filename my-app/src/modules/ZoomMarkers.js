import { useState, useEffect, memo, useRef, forwardRef, useImperativeHandle } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";

const markerIcon_ = L.icon({
  iconUrl: "iconrail2.png",
  iconSize: [20, 20],
  // iconAnchor: [12, 41],
});

// 선택 시간과 가장 가까운 CSV 컬럼 찾기
function findClosestTimeColumn(selectedTime, row) {
  if (!selectedTime) return null;
  const [sh, sm] = selectedTime.split(":").map(Number);
  const selectedMinutes = sh * 60 + sm;

  const timeColumns = Object.keys(row).filter((key) => /^\d{1,2}:\d{2}$/.test(key));

  let closest = null;
  let minDiff = Infinity;
  timeColumns.forEach((col) => {
    const [h, m] = col.split(":").map(Number);
    const minutes = h * 60 + m;
    const diff = Math.abs(selectedMinutes - minutes);
    if (diff < minDiff) {
      minDiff = diff;
      closest = col;
    }
  });
  return closest;
}

// 마커 & 팝업
const ZoomMarkers = forwardRef(function ZoomMarkers(
  { markers, subwayData, selectedDay, selectedTime, minZoom = 10, onMarkerClick, onMarkerClickOnly },
  ref
) {
  const map = useMap();
  // const [visible, setVisible] = useState(map.getZoom() >= minZoom);
  const [selectedMarkerKey, setSelectedMarkerKey] = useState(null);
  // const [mapBounds, setMapBounds] = useState(map.getBounds()); // ✅ 현재 화면 경계 저장
  const prevZoom = useRef(map.getZoom()); // 이전 줌값 기억
  const markerRefs = useRef({});
  const markerPosRef = useRef(null);
  const distRef = useRef(0);
  const durRef = useRef(0);
 
  useImperativeHandle(ref, () => ({
    flyToAndOpen: async (key, lat, lng, targetZoom = 15) => {
      if (!map) return;

      // 1️⃣ 현재 zoom < minZoom이면 먼저 확대
      if (map.getZoom() < minZoom) {
        map.setZoom(minZoom, { animate: true });
      }

      // 2️⃣ 이동 실행
      if (lat != null && lng != null) {
        map.flyTo([lat, lng], targetZoom, { duration: 1.2 });
      }
      // onMarkerClick({'lat': lat, 'lng':lng}, key.slice(0, -2))

      onMarkerClick({'lat': lat, 'lng':lng}, key.slice(0, -2)).then(distance => {
        const d = parseFloat(distance.info.distance);
        const t = parseFloat(distance.info.duration);

        distRef.current = d;
        durRef.current = t;
      })

      const waitForRender = () => {
        const marker = markerRefs.current[key];
        if (marker) {
          console.log('asdf')
          // ✅ 마커 렌더 확인 후 팝업 오픈
          marker.openPopup();
          console.log([lat, lng], marker._latlng)
          // onMarkerClick(marker._latlng)
          map.off("moveend", waitForRender);
          map.off("zoomend", waitForRender);
        } else {
          // 아직 마커가 안 렌더링된 경우 재시도 (0.2초 간격)
          setTimeout(waitForRender, 200);
        }
      };
      map.on("moveend", waitForRender);
      map.on("zoomend", waitForRender);
    },
  }));

  useEffect(() => {
    if (selectedMarkerKey) {
      const marker = markerRefs.current[selectedMarkerKey];
      if (marker) marker.openPopup();
    }
  }, [map.getZoom()]);

  return (
    <MarkerClusterGroup
    key={selectedTime}
      chunkedLoading
      animate={true}
      spiderfyOnMaxZoom={false}
      disableClusteringAtZoom={15}
      maxClusterRadius={120}
      iconCreateFunction={(cluster) => {
        const markers = cluster.getAllChildMarkers();
        const nums = markers
          .map((m) => m.options.intervalNum)
          .filter((v) => v !== null && !isNaN(v));

        const avg =
          nums.length > 0
            ? nums.reduce((a, b) => a + b, 0) / nums.length
            : 0;

        let color = "gray";
        if (avg < 20) color = "#4CAF50";
        else if (avg < 40) color = "#FFC107";
        else if (avg < 60) color = "#FF9800";
        else color = "#F44336";

        return L.divIcon({
          html: `<div class="cluster-icon" style="
            background:${color};
            color:white;
            border-radius:50%;
            width:40px;
            height:40px;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:bold;">
              ${Math.round(avg)}
            </div>`,
          className: "",
        });
      }}
    >
      {markers
        .map((m) => {
        // ✅ 고유 key 생성 (name-ho 조합)
        const key = `${m.name}-${m.ho}`;

        const directions = subwayData.filter(
          (row) => row["date"] === selectedDay && row["ho"] === m.ho && row["name"] === m.name
        );
        const upDownTypes = [...new Set(directions.map((row) => row["upDown"]))];
        const col = directions.length > 0 ? findClosestTimeColumn(selectedTime, directions[0]) : null;

        // intervalNum 계산
        let intervalNum = null;
        if (col && directions[0]) {
          const value = parseFloat(directions[0][col]);
          intervalNum = isNaN(value) ? null : value;
        }

        return (
          <Marker key={key} position={[m.lat, m.lng]} icon={markerIcon_} ref={(el) => (markerRefs.current[key] = el)} intervalNum={intervalNum} eventHandlers={{
            click: (e) => {
              setTimeout(() => {
                e.target.openPopup();
              }, 200); 
              // setTimeout(() => e.target.openPopup(), 200)
              if (onMarkerClick) {
                // rerender 없음
                markerPosRef.current = e.latlng;

                onMarkerClick(e.latlng, m.name).then(distance => {
                  const d = parseFloat(distance.info.distance);
                  const t = parseFloat(distance.info.duration);

                  distRef.current = d;
                  durRef.current = t;

                  console.log("거리:", d, "시간:", t);
                });
              }
              // setSelectedMarkerKey(key);
            }

          }}
          >
            <Popup
              autoPan={false}
              closeButton={true}
              maxWidth={280}
              className="subway-popup-modern"
            >
              <div className="subway-info-card">
                <div className="subway-header">
                  <div className="subway-title">
                    <span className="subway-name">{m.name}</span>
                    <span className={`subway-line line-${m.ho}`}>{m.ho}호선</span>
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
                      const row = directions.find((d) => d["upDown"] === type);
                      const interval = col && row ? row[col] : "0";
                      // 운행 간격에 따른 색상 결정 (6단계 구분)
                      let intervalClass = 'no-service';
                      let intervalNum = null
                      if (interval !== '0') {
                        intervalNum = parseFloat(interval);
                        if (intervalNum < 20) {
                          intervalClass = 'interval-0'; // 0~9분: 매우 빠름
                        } else if (intervalNum < 40) {
                          intervalClass = 'interval-10'; // 10~19분: 빠름
                        } else if (intervalNum < 60) {
                          intervalClass = 'interval-20'; // 20~29분: 보통
                        } else if (intervalNum < 80) {
                          intervalClass = 'interval-30'; // 30~39분: 약간 느림
                        } else if (intervalNum < 100) {
                          intervalClass = 'interval-40'; // 40~49분: 느림
                        } else {
                          intervalClass = 'interval-50'; // 50분 이상: 매우 느림
                        }
                      }
                      return (
                        <button key={i} className="interval-item"
                        onClick={(e) => {
                          if (onMarkerClickOnly){
                            // console.log(markerPosRef, distRef, durRef, m.name, type, intervalNum)
                            onMarkerClickOnly(markerPosRef.current, m.name, distRef.current, durRef.current, type, intervalNum)
                          }
                        }}>
                          <span className="direction">{type}</span>
                          <span className={`interval ${intervalClass}`}>
                            {interval}
                          </span>
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
          </Marker>
        );
      })}
    </MarkerClusterGroup>
  );
});

export default memo(ZoomMarkers, (prevProps, nextProps) => {
  return (
    prevProps.markers === nextProps.markers &&
    prevProps.subwayData === nextProps.subwayData &&
    prevProps.selectedDay === nextProps.selectedDay &&
    prevProps.selectedTime === nextProps.selectedTime &&
    prevProps.minZoom === nextProps.minZoom
  );
});
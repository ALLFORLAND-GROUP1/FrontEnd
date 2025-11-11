import { useState, useEffect, memo, useRef, forwardRef, useImperativeHandle } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

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
  const [visible, setVisible] = useState(map.getZoom() >= minZoom);
  const [mapBounds, setMapBounds] = useState(map.getBounds()); // ✅ 현재 화면 경계 저장
  const prevZoom = useRef(map.getZoom()); // 이전 줌값 기억
  const markerRefs = useRef({});
  const [markerPos, setMarkerPos] = useState(null)
  const [dist, setDist] = useState(0)
  const [dur, setDur] = useState(0)
 
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
                  setDist(parseFloat(distance.info.distance))
                  setDur(parseFloat(distance.info.duration))
                })


      // 3️⃣ 지도 이동/확대 완료 감지 후 실행
      const waitForRender = () => {
        const marker = markerRefs.current[key];
        if (marker) {
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
    // openPopupByKey: (key) => {
    //   const marker = markerRefs.current[key];
    //   if (marker) {
    //     marker.openPopup();
    //     onMarkerClick(marker._latlng)
    //     console.log(marker._latlng)
    //   }
    // },
  }));

  useEffect(() => {
    const handleZoom = () => {
      const zoom = map.getZoom();

      // 확대: minZoom 막 넘은 순간
      if (prevZoom.current < minZoom && zoom >= minZoom) {
        setVisible(true);
        // console.log("마커 최초 렌더 실행!");
      }

      // 축소: minZoom 아래로 내려간 순간
      if (prevZoom.current >= minZoom && zoom < minZoom) {
        setVisible(false);
        // console.log("마커 제거!");
      }

      prevZoom.current = zoom; // 현재 줌값 저장
    };

    map.on("zoomend", handleZoom);
    return () => map.off("zoomend", handleZoom);
  }, [map, minZoom]);

  useEffect(() => {
    const updateBounds = () => setMapBounds(map.getBounds());
    updateBounds(); // 초기 렌더 시 1회 실행

    map.on("moveend", updateBounds);
    map.on("zoomend", updateBounds);

    return () => {
      map.off("moveend", updateBounds);
      map.off("zoomend", updateBounds);
    };
  }, [map]);
  
  // const bounds = map.getBounds();
  if (!visible) return null;
  return (
    <>
      {markers
        .filter((m) => mapBounds.contains(L.latLng(m.lat, m.lng)))
        .map((m) => {
        // ✅ 고유 key 생성 (name-ho 조합)
        const key = `${m.name}-${m.ho}`;

        const directions = subwayData.filter(
          (row) => row["date"] === selectedDay && row["ho"] === m.ho && row["name"] === m.name
        );
        const upDownTypes = [...new Set(directions.map((row) => row["upDown"]))];
        const col = directions.length > 0 ? findClosestTimeColumn(selectedTime, directions[0]) : null;

        return (
          <Marker key={key} position={[m.lat, m.lng]} icon={markerIcon_} ref={(el) => (markerRefs.current[key] = el)} eventHandlers={{
            click: (e) => {
              setTimeout(() => e.target.openPopup(), 200)
              if (onMarkerClick) {
                setMarkerPos(e.latlng)
                onMarkerClick(e.latlng, m.name).then(distance => {
                  console.log(distance.info.distance, distance.info.duration)
                  setDist(parseFloat(distance.info.distance))
                  setDur(parseFloat(distance.info.duration))
                })
                // console.log(dist.then(res=>res))
              }
            }

          }}
            // opacity={map.getZoom() < minZoom ? 0 : 1}
            interactive={true}
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
                            // console.log(markerPos.lat, markerPos.lng, dist, dur, m.name, type, intervalNum)
                            onMarkerClickOnly(markerPos, m.name, dist, dur, type, intervalNum)
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
    </>
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
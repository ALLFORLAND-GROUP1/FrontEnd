import { useState, useEffect, memo, useRef } from "react";
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
function ZoomMarkers({ markers, subwayData, selectedDay, selectedTime, minZoom = 10, onMarkerClick }) {
  const map = useMap();
  const [visible, setVisible] = useState(map.getZoom() >= minZoom);
  const prevZoom = useRef(map.getZoom()); // 이전 줌값 기억

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

  if (!visible) return null;
  return (
    <>
      {markers.map((m, idx) => {
        const directions = subwayData.filter(
          (row) => row["date"] === selectedDay && row["ho"] === m.ho && row["name"] === m.name
        );
        const upDownTypes = [...new Set(directions.map((row) => row["upDown"]))];
        const col = directions.length > 0 ? findClosestTimeColumn(selectedTime, directions[0]) : null;

        return (
          <Marker key={idx} position={[m.lat, m.lng]} icon={markerIcon_} eventHandlers={{
            click: (e) => {
              if (onMarkerClick) {
                onMarkerClick(e.latlng)
              }
            }
          }}>
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
                  <div className="intervals-title">🚇 운행 간격</div>
                  <div className="intervals-list">
                    {upDownTypes.map((type, i) => {
                      const row = directions.find((d) => d["upDown"] === type);
                      const interval = col && row ? row[col] : "0";
                      return (
                        <div key={i} className="interval-item">
                          <span className="direction">{type}</span>
                          <span className={`interval ${interval === '0' ? 'no-service' : 'active'}`}>
                            {interval}분
                          </span>
                        </div>
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
}

export default memo(ZoomMarkers, (prevProps, nextProps) => {
  return (
    prevProps.markers === nextProps.markers &&
    prevProps.subwayData === nextProps.subwayData &&
    prevProps.selectedDay === nextProps.selectedDay &&
    prevProps.selectedTime === nextProps.selectedTime &&
    prevProps.minZoom === nextProps.minZoom
  );
});
import { useState, useEffect, memo, useRef, forwardRef, useImperativeHandle } from "react";
import { Marker, useMap } from "react-leaflet";
import L from "leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster";

function createMarkerIcon(intervalNum, name, ho) {
  const color = getIntervalColor(intervalNum);
  const hoColor = getHoColor(ho)

  const value =
    intervalNum != null && !Number.isNaN(intervalNum)
      ? Math.round(intervalNum)
      : "";

  return L.divIcon({
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    html: `
      <div
        style="
          width: 40px;
          height: 46px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
        "
      >
        <div
          style="
            width: 20px;
            height: 30px;
            background: ${color};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
            border: 2px solid white;
            box-shadow: 0 0 4px rgba(0,0,0,0.4);
          "
        >
          ${value}
        </div>
        <div
          style="
            margin-top: 2px;
            padding: 1px 4px;
            border-radius: 4px;
            border: 1px solid #fff;
            background: ${hoColor};
            color: #ffffffff;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap; 
            box-shadow: 0 0 3px rgba(0,0,0,0.25);
          "
        >
          ${name ?? ""}
        </div>
      </div>
    `,
  });
}

function getHoColor(num){
  if (num === 1) return "#0052A4"
  if (num === 2) return "#00A84D"
  if (num === 3) return "#EF7C1C"
  if (num === 4) return "#00A5DE"
  if (num === 5) return "#996CAC"
  if (num === 6) return "#CD7C2F"
  if (num === 7) return "#747F00"
  if (num === 8) return "#E6186C"
  if (num === 9) return "#BB8336"
}

function getIntervalColor(intervalNum) {
  if (intervalNum === null) return "gray";
  if (intervalNum < 20) return "#4CAF50";
  if (intervalNum < 40) return "#FFC107";
  if (intervalNum < 60) return "#FF9800";
  return "#F44336";
}

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

// 팝업 내용 생성 함수
function generatePopupContent(data) {
  const { name, ho, upDownTypes, directions, col, selectedDay, selectedTime } = data;
  
  return `
    <div class="subway-info-card">
      <div class="subway-header">
        <div class="subway-title">
          <span class="subway-name">${name}</span>
          <span class="subway-line line-${ho}">${ho}호선</span>
        </div>
        <div class="subway-datetime">
          <span class="date">📅 ${selectedDay}</span>
          <span class="time">⏰ ${selectedTime}</span>
        </div>
      </div>

      <div class="subway-content">
        <div class="intervals-title">🚇 혼잡도 </div>
        <div class="intervals-list">
          ${upDownTypes.map((type, i) => {
            const row = directions.find((d) => d["upDown"] === type);
            const interval = col && row ? row[col] : "0";
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
            
            return `
              <button class="interval-item" data-direction="${type}" data-interval="${intervalNum}">
                <span class="direction">${type}</span>
                <span class="interval ${intervalClass}">
                  ${interval}
                </span>
              </button>
            `;
          }).join('')}
        </div>

        ${col ? `
          <div class="closest-time">
            <span class="time-icon">⏱️</span>
            가장 가까운 시간: <strong>${col}</strong>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

const ZoomMarkers = forwardRef(function ZoomMarkers(
  { markers, subwayData, selectedDay, selectedTime, minZoom = 10, onMarkerClick, onMarkerClickOnly },
  ref
) {
  const map = useMap();
  const markerRefs = useRef({});
  const popupRef = useRef(null);
  const currentPopupDataRef = useRef(null);
  const distRef = useRef(0);
  const durRef = useRef(0);

  // 버튼 이벤트 연결 함수
  const attachButtonEvents = (data) => {
    setTimeout(() => {
      const buttons = document.querySelectorAll('.interval-item');
      buttons.forEach(btn => {
        // 기존 리스너 제거를 위해 복제
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', (e) => {
          const direction = e.currentTarget.getAttribute('data-direction');
          const interval = parseFloat(e.currentTarget.getAttribute('data-interval'));
          if (onMarkerClickOnly) {
            onMarkerClickOnly(
              { lat: data.lat, lng: data.lng }, 
              data.name, 
              data.dist, 
              data.dur, 
              direction, 
              interval
            );
          }
        });
      });
    }, 0);
  };

  // 팝업 생성 또는 업데이트
  const showPopup = (popupData) => {
    if (!map || !popupData) return;

    const { lat, lng, name, ho } = popupData;
    
    // 같은 마커인지 확인
    const isSameMarker = currentPopupDataRef.current && 
                         currentPopupDataRef.current.name === name && 
                         currentPopupDataRef.current.ho === ho;

    if (isSameMarker && popupRef.current) {
      // 같은 마커면 내용만 업데이트 (깜빡임 없음)
      const popupContent = generatePopupContent(popupData);
      popupRef.current.setContent(popupContent);
      attachButtonEvents(popupData);
      currentPopupDataRef.current = popupData;
      return;
    }

    // 기존 팝업 제거
    if (popupRef.current) {
      map.removeLayer(popupRef.current);
      popupRef.current = null;
    }

    // 새 팝업 생성
    const popupContent = generatePopupContent(popupData);
    
    const popup = L.popup({
      closeButton: true,
      maxWidth: 280,
      className: "subway-popup-modern",
      autoClose: false,
      closeOnClick: false
    })
      .setLatLng([lat, lng])
      .setContent(popupContent)
      .openOn(map);

    attachButtonEvents(popupData);

    // 팝업 닫기 이벤트
    popup.on('remove', () => {
      popupRef.current = null;
      currentPopupDataRef.current = null;
    });

    popupRef.current = popup;
    currentPopupDataRef.current = popupData;
  };

  useImperativeHandle(ref, () => ({
    flyToAndOpen: async (key, lat, lng, targetZoom = 15) => {
      if (!map) return;

      if (map.getZoom() < minZoom) {
        map.setZoom(minZoom, { animate: true });
      }

      if (lat != null && lng != null) {
        map.flyTo([lat, lng], targetZoom, { duration: 1.2 });
      }

      const distance = await onMarkerClick({'lat': lat, 'lng':lng}, key.slice(0, -2));
      const d = parseFloat(distance.info.distance);
      const t = parseFloat(distance.info.duration);

      distRef.current = d;
      durRef.current = t;

      // 팝업 데이터 준비
      const marker = markers.find(m => `${m.name}-${m.ho}` === key);
      if (marker) {
        const directions = subwayData.filter(
          (row) => row["date"] === selectedDay && row["ho"] === marker.ho && row["name"] === marker.name
        );
        const upDownTypes = [...new Set(directions.map((row) => row["upDown"]))];
        const col = directions.length > 0 ? findClosestTimeColumn(selectedTime, directions[0]) : null;

        showPopup({
          lat,
          lng,
          name: marker.name,
          ho: marker.ho,
          upDownTypes,
          directions,
          col,
          selectedDay,
          selectedTime,
          dist: d,
          dur: t
        });
      }
    },
  }));

  const handleMarkerClick = async (e, m) => {
    if (!onMarkerClick) return;

    const distance = await onMarkerClick(e.latlng, m.name);
    const d = parseFloat(distance.info.distance);
    const t = parseFloat(distance.info.duration);

    distRef.current = d;
    durRef.current = t;

    // 팝업 데이터 설정
    const directions = subwayData.filter(
      (row) => row["date"] === selectedDay && row["ho"] === m.ho && row["name"] === m.name
    );
    const upDownTypes = [...new Set(directions.map((row) => row["upDown"]))];
    const col = directions.length > 0 ? findClosestTimeColumn(selectedTime, directions[0]) : null;

    showPopup({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      name: m.name,
      ho: m.ho,
      upDownTypes,
      directions,
      col,
      selectedDay,
      selectedTime,
      dist: d,
      dur: t
    });
  };

  // selectedDay, selectedTime 변경 시 팝업 업데이트
  useEffect(() => {
    if (currentPopupDataRef.current && popupRef.current) {
      const { name, ho } = currentPopupDataRef.current;
      
      // 현재 팝업의 마커 데이터 다시 가져오기
      const directions = subwayData.filter(
        (row) => row["date"] === selectedDay && row["ho"] === ho && row["name"] === name
      );
      const upDownTypes = [...new Set(directions.map((row) => row["upDown"]))];
      const col = directions.length > 0 ? findClosestTimeColumn(selectedTime, directions[0]) : null;

      // 팝업 데이터 업데이트
      const updatedData = {
        ...currentPopupDataRef.current,
        upDownTypes,
        directions,
        col,
        selectedDay,
        selectedTime
      };

      // 팝업 내용만 업데이트 (깜빡임 없음)
      const popupContent = generatePopupContent(updatedData);
      popupRef.current.setContent(popupContent);
      attachButtonEvents(updatedData);
      currentPopupDataRef.current = updatedData;
    }
  }, [selectedDay, selectedTime, subwayData]);

  // cleanup
  useEffect(() => {
    return () => {
      if (popupRef.current && map) {
        map.removeLayer(popupRef.current);
      }
    };
  }, [map]);

  return (
    <MarkerClusterGroup
      key={`${selectedTime}-${selectedDay}`}
      chunkedLoading
      animate={true}
      spiderfyOnMaxZoom={false}
      disableClusteringAtZoom={15}
      maxClusterRadius={180}
      iconCreateFunction={(cluster) => {
        const zoom = cluster._group._map.getZoom(); 
        let size = 40;

        if (zoom < 14) size = 60;
        if (zoom < 13) size = 80;
        if (zoom < 12) size = 100;

        const markers = cluster.getAllChildMarkers();
        const nums = markers
          .map((m) => m.options.intervalNum)
          .filter((v) => v !== null && !isNaN(v));

        const avg =
          nums.length > 0
            ? nums.reduce((a, b) => a + b, 0) / nums.length
            : 0;

        let color = "gray";
        if (avg < 30) color = "#4CAF50";
        else if (avg < 60) color = "#FFC107";
        else if (avg < 90) color = "#FF9800";
        else color = "#F44336";

        return L.divIcon({
          html: `<div class="cluster-icon" style="
            background:${color};
            opacity:0.8;
            color:white;
            border-radius:50%;
            width:${size}px;
            height:${size}px;
            display:flex;
            align-items:center;
            justify-content:center;
            font-weight:bold;
            font-size:${size * 0.25}px">
              ${Math.round(avg)}
            </div>`,
          className: "",
        });
      }}
    >
      {markers.map((m) => {
        const key = `${m.name}-${m.ho}`;
        const directions = subwayData.filter(
          (row) => row["date"] === selectedDay && row["ho"] === m.ho && row["name"] === m.name
        );
        const col = directions.length > 0 ? findClosestTimeColumn(selectedTime, directions[0]) : null;

        let intervalNum = null;
        if (col && directions[0] && directions[1]) {
          const value = (parseFloat(directions[0][col]) + parseFloat(directions[1][col])) / 2;
          intervalNum = isNaN(value) ? null : value;
        }

        return (
          <Marker 
            key={key} 
            position={[m.lat, m.lng]} 
            icon={createMarkerIcon(intervalNum, m.name, m.ho)} 
            ref={(el) => (markerRefs.current[key] = el)} 
            intervalNum={intervalNum} 
            eventHandlers={{
              click: (e) => handleMarkerClick(e, m)
            }}
          />
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
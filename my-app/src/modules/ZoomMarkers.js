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

function getHoColor(num) {
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
  if (intervalNum === null || intervalNum === undefined) return "gray";
  if (intervalNum < 30) return "#4CAF50"; // 백엔드 데이터 기준값 반영
  if (intervalNum < 60) return "#FFC107";
  if (intervalNum < 90) return "#FF9800";
  return "#F44336";
}

// 백엔드 데이터는 특정 시간의 값을 바로 주므로 컬럼 찾기 로직 제거됨.
// 기존 코드 구조 유지를 위해 함수 틀은 남기지 않고, 호출부에서 로직을 변경함.

// 팝업 내용 생성 함수
function generatePopupContent(data) {
  // col 제거 (백엔드 데이터에는 시간 컬럼 키가 없음)
  const { name, ho, directions, selectedDay, selectedTime } = data;

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
          ${directions.map((item) => {
    // 백엔드 DTO 매핑 (upDown -> direction, row[col] -> congestion)
    const type = item.direction;
    const intervalNum = item.congestion || 0;
    let intervalClass = 'no-service';

    if (intervalNum > 0) {
      if (intervalNum < 30) {
        intervalClass = 'interval-0';
      } else if (intervalNum < 60) {
        intervalClass = 'interval-20';
      } else if (intervalNum < 90) {
        intervalClass = 'interval-40';
      } else {
        intervalClass = 'interval-50';
      }
    }

    return `
              <button class="interval-item" data-direction="${type}" data-interval="${intervalNum}">
                <span class="direction">${type}</span>
                <span class="interval ${intervalClass}">
                  ${intervalNum.toFixed(1)}%
                </span>
              </button>
            `;
  }).join('')}
        </div>
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

      const distance = await onMarkerClick({ 'lat': lat, 'lng': lng }, key.slice(0, -2));
      const d = parseFloat(distance.info.distance);
      const t = parseFloat(distance.info.duration);

      distRef.current = d;
      durRef.current = t;

      // 팝업 데이터 준비
      const marker = markers.find(m => `${m.name}-${m.ho}` === key);
      if (marker) {
        // 백엔드 데이터 필터링 (stationName, ho 사용)
        // 백엔드에서 이미 해당 시간대 데이터를 주므로 date 체크 로직 삭제
        const directions = subwayData.filter(
          (row) => row.ho == marker.ho && row.stationName === marker.name
        );

        showPopup({
          lat,
          lng,
          name: marker.name,
          ho: marker.ho,
          directions, // 필터링된 데이터 리스트 (DTO)
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

    // 백엔드 데이터 필터링 (stationName, ho 사용)
    const directions = subwayData.filter(
      (row) => row.ho == m.ho && row.stationName === m.name
    );

    console.log('🔍 혼잡도 데이터 확인:', {
      stationName: m.name,
      ho: m.ho,
      totalSubwayData: subwayData.length,
      filteredDirections: directions,
      selectedDay,
      selectedTime
    });

    showPopup({
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      name: m.name,
      ho: m.ho,
      directions,
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
        (row) => row.ho == ho && row.stationName === name
      );

      // 팝업 데이터 업데이트
      const updatedData = {
        ...currentPopupDataRef.current,
        directions,
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

        const color = getIntervalColor(avg);

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

        // 백엔드 데이터 필터링
        const directions = subwayData.filter(
          (row) => row.ho == m.ho && row.stationName === m.name
        );

        // 평균 혼잡도 계산 (DTO의 congestion 필드 사용)
        let intervalNum = null;
        if (directions.length > 0) {
          const sum = directions.reduce((acc, cur) => acc + (cur.congestion || 0), 0);
          intervalNum = sum / directions.length;
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
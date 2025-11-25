import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMap, Polyline } from "react-leaflet";
import ZoomMarkers from "./modules/ZoomMarkers";
import ChatWidget from "./modules/ChatWidget";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/SubwayPopup.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { loadCSV } from "./modules/utils";
import "leaflet-polylinedecorator"
import { Box } from "@mui/material";
import SideMenu from "./components/SideMenu/SideMenu";
import { getRoute } from './modules/getRoute'
import CameraControlBtnGroup from './components/CameraControlBtnGroup/CameraControlBtnGroup';
import currentLocationIconUrl from "./assets/image/curLocation_marker.png";
import CongestionLegend from "./components/CongestionLegend/CongestionLegend";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// 현재 위치 아이콘
const currentLocationIcon = L.icon({
  iconUrl: currentLocationIconUrl,
  iconSize: [50, 50],
  iconAnchor: [20, 41],
});

// 초기 중심 위치
const position = [37.5662201, 126.8593251];

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반지름 (km)
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // 거리 (km)
}

function DynamicPolyline({ route }) {
  const [pathOptions] = useState({ color: "#9e97ffff", weight: 6, opacity: 1.0 });
  const [pathOptions2] = useState({ color: "#05029eff", weight: 10, opacity: 1.0 });

  if (!route || route.length === 0) return null;

  return <>
    <Polyline positions={route} pathOptions={pathOptions2} />
    <Polyline positions={route} pathOptions={pathOptions} /></>;
}

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { duration: 1.2 });
    }
  }, [map, position]);
  return null;
}

function getDayType() {
  const today = new Date();
  const day = today.getDay();
  // 0: 일요일, 1: 월요일, ..., 5: 금요일, 6: 토요일

  if (day === 6) return "토요일";
  if (day >= 1 && day <= 5) return "평일";
  if (day === 0) return "일요일";
}

// [리펙터링] 어떤 시간이 들어와도 무조건 30분 단위 문자열로 반환하는 함수
// Ex)입력: Date 객체 또는 "10:58" 같은 문자열
// Ex)출력: "11:00"
function snapTo30Min(input) {
  let hours, minutes;

  if (input instanceof Date) {
    hours = input.getHours();
    minutes = input.getMinutes();
  } else if (typeof input === 'string') {
    // "10:58" 같은 문자열 파싱
    const parts = input.split(':');
    if (parts.length === 2) {
      hours = parseInt(parts[0], 10);
      minutes = parseInt(parts[1], 10);
    } else {
      // 형식이 이상하면 현재 시간 기준
      const now = new Date();
      hours = now.getHours();
      minutes = now.getMinutes();
    }
  } else {
    const now = new Date();
    hours = now.getHours();
    minutes = now.getMinutes();
  }

  if (minutes < 15) {
    minutes = 0;
  } else if (minutes < 45) {
    minutes = 30;
  } else {
    minutes = 0;
    hours += 1;
  }

  if (hours >= 24) hours = 0;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  return `${formattedHours}:${formattedMinutes}`;
}

function App() {
  // UI에는 현재 진짜 시간을 보여주기 위해 스냅하지 않음
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  const [markers, setMarkers] = useState([]);
  const [myPos, setMyPos] = useState(null);
  const [subwayData, setSubwayData] = useState([]);

  // 초기값: 진짜 현재 시간 (예: 10:58)
  const [selectedTime, setSelectedTime] = useState(getCurrentTime);
  const [selectedDay, setSelectedDay] = useState(getDayType);

  const [targetStation, setTargetStation] = useState(null);

  const [route, setRoute] = useState([]); // 경로 좌표 배열
  const [info, setInfo] = useState(null); // 거리/시간 정보
  const [savedPos, setSavedPos] = useState(null);
  const [botMessage, setBotMessage] = useState(null); // 봇 메시지
  const [infoMessage, setInfoMessage] = useState(null); // 봇 메시지
  const [selectedRouteAPI, setselectedRouteAPI] = useState('gh');
  const [mapType, setMapType] = useState('normal');

  const myPosRef = useRef(myPos);
  const routeAPIRef = useRef(selectedRouteAPI)
  const markersRef = useRef(null);
  const mapRef = useRef(null);

  const tileUrls = {
    normal: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    aerial: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  };

  useEffect(() => {
    myPosRef.current = myPos; // myPos 바뀔 때마다 ref 업데이트
  }, [myPos]);

  useEffect(() => {
    routeAPIRef.current = selectedRouteAPI
  }, [selectedRouteAPI])

  // 역 위치 로딩
  useEffect(() => {
    loadCSV("http://localhost:8081/api/data/stations").then((data) => {
      const mappedData = data.map(item => ({
        ...item,
        name: item.stationName
      }));
      setMarkers(mappedData);
    });
  }, []);

  // 혼잡도 데이터 로딩
  // selectedTime은 항상 00 또는 30으로 보장
  useEffect(() => {
    if (!selectedDay || !selectedTime) return;

    // 화면에는 selectedTime(10:58)을 유지하고,
    // 서버 요청용 URL 만들 때만 snapTo30Min을 써서 11:00으로 변환함.
    const apiTime = snapTo30Min(selectedTime);
    const url = `http://localhost:8081/api/data/congestion/time?dayType=${selectedDay}&slotTime=${apiTime}`;

    console.log(`[API 요청] 화면시간: ${selectedTime} -> 요청시간: ${apiTime}`);

    loadCSV(url).then((data) => {
      setSubwayData(data);
    });
  }, [selectedDay, selectedTime]);


  const handleSubwayPos = async (pos, name) => {
    const currentPos = myPosRef.current; // 항상 최신값

    const result = await getRoute({ lat: currentPos[0], lng: currentPos[1] }, pos, routeAPIRef.current)
    setSavedPos(pos)
    if (result) {
      setRoute(result.coords);
      setInfo(result.info);
      return result
    }
  }

  const handleSubwayPosOnly = async (pos, name, dist, dur, type, intervalNum) => {
    //const currentPos = myPosRef.current; // 항상 최신값
    setSavedPos(pos)
    // console.log(pos, name, dist, dur, type, intervalNum)
    setInfoMessage(`${name}역\n거리: ${dist}km\n시간: ${dur}분\n방향: ${type}\n혼잡도: ${intervalNum}%`)
    try {
      const res = await fetch("http://localhost:8081/api/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distanceMeters: dist,
          timeMinutes: dur,
          latitude: pos.lat,
          longitude: pos.lng,
          stationName: name,
          direction: type,
          notes: 'test',
          currentLocation: '서울',
          congestionLevel: intervalNum,
        }),
      });
      const data = await res.json();
      setBotMessage(data.data.rawAnswer)
    } catch (e) {
      console.error("LLM 요청 실패:", e);
    }
  }

  useEffect(() => {
    document.body.style.overflow = "hidden"; // 스크롤 비활성화
  }, [])

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMyPos([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => { console.error("위치 가져오기 실패:", err); }
      );
    }
  }, []);

  // Zoom control handlers
  const handleZoomIn = () => {
    const map = mapRef.current;
    if (map) {
      try {
        const currentZoom = map.getZoom();
        const maxZoom = map.getMaxZoom();
        if (currentZoom < maxZoom) {
          map.setZoom(currentZoom + 1);
        }
      } catch (error) {
        console.error("줌인 에러:", error);
      }
    } else {
      console.error("Map reference is not available");
    }
  };

  const handleZoomOut = () => {
    const map = mapRef.current;
    if (map) {
      try {
        const currentZoom = map.getZoom();
        const minZoom = map.getMinZoom();
        if (currentZoom > minZoom) {
          console.log("Zooming out to:", currentZoom - 1);
          map.setZoom(currentZoom - 1);
        }
      } catch (error) {
        console.error("줌아웃 에러:", error);
      }
    } else {
      console.error("Map reference is not available");
    }
  };

  const handleCurrentLocation = () => {
    const map = mapRef.current;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (map && myPos) {
            try {
              const { latitude, longitude } = pos.coords;
              const latlng = [latitude, longitude]
              setMyPos(latlng)
              map.flyTo(myPos, 15.5, { duration: 1.5 });
            } catch (error) {
              console.error("위치 초기화 에러:", error);
            }
          } else {
            console.error("Map reference or current position is not available");
          }
        }
      )
    }

  };

  const handleSelectStation = (station) => {
    // setTargetStation(station)

    // 1️⃣ 지도 중심 이동
    // console.log(station.lat, station.lng)


    // 2️⃣ 팝업 열기 (ZoomMarkers에서 제공하는 openPopupByKey 사용)
    const key = `${station.name}-${station.ho}`;
    markersRef.current?.flyToAndOpen(key, station.lat, station.lng);
  };

  // Sidebar에서 변경된 시간을 그대로 상태에 반영 (스냅 X)
  const handleInfo = (time_, day_, routeapi_, maptype_) => {
    setSelectedTime(time_); // "10:58" 그대로 저장
    setSelectedDay(day_);
    setselectedRouteAPI(routeapi_);
    setMapType(maptype_);
  };

  return (
    <Box sx={{ position: "relative", height: "100vh", display: "flex" }}>
      <SideMenu
        markers={markers}
        handleSelectStation={handleSelectStation}
        onChangeInfo={handleInfo}
      />
      <ChatWidget botMessage={botMessage} infoMessage={infoMessage} />
      <MapContainer
        center={position}
        zoom={15}
        zoomSnap={0.1}
        zoomDelta={0.1}
        zoomControl={false}
        attributionControl={false}
        maxZoom={18}
        // maxBounds={bounds}
        // maxBoundsViscosity={1.0}
        style={{ width: "100vw", height: "100vh" }}
        ref={mapRef}
      >
        <TileLayer key={tileUrls[mapType]} url={tileUrls[mapType]} maxZoom={20} minZoom={8.0} />
        {targetStation && <FlyToLocation position={targetStation} />}
        {myPos && <FlyToLocation position={myPos} />}
        {myPos && <Marker position={myPos} icon={currentLocationIcon} />}
        {route.length > 0 && <DynamicPolyline route={route} />}

        {/* ZoomMarkers에는 진짜 시간(selectedTime)을 넘겨서 팝업에 표시 */}
        {myPos && <ZoomMarkers
          ref={markersRef}
          markers={markers}
          subwayData={subwayData}
          selectedDay={selectedDay}
          selectedTime={selectedTime}
          minZoom={14}
          onMarkerClick={handleSubwayPos}
          onMarkerClickOnly={handleSubwayPosOnly}
        />}
      </MapContainer>
      <CongestionLegend />
      <CameraControlBtnGroup
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCurrentLocation={handleCurrentLocation}
      />
    </Box>
  );
}

export default App;
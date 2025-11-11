import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle, Polyline } from "react-leaflet";
import ZoomMarkers from "./modules/ZoomMarkers";
import ChatWidget from "./modules/ChatWidget";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./styles/SubwayPopup.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { loadCSV } from './modules/utils';
import "leaflet-polylinedecorator"
import { Box } from "@mui/material";
import SideMenu from "./components/SideMenu/SideMenu";
import { getRoute } from './modules/getRoute'
import CameraControlBtnGroup from './components/CameraControlBtnGroup/CameraControlBtnGroup';
import currentLocationIconUrl from "./assets/image/curLocation_marker.png";

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

// 기본 마커 아이콘
const markerIcon_ = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// 초기 중심 위치
const position = [37.5662201, 126.8593251];
// 지도 경계
const bounds = L.latLngBounds([32.5, 123.5], [39.0, 132.0]);

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
  const map = useMap();
  const [pathOptions, setPathOptions] = useState({
    color: "#9e97ffff",
    weight: 6,
    opacity: 1.0
  });

  const [pathOptions2, setPathOptions2] = useState({
    color: "#05029eff",
    weight: 10,
    opacity: 1.0,
  });

  // useEffect(() => {
  //   const handleZoom = () => {
  //     const zoom = map.getZoom();
  //     // 줌 비율에 따라 선 두께 및 투명도 즉각 변경
  //     setPathOptions({
  //       color: "blue",
  //       weight: Math.max(2, zoom / 2), // 줌이 커질수록 두꺼워짐
  //       // opacity: Math.min(1, 0.3 + zoom * 0.05), // 줌에 따른 투명도 변화
  //     });
  //   };

  //   map.on("zoom", handleZoom); // 줌 중에도 즉각 반응
  //   return () => {
  //     map.off("zoom", handleZoom);
  //   };
  // }, [map]);

  if (!route || route.length === 0) return null;

  return <>
    <Polyline positions={route} pathOptions={pathOptions2} />
    <Polyline positions={route} pathOptions={pathOptions} /></>;
}

// 지도 이동만 담당
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
  if (day === 0) return "일요일"; // 필요하면 추가
}

function MapRefresher({ dependency }) {
  const map = useMap();

  useEffect(() => {
    // 지도 타일·크기 다시 계산
    setTimeout(() => {
      map.invalidateSize();
    }, 200); // 약간 지연 주면 안정적
  }, [dependency, map]);

  return null;
}

function App() {
  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  function DestinationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setDest([lat, lng]);
        if (myPos) {
          handleRoute(
            { lat: myPos[0], lng: myPos[1] },
            { lat, lng }
          );
        }
      },
    });
    return dest ? <Marker position={dest} /> : null;
  }

  const [markers, setMarkers] = useState([]);
  const [myPos, setMyPos] = useState(null);
  const [subwayData, setSubwayData] = useState([]);
  const [selectedTime, setSelectedTime] = useState(getCurrentTime);
  const [selectedDay, setSelectedDay] = useState(getDayType);
  const [targetStation, setTargetStation] = useState(null);
  const [dest, setDest] = useState(null);   // 목적지

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

  const tileUrls = {
    normal: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    aerial: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
  };
  const mapRef = useRef(null); // Add a reference to the map instance

  useEffect(() => {
    myPosRef.current = myPos; // myPos 바뀔 때마다 ref 업데이트
  }, [myPos]);

  useEffect(() => {
    routeAPIRef.current = selectedRouteAPI
  }, [selectedRouteAPI])

  const handleSubwayPos = async (pos, name) => {
    const currentPos = myPosRef.current; // 항상 최신값

    const result = await getRoute({ lat: currentPos[0], lng: currentPos[1] }, pos, routeAPIRef.current)
    setSavedPos(pos)
    if (result) {
      setRoute(result.coords);
      setInfo(result.info);
      // console.log(result.info.distance, 'km,', result.info.duration, '분')
      // const res = await fetch(
      //   `http://localhost:5000/info?distance=${result.info.distance}&time=${result.info.duration}&lnglat=${pos.lng},${pos.lat}&name=${name}`
      // );
      // const data = await res.json();
      // setBotMessage(data.reply)
      return result
    }
  }

  const handleSubwayPosOnly = async (pos, name, dist, dur, type, intervalNum) => {
    const currentPos = myPosRef.current; // 항상 최신값
    // const result = await getRoute({lat:currentPos[0], lng:currentPos[1]}, pos, routeAPIRef.current)
    setSavedPos(pos)
    // if (result) {
      // setRoute(result.coords);
      // setInfo(result.info);
      // console.log(result.info.distance, 'km,', result.info.duration, '분')

      console.log(pos, name, dist, dur, type, intervalNum)

    setInfoMessage(`${name}역\n거리: ${dist}km\n시간: ${dur}분\n방향: ${type}\n혼잡도: ${intervalNum}%`)

    const res = await fetch("http://localhost:8080/api/info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        distanceMeters: dist,
        timeMinutes: dur,
        latitude: pos.lat,
        longitude: pos.lng,
        stationName: name,
        direction:type,
        notes:'test',
        currentLocation:'서울',
        congestionLevel: intervalNum,
      }),
    });
    const data = await res.json();
    // console.log(data)
    setBotMessage(data.data.rawAnswer)
    
  }

  const handleRoute = async (start, end) => {
    console.log(routeAPIRef.current)
    const result = await getRoute(start, end, routeAPIRef.current);
    setSavedPos(end)
    if (result) {
      setRoute(result.coords);
      setInfo(result.info);
      console.log(result.info.distance, 'km,', result.info.duration, '분')
      const res = await fetch(
        `http://localhost:5000/info?distance=${result.info.distance}&time=${result.info.duration}&lnglat=${end.lng},${end.lat}`
      );
      const data = await res.json();
      setBotMessage(data.reply)
    }
  };

  useEffect(() => {

    document.body.style.overflow = "hidden"; // 스크롤 비활성화

  }, [])

  useEffect(() => {
    if (myPos && markers.length > 0) {
      const nearby = markers.filter((m) => {
        const dist = getDistanceFromLatLonInKm(myPos[0], myPos[1], m.lat, m.lng);
        return dist <= 1; // ✅ 5km 이내
      });

      console.log("📍 내 위치 기준 2km 이내 지하철역:");
      nearby.forEach((station) => {
        const dist = getDistanceFromLatLonInKm(myPos[0], myPos[1], station.lat, station.lng);
        console.log(`${station.name} (${station.ho}호선) - ${dist.toFixed(2)} km`);
      });
    }
  }, [myPos, markers]);

  useEffect(() => {
    // locations.csv 불러오기
    loadCSV("/locations.csv").then((data) => {
      const parsed = data
        .map((row) => ({
          name: row.name,
          lat: parseFloat(row.lat),
          lng: parseFloat(row.lng),
          ho: row.ho,
        }))
        .filter((row) => !isNaN(row.lat) && !isNaN(row.lng));
      setMarkers(parsed);
    });

    // time.csv 불러오기
    loadCSV("/time.csv").then((data) => {
      setSubwayData(data);
    });
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setMyPos([latitude, longitude]);
        },
        (err) => {
          console.error("위치 가져오기 실패:", err);
        }
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
    if ("geolocation" in navigator){
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (map && myPos) {
            try {
              const { latitude, longitude } = pos.coords;
              const latlng = [latitude, longitude]
              setMyPos(latlng)
              map.flyTo(myPos, 15.5, { duration: 1.5 });
              // if (savedPos) {
              //   handleRoute(
              //     { lat: latlng[0], lng: latlng[1] },
              //     savedPos
              //   )
              // }
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

  function ClickMyPos({ onLocation }) {
    useMapEvents({
      click(e) {
        onLocation([e.latlng.lat, e.latlng.lng])
      },
    });
    return null;
  }

  const handleSelectStation = (station) => {
    // setTargetStation(station)

    // 1️⃣ 지도 중심 이동
    // console.log(station.lat, station.lng)
    

    // 2️⃣ 팝업 열기 (ZoomMarkers에서 제공하는 openPopupByKey 사용)
    const key = `${station.name}-${station.ho}`;
    markersRef.current?.flyToAndOpen(key, station.lat, station.lng);
    // markersRef.current?.openPopupByKey(key);
  };

  const handleInfo = (time_, day_, routeapi_, maptype_) => {
    setSelectedTime(time_)
    setSelectedDay(day_)
    setselectedRouteAPI(routeapi_)
    setMapType(maptype_)
    // console.log("사이드바에서 받은 인포:", a,b,c,d);
  };

  return (
    <Box sx={{ position: "relative", height: "100vh", display: "flex" }}>
      {/* 사이드바 */}
      <SideMenu
        markers={markers}
        handleSelectStation={handleSelectStation}
        onChangeInfo={handleInfo}
      />



      <ChatWidget botMessage={botMessage} infoMessage={infoMessage} />

      {/* 지도 */}
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
        <TileLayer 
        key={tileUrls[mapType]}
        url={tileUrls[mapType]} 
        maxZoom={20} 
        minZoom={8.0}/>
        {/* <MapRefresher dependency={tileUrls[mapType]}/> */}

        {/* <ClickMyPos onLocation={setMyPos}/> */}
        {targetStation &&
          <>
            <FlyToLocation position={targetStation} />
          </>}
        {myPos && <FlyToLocation position={myPos} />}

        {myPos && <Marker position={myPos} icon={currentLocationIcon} />}
        {/* 지도 마커 찍기 보류 */}
        {/* <DestinationMarker /> */}
        {route.length > 0 && (
          <>
            <DynamicPolyline route={route} />
          </>
        )}


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

      {/* 카메라 제어 버튼 그룹 컴포넌트 */}
      <CameraControlBtnGroup
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCurrentLocation={handleCurrentLocation}
      />
    </Box>
  );
}

export default App;

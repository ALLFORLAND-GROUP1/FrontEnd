import { useState, useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, Polyline, WMSTileLayer } from "react-leaflet";
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
import { getWeather } from './modules/getWeather'
import CameraControlBtnGroup from './components/CameraControlBtnGroup/CameraControlBtnGroup';
import currentLocationIconUrl from "./assets/image/curLocation_marker.png";
import CongestionLegend from "./components/CongestionLegend/CongestionLegend";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import WeatherWidget from "./components/WeatherWidget/WeatherWidget";
dayjs.extend(utc)


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

  const today_ = dayjs();

  const [markers, setMarkers] = useState([]);
  const [myPos, setMyPos] = useState(null);
  const [subwayData, setSubwayData] = useState([]);

  // 초기값: 진짜 현재 시간 (예: 10:58)
  const [selectedTime, setSelectedTime] = useState(getCurrentTime);
  const [selectedDay, setSelectedDay] = useState(getDayType);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDate2, setSelectedDate2] = useState(today_);
  const [targetStation, setTargetStation] = useState(null);

  const [route, setRoute] = useState([]); // 경로 좌표 배열
  const [botMessage, setBotMessage] = useState(null); // 봇 메시지
  const [infoMessage, setInfoMessage] = useState(null); // 봇 메시지
  const [selectedRouteAPI, setselectedRouteAPI] = useState('gh');
  const [mapType, setMapType] = useState('normal');
  const [weatherData, setWeatherData] = useState(null); // 날씨 데이터
  const [weatherOpacity, setWeatherOpacity] = useState(0.35); // WMS 레이어 투명도
  const [weatherVisible, setWeatherVisible] = useState(true); // WMS 레이어 표시 여부

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
    loadCSV("http://localhost:8080/api/data/stations").then((data) => {
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
    const url = `http://localhost:8080/api/data/congestion/time?dayType=${selectedDay}&slotTime=${apiTime}`;

    console.log(`🔗 [혼잡도 API 요청]`);
    console.log(`   URL: ${url}`);
    console.log(`   파라미터: dayType=${selectedDay}, slotTime=${apiTime}`);
    console.log(`   화면시간: ${selectedTime} -> 요청시간: ${apiTime}`);

    loadCSV(url).then((data) => {
      console.log(`✅ [혼잡도 데이터 로드 완료] ${data.length}개 레코드`);
      if (data.length > 0) {
        console.log(`   샘플 데이터:`, data[0]);
      }
      setSubwayData(data);
    }).catch((error) => {
      console.error(`❌ [혼잡도 데이터 로드 실패]`, error);
      setSubwayData([]);
    });
  }, [selectedDay, selectedTime]);

  // 날씨 데이터 로딩
  useEffect(() => {
    if (!selectedDate || !selectedTime || !myPos) return;

    const fetchWeatherData = async () => {
      const result = await getWeather(selectedDate, selectedTime, myPos[0], myPos[1]);
      if (result) {
        setWeatherData(result);
        console.log('[날씨 조회 성공]', result);
      } else {
        console.log('[날씨 조회 실패]');
        setWeatherData(null);
      }
    };

    fetchWeatherData();
  }, [selectedDate, selectedTime, myPos]);


  const handleSubwayPos = async (pos, name) => {
    const currentPos = myPosRef.current; // 항상 최신값

    const result = await getRoute({ lat: currentPos[0], lng: currentPos[1] }, pos, routeAPIRef.current)
    if (result) {
      setRoute(result.coords);
      return result
    }
  }

  const handleSubwayPosOnly = async (pos, name, dist, dur, type, intervalNum) => {
    setInfoMessage(`${name}역\n거리: ${dist}km\n시간: ${dur}분\n방향: ${type}\n혼잡도: ${intervalNum}%`)
    try {
      // 날짜 포맷팅 (dayjs 객체를 YYYY-MM-DD 문자열로 변환)
      const formattedDate = selectedDate ?
        (typeof selectedDate === 'string' ? selectedDate : selectedDate.format('YYYY-MM-DD'))
        : new Date().toISOString().split('T')[0];

      // 시간 포맷팅 (HH:mm을 HH:mm:ss로 변환)
      const formattedTime = selectedTime ? `${selectedTime}:00` : new Date().toTimeString().split(' ')[0];

      console.log('[LLM API 요청 데이터]', { date: formattedDate, time: formattedTime });

      const res = await fetch("http://localhost:8080/api/info", {
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
          // TODO: 백엔드 DTO에 date, time 필드 추가 후 아래 주석 해제
          date: formattedDate,      // 날짜 (YYYY-MM-DD) - 백엔드에서 평일/토요일/일요일로 자동 변환
          time: formattedTime,      // 시간 (HH:mm:ss)
        }),
      });

      console.log(formattedDate)

      if (!res.ok) {
        console.error(`LLM API 응답 에러: ${res.status}`);
        const errorText = await res.text();
        console.error('에러 상세:', errorText);
        //setBotMessage("죄송합니다. 현재 AI 응답을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      const data = await res.json();

      if (data && data.data && data.data.rawAnswer) {
        setBotMessage(data.data.rawAnswer);
      } else {
        console.error("LLM 응답 형식 오류:", data);
        //setBotMessage("죄송합니다. 현재 AI 응답을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.");
      }
    } catch (e) {
      console.error("LLM 요청 실패:", e);
      //setBotMessage("죄송합니다. 현재 AI 응답을 생성할 수 없습니다. 잠시 후 다시 시도해주세요.");
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
    // 팝업 열기 (ZoomMarkers에서 제공하는 openPopupByKey 사용)
    const key = `${station.name}-${station.ho}`;
    markersRef.current?.flyToAndOpen(key, station.lat, station.lng);
  };

  // Sidebar에서 변경된 시간을 그대로 상태에 반영 (스냅 X)
  const handleInfo = (time_, day_, routeapi_, maptype_, date_) => {
    setSelectedTime(time_); // "10:58" 그대로 저장
    setSelectedDay(day_);
    setselectedRouteAPI(routeapi_);
    setMapType(maptype_);

    const date = new Date(date_.$d);
    const result = dayjs(date).utc().format("YYYY-MM-DDTHH:mm:ss.SSS[Z]");

    setSelectedDate(date_)
    setSelectedDate2(result)

  };

  const mergeDateAndTime = (dateStr, timeStr) => {
    const date = new Date(dateStr);           // ISO 날짜 파싱
    const [hours, minutes] = timeStr.split(":").map(Number);

    date.setHours(hours);
    date.setMinutes(minutes);
    date.setSeconds(0);
    date.setMilliseconds(0);

    return date.toISOString();
  };

  const wmsParams = useMemo(() => ({
    time: mergeDateAndTime(selectedDate2, selectedTime),
  }), [selectedDate2, selectedTime]);

  const wmsKey = `${mapType}-${selectedDate2}-${selectedTime}`;

  return (
    <Box sx={{ position: "relative", height: "100vh", display: "flex" }}>
      <SideMenu
        markers={markers}
        handleSelectStation={handleSelectStation}
        onChangeInfo={handleInfo}
        weatherOpacity={weatherOpacity}
        onWeatherOpacityChange={setWeatherOpacity}
        weatherVisible={weatherVisible}
        onWeatherVisibleChange={setWeatherVisible}
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
        {weatherVisible && (
          <WMSTileLayer
            url="http://43.203.150.74:8080/geoserver/weather/wms"
            layers="weather:rasters"
            format="image/png"
            transparent={true}
            opacity={weatherOpacity}
            overlay={true}
            updateWhenZooming={false}
            updateWhenIdle={true}
            tileSize={256}
            keepBuffer={4}
            params={wmsParams}
            key={wmsKey}
          />
        )}
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
      <WeatherWidget weatherData={weatherData} />
      <CameraControlBtnGroup
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCurrentLocation={handleCurrentLocation}
      />
    </Box>
  );
}

export default App;
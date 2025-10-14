import { useState, useEffect } from "react";
import {
  Box,
  Tooltip,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import SearchBox from "./searchbox";

export default function Sidebar({
  markers,
  handleSelectStation,
  onChangeInfo
}) {

  const getCurrentTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  function getDayType() {
    const today = new Date();
    const day = today.getDay(); 
    // 0: 일요일, 1: 월요일, ..., 5: 금요일, 6: 토요일

    if (day === 6) return "토요일";
    if (day >= 1 && day <= 5) return "평일"; 
    if (day === 0) return "일요일"; // 필요하면 추가
  }

  const [selectedTime, setSelectedTime] = useState(getCurrentTime);
  const [selectedDay, setSelectedDay] = useState(getDayType);
  const [selectedRouteAPI, setselectedRouteAPI] = useState('gh');
  const [mapType, setMapType] = useState('aerial');

  const [activeMenu, setActiveMenu] = useState(null); // 'time' | 'search' | 'menu' | null

  const toggleMenu = (menu) => {
    setActiveMenu((prev) => (prev === menu ? null : menu));
  };

  const getcurt = () => {
    setSelectedTime(getCurrentTime());
    setSelectedDay(getDayType())
  };

  useEffect(() => {
    onChangeInfo(selectedTime, selectedDay, selectedRouteAPI, mapType)
  }, [selectedTime, selectedDay, selectedRouteAPI, mapType]);
  
  return (
    <>
      <Box
        sx={{
          marginLeft: "50px",
          position: "absolute",
          top: 0,
          left: 0,
          width: 240,
          transform: activeMenu ? "translateX(0)" : "translateX(-100%)", // ✅ 핵심 변경
          height: "100%",
          background: "#e6e6e6ff",
          boxShadow: "2px 0 5px rgba(0,0,0,0.3)",
          transition: "transform 0.3s ease-in-out",
          p: 2,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          alignItems: activeMenu ? "flex-start" : "center", // ✅ 여기서도 변경
        }}
      >

        {activeMenu == "menu" && (
          <>
          <h3>메뉴</h3>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, width: '100%' }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>경로 API</InputLabel>
                <Select
                  value={selectedRouteAPI}
                  label="경로 API 선택"
                  onChange={(e) => setselectedRouteAPI(e.target.value)}
                  sx={{ height: 36, width: '100%', boxSizing: 'border-box' }}
                >
                  <MenuItem value="ors">OpenRouteService</MenuItem>
                  <MenuItem value="gh">GraphHopper</MenuItem>
                  <MenuItem value="tmap" disabled>TMAP</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, width: '100%' }}>
              <FormControl sx={{ flex: 1 }}>
                  <InputLabel>지도 유형</InputLabel>
                  <Select
                    value={mapType}
                    label="지도 유형"
                    onChange={(e) => setMapType(e.target.value)}
                    sx={{ height: 36, width: '100%', boxSizing: 'border-box' }}
                  >
                    <MenuItem value="normal">일반 지도</MenuItem>
                    <MenuItem value="aerial">위성 지도</MenuItem>
                  </Select>
                </FormControl>
              </Box>
          </>
        )}

        {activeMenu === "search" && (
          <>
          <h3>역 검색</h3>
          <SearchBox markers={markers} onSelect={handleSelectStation} />
          </>
        )}

        {activeMenu === "time" && (
          <Box sx={{ mb: 2, width: '100%' }}>
            {/* 요일 선택 */}
            <h3>시간 선택</h3>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, width: '100%' }}>
              <FormControl sx={{ flex: 1 }}>
                <InputLabel>요일 선택</InputLabel>
                <Select
                  value={selectedDay}
                  label="요일 선택"
                  onChange={(e) => setSelectedDay(e.target.value)}
                  sx={{ height: 36, width: '100%', boxSizing: 'border-box' }}
                >
                  <MenuItem value="평일">평일</MenuItem>
                  <MenuItem value="토요일">토요일</MenuItem>
                  <MenuItem value="일요일">일요일</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* 시간 선택 + 버튼 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, width: '100%' }}>
              <TextField
                label="시간 선택"
                type="time"
                value={selectedTime}
                onChange={(e) => setSelectedTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 300 }}
                sx={{
                  flex: 1,
                  '& input': {
                    padding: '4px 8px',
                    height: 36,
                    boxSizing: 'border-box',
                  },
                }}
              />
              <Tooltip title="현재 시간으로 설정" arrow>
              <IconButton
                onClick={getcurt}
                color="primary"
                sx={{
                  width: 36,
                  height: 36,
                  p: 0,
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  flexShrink: 0, // ✅ 버튼은 크기 고정
                }}
              >
                <AccessTimeIcon sx={{ fontSize: 22 }} />
              </IconButton>
              </Tooltip>
            </Box>
          </Box>
        )}
        
      </Box>

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 20,
          height: "100%",
          background: "#555555ff",
          boxShadow: "2px 0 5px rgba(0,0,0,0.3)",
          p: 2,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
        }}
      >
       <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            mt: 0,
            mb: 1,
          }}
        >
          <Tooltip title="메뉴" placement="right">
            <IconButton
              sx={{ color: 'white' }}
              onClick={() => toggleMenu("menu")}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="시간 선택" placement="right">
            <IconButton
              sx={{ color: 'white' }}
              onClick={() => toggleMenu("time")}
            >
              <AccessTimeIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="역 검색" placement="right">
            <IconButton
              sx={{ color: 'white' }}
              onClick={() => toggleMenu("search")}
            >
              <SearchIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      </>
  );
};

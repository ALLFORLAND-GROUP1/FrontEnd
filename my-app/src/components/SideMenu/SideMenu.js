import { useState, useEffect } from "react";
import {
    Box,
    Tooltip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField,
    IconButton,
    List,
    ListItem,
    Typography,
    Divider,
    Avatar,
    Drawer,
    Card,
    CardContent
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SearchBox from "../../modules/searchbox";
import {
    StyledSideMenu,
    LogoContainer,
    MenuItemButton,
    MenuIcon as StyledMenuIcon,
    MenuText,
} from "./SideMenuStyle";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import 'dayjs/locale/ko'

export default function SideMenu({
    markers,
    handleSelectStation,
    onChangeInfo,
    weatherOpacity,
    onWeatherOpacityChange,
    weatherVisible,
    onWeatherVisibleChange
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

        if (day === 6) return "토요일";
        if (day >= 1 && day <= 5) return "평일";
        if (day === 0) return "일요일";
    }

    function getDayTypeEn(date_) {
        if (date_ == 'Sunday') return "일요일"
        if (date_ == 'Saturday') return "토요일"
        return "평일"
    }

    const today = dayjs();
    const oneWeekLater = today.add(6, "day");

    const [selectedTime, setSelectedTime] = useState(getCurrentTime);
    const [selectedDay, setSelectedDay] = useState(getDayType);
    const [selectedRouteAPI, setselectedRouteAPI] = useState('gh');
    const [mapType, setMapType] = useState('normal');
    const [selectedDate, setSelectedDate] = useState(today);

    const [activeMenu, setActiveMenu] = useState(null); // 'time' | 'search' | 'menu' | null

    const toggleMenu = (menu) => {
        setActiveMenu((prev) => (prev === menu ? null : menu));
    };

    const getcurt = () => {
        setSelectedTime(getCurrentTime());
        setSelectedDay(getDayType())
    };

    useEffect(() => {
        onChangeInfo(selectedTime, selectedDay, selectedRouteAPI, mapType, selectedDate)
    }, [selectedTime, selectedDay, selectedRouteAPI, mapType, selectedDate]);

    // 메뉴 아이템 정의
    const menuItems = [
        {
            id: 'menu',
            label: '맵 설정',
            icon: <MenuIcon />,
            description: '지도 및 경로 API 설정',
        },
        {
            id: 'time',
            label: '시간 선택',
            icon: <AccessTimeIcon />,
            description: '시간 및 요일 설정',
        },
        {
            id: 'search',
            label: '역 검색',
            icon: <SearchIcon />,
            description: '역 이름으로 검색',
        },
    ];
    return (
        <>
            {/* 메인 사이드바 */}
            <StyledSideMenu>
                {/* 로고 영역 */}
                <LogoContainer>
                    <Avatar
                        src="/assets/react.svg"
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'rgba(255, 255, 255, 0.95)',
                            fontSize: '22px',
                            fontWeight: 'bold',
                            mb: 1.5,
                            border: '3px solid rgba(93, 173, 226, 0.35)',
                            color: '#000000',
                        }}
                    />
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '13px',
                            fontWeight: 600,
                            textAlign: 'center',
                            lineHeight: 1.3,
                            letterSpacing: '0.03em',
                            color: 'rgba(255, 255, 255, 0.98)',
                            textShadow: '0 2px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
                        }}
                    >
                        지하철 탑승
                        <br />
                        만족도 분석
                    </Typography>
                </LogoContainer>

                <Divider
                    sx={{
                        width: '65%',
                        mb: 2,
                        bgcolor: 'rgba(255, 255, 255, 0.6)',
                        height: '2.5px',
                        borderRadius: '2px',
                    }}
                />

                {/* 메인 메뉴 리스트 */}
                <List sx={{ width: '100%', px: 0, flex: 1, py: 0.5 }}>
                    {menuItems.map(item => (
                        <ListItem key={item.id} disablePadding>
                            <Tooltip
                                title={item.description}
                                placement="right"
                                arrow
                                enterDelay={600}
                                slotProps={{
                                    tooltip: {
                                        sx: {
                                            bgcolor: 'rgba(50, 50, 50, 0.95)',
                                            fontSize: '13px',
                                            fontWeight: 500,
                                            padding: '8px 14px',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                                        },
                                    },
                                    arrow: {
                                        sx: {
                                            color: 'rgba(50, 50, 50, 0.95)',
                                        },
                                    },
                                }}
                            >
                                <MenuItemButton
                                    disableRipple
                                    active={activeMenu === item.id}
                                    onClick={() => toggleMenu(item.id)}
                                >
                                    <StyledMenuIcon active={activeMenu === item.id}>
                                        {item.icon}
                                    </StyledMenuIcon>
                                    <MenuText active={activeMenu === item.id} primary={item.label} />
                                </MenuItemButton>
                            </Tooltip>
                        </ListItem>
                    ))}
                </List>


            </StyledSideMenu>

            {/* 맵 설정 사이드바 */}
            <Drawer
                anchor="left"
                open={activeMenu === 'menu'}
                onClose={() => setActiveMenu(null)}
                hideBackdrop={true}
                variant="persistent"
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 380,
                        maxWidth: '90vw',
                        left: '90px',
                        height: '100vh',
                        position: 'fixed',
                        zIndex: 1100,
                        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.08)',
                        backgroundColor: '#f8fafc',
                        borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                    },
                }}
            >
                {/* 메뉴 타이틀 헤더 */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        bgcolor: 'white'
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <MenuIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem' }}>
                            맵 설정
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setActiveMenu(null)} size="small">
                        <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* 사이드바 컨텐츠 */}
                <Box sx={{ p: 3, overflowY: 'auto', height: 'calc(100vh - 70px)' }}>
                    {/* 경로 API */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                            경로 API
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={selectedRouteAPI}
                                onChange={(e) => setselectedRouteAPI(e.target.value)}
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: '8px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(0,0,0,0.1)'
                                    }
                                }}
                            >
                                <MenuItem value="ors">OpenRouteService</MenuItem>
                                <MenuItem value="gh">GraphHopper</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* 지도 유형 */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                            지도 유형
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={mapType}
                                onChange={(e) => setMapType(e.target.value)}
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: '8px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(0,0,0,0.1)'
                                    }
                                }}
                            >
                                <MenuItem value="normal">일반 지도</MenuItem>
                                <MenuItem value="aerial">위성 지도</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* 날씨 레이어 투명도 */}
                    <Box>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 700, color: '#1e293b', fontSize: '0.95rem' }}>
                            날씨 레이어 투명도
                        </Typography>
                        <Box sx={{
                            p: 2.5,
                            bgcolor: 'white',
                            borderRadius: '12px',
                            border: '1px solid rgba(0,0,0,0.08)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 600 }}>
                                        투명도
                                    </Typography>
                                    <Typography variant="body1" sx={{ color: '#1976d2', fontWeight: 700, fontSize: '1.1rem' }}>
                                        {Math.round(weatherOpacity * 100)}%
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => onWeatherVisibleChange(!weatherVisible)}
                                    size="small"
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: weatherVisible ? 'rgba(25, 118, 210, 0.08)' : 'rgba(148, 163, 184, 0.08)',
                                        color: weatherVisible ? '#1976d2' : '#94a3b8',
                                        '&:hover': {
                                            bgcolor: weatherVisible ? 'rgba(25, 118, 210, 0.15)' : 'rgba(148, 163, 184, 0.15)'
                                        }
                                    }}
                                >
                                    {weatherVisible ? <VisibilityIcon sx={{ fontSize: 20 }} /> : <VisibilityOffIcon sx={{ fontSize: 20 }} />}
                                </IconButton>
                            </Box>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={weatherOpacity * 100}
                                onChange={(e) => onWeatherOpacityChange(e.target.value / 100)}
                                disabled={!weatherVisible}
                                style={{
                                    width: '100%',
                                    height: '8px',
                                    background: weatherVisible
                                        ? `linear-gradient(to right, #1976d2 0%, #1976d2 ${weatherOpacity * 100}%, #e2e8f0 ${weatherOpacity * 100}%, #e2e8f0 100%)`
                                        : '#e2e8f0',
                                    borderRadius: '6px',
                                    outline: 'none',
                                    cursor: weatherVisible ? 'pointer' : 'not-allowed',
                                    opacity: weatherVisible ? 1 : 0.4,
                                    WebkitAppearance: 'none',
                                    appearance: 'none'
                                }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5 }}>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>투명</Typography>
                                <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.75rem' }}>불투명</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </Drawer>

            {/* 역 검색 사이드바 */}
            <Drawer
                anchor="left"
                open={activeMenu === 'search'}
                onClose={() => setActiveMenu(null)}
                hideBackdrop={true}
                variant="persistent"
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 380,
                        maxWidth: '90vw',
                        left: '90px',
                        height: '100vh',
                        position: 'fixed',
                        zIndex: 1100,
                        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.08)',
                        backgroundColor: '#f8fafc',
                        borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                    },
                }}
            >
                {/* 메뉴 타이틀 헤더  */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        bgcolor: 'white'
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <SearchIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem' }}>
                            역 검색
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setActiveMenu(null)} size="small">
                        <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* 사이드바 컨텐츠 */}
                <Box sx={{ p: 3 }}>
                    <SearchBox markers={markers} onSelect={handleSelectStation} />
                </Box>
            </Drawer>

            {/* 시간 선택 사이드바 */}
            <Drawer
                anchor="left"
                open={activeMenu === 'time'}
                onClose={() => setActiveMenu(null)}
                hideBackdrop={true}
                variant="persistent"
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 380,
                        maxWidth: '90vw',
                        left: '90px',
                        height: '100vh',
                        position: 'fixed',
                        zIndex: 1100,
                        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.08)',
                        backgroundColor: '#f8fafc',
                        borderRight: '1px solid rgba(0, 0, 0, 0.08)',
                    },
                }}
            >
                {/* 메뉴 타이틀 헤더  */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '18px 24px',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                        bgcolor: 'white'
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <AccessTimeIcon sx={{ color: '#1976d2', fontSize: 22 }} />
                        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.05rem' }}>
                            시간 선택
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setActiveMenu(null)} size="small">
                        <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* 사이드바 컨텐츠 */}
                <Box sx={{ p: 3, overflowY: 'auto', height: 'calc(100vh - 70px)' }}>
                    {/* 날짜 선택 */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#334155' }}>
                            날짜 선택
                        </Typography>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                            <DatePicker
                                value={selectedDate}
                                onChange={(newValue) => {
                                    setSelectedDate(newValue)
                                    setSelectedDay(getDayTypeEn(newValue.format("dddd")))
                                }}
                                minDate={today}
                                maxDate={oneWeekLater}
                                format="YYYY-MM-DD"
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        size: 'small',
                                        sx: {
                                            bgcolor: 'white',
                                            borderRadius: '8px',
                                            '& .MuiOutlinedInput-notchedOutline': {
                                                borderColor: 'rgba(0,0,0,0.1)'
                                            }
                                        }
                                    }
                                }}
                            />
                        </LocalizationProvider>
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* 시간 선택 */}
                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600, color: '#334155' }}>
                            시간 선택
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5 }}>
                            <TextField
                                type="time"
                                value={selectedTime}
                                onChange={(e) => setSelectedTime(e.target.value)}
                                fullWidth
                                size="small"
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ step: 300 }}
                                sx={{
                                    bgcolor: 'white',
                                    borderRadius: '8px',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(0,0,0,0.1)'
                                    }
                                }}
                            />
                            <IconButton
                                onClick={() => {
                                    getcurt()
                                    setSelectedDate(today)
                                }}
                                sx={{
                                    bgcolor: 'white',
                                    border: '1px solid rgba(0,0,0,0.1)',
                                    borderRadius: '8px',
                                    width: 40,
                                    height: 40,
                                    '&:hover': {
                                        bgcolor: 'rgba(25, 118, 210, 0.04)'
                                    }
                                }}
                            >
                                <AccessTimeIcon sx={{ fontSize: 20, color: '#1976d2' }} />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </Drawer>
        </>
    );
}

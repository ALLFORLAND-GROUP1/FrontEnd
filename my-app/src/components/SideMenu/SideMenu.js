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
    CardContent,
    Stack,
    Slider
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SearchIcon from "@mui/icons-material/Search";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AltRouteIcon from "@mui/icons-material/AltRoute";
import LayersIcon from "@mui/icons-material/Layers";
import OpacityIcon from "@mui/icons-material/Opacity";
import EventNoteIcon from "@mui/icons-material/EventNote";
import WatchLaterIcon from "@mui/icons-material/WatchLater";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import SearchBox from "../../modules/searchbox";
import IconBox from "./IconBox";
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
            label: '시점 설정',
            icon: <EventNoteIcon />,
            description: '날짜 및 시간 설정',
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
                        left: '100px',
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
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <IconBox width={36} height={36}>
                            <MenuIcon sx={{ fontSize: 20 }} />
                        </IconBox>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.3px' }}>
                            맵 설정
                        </Typography>
                    </Stack>
                    <IconButton onClick={() => setActiveMenu(null)} size="small">
                        <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* 사이드바 컨텐츠 */}
                <Box sx={{ p: 3, overflowY: 'auto', height: 'calc(100vh - 70px)' }}>
                    {/* 경로 API */}
                    <Card sx={{
                        mb: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        borderRadius: '16px',
                        border: '1px solid rgba(16, 185, 129, 0.12)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)'
                    }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                <IconBox width={40} height={40} bgcolor="#10b981">
                                    <AltRouteIcon sx={{ fontSize: 22 }} />
                                </IconBox>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', lineHeight: 1.3 }}>
                                    경로 API
                                </Typography>
                            </Stack>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={selectedRouteAPI}
                                    onChange={(e) => setselectedRouteAPI(e.target.value)}
                                    sx={{
                                        bgcolor: 'white',
                                        borderRadius: '10px',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(16, 185, 129, 0.2)'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(16, 185, 129, 0.4)'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#10b981'
                                        }
                                    }}
                                >
                                    <MenuItem value="ors">OpenRouteService</MenuItem>
                                    <MenuItem value="gh">GraphHopper</MenuItem>
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>                    {/* 지도 유형 */}
                    <Card sx={{
                        mb: 2.5,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        borderRadius: '16px',
                        border: '1px solid rgba(139, 92, 246, 0.12)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #faf5ff 100%)'
                    }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                <IconBox width={40} height={40} bgcolor="#8b5cf6">
                                    <LayersIcon sx={{ fontSize: 22 }} />
                                </IconBox>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', lineHeight: 1.3 }}>
                                    지도 유형
                                </Typography>
                            </Stack>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={mapType}
                                    onChange={(e) => setMapType(e.target.value)}
                                    sx={{
                                        bgcolor: 'white',
                                        borderRadius: '10px',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(139, 92, 246, 0.2)'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(139, 92, 246, 0.4)'
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#8b5cf6'
                                        }
                                    }}
                                >
                                    <MenuItem value="normal">일반 지도</MenuItem>
                                    <MenuItem value="aerial">위성 지도</MenuItem>
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>                    {/* 날씨 레이어 투명도 */}
                    <Card sx={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        borderRadius: '16px',
                        border: '1px solid rgba(59, 130, 246, 0.12)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)'
                    }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
                                <IconBox width={40} height={40} bgcolor="#3b82f6">
                                    <OpacityIcon sx={{ fontSize: 22 }} />
                                </IconBox>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', lineHeight: 1.3 }}>
                                        날씨 레이어 시각화
                                    </Typography>
                                </Box>
                                <IconButton
                                    onClick={() => onWeatherVisibleChange(!weatherVisible)}
                                    size="small"
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: weatherVisible ? 'rgba(59, 130, 246, 0.1)' : 'rgba(148, 163, 184, 0.08)',
                                        color: weatherVisible ? '#3b82f6' : '#94a3b8',
                                        '&:hover': {
                                            bgcolor: weatherVisible ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.15)'
                                        }
                                    }}
                                >
                                    {weatherVisible ? <VisibilityIcon sx={{ fontSize: 20 }} /> : <VisibilityOffIcon sx={{ fontSize: 20 }} />}
                                </IconButton>
                            </Stack>

                            {/* 날씨 온도 범례 */}
                            <Box sx={{
                                mb: 2.5,
                                p: 2,
                                bgcolor: 'rgba(59, 130, 246, 0.04)',
                                borderRadius: '12px',
                                border: '1px solid rgba(59, 130, 246, 0.12)'
                            }}>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        display: 'block',
                                        mb: 1.5,
                                        color: '#64748b',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}
                                >
                                    온도 범례 (°C)
                                </Typography>
                                <Box sx={{
                                    height: 14,
                                    borderRadius: '8px',
                                    background: 'linear-gradient(to right, #000080 0%, #00C0FF 16.67%, #40FFFF 33.33%, #FFFF00 50%, #FF5000 66.67%, #FF0000 83.33%, #600000 100%)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3)',
                                    mb: 1.5,
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        height: '50%',
                                        background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
                                        borderRadius: '8px 8px 0 0',
                                    }
                                }} />
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    px: 0.5
                                }}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>-10</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>-5</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>0</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>5</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>10</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>15</Typography>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 700 }}>20</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ position: 'relative', px: 1 }}>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    mb: 1
                                }}>
                                    <Typography variant="caption" sx={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
                                        투명도
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            color: '#3b82f6',
                                            fontSize: '0.85rem',
                                            fontWeight: 700,
                                            bgcolor: 'rgba(59, 130, 246, 0.08)',
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: '8px'
                                        }}
                                    >
                                        {Math.round(weatherOpacity * 100)}%
                                    </Typography>
                                </Box>
                                <Slider
                                    value={weatherOpacity * 100}
                                    onChange={(e, newValue) => onWeatherOpacityChange(newValue / 100)}
                                    disabled={!weatherVisible}
                                    min={0}
                                    max={100}
                                    sx={{
                                        color: '#3b82f6',
                                        height: 6,
                                        '& .MuiSlider-track': {
                                            border: 'none',
                                            background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)'
                                        },
                                        '& .MuiSlider-rail': {
                                            opacity: 0.3,
                                            bgcolor: '#cbd5e1'
                                        },
                                        '& .MuiSlider-thumb': {
                                            width: 20,
                                            height: 20,
                                            bgcolor: '#fff',
                                            border: '3px solid #3b82f6',
                                            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                            '&:hover': {
                                                boxShadow: '0 0 0 8px rgba(59, 130, 246, 0.16)'
                                            },
                                            '&.Mui-active': {
                                                boxShadow: '0 0 0 12px rgba(59, 130, 246, 0.16)'
                                            }
                                        },
                                        '&.Mui-disabled': {
                                            color: '#cbd5e1',
                                            '& .MuiSlider-thumb': {
                                                border: '3px solid #cbd5e1'
                                            }
                                        }
                                    }}
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>투명</Typography>
                                    <Typography variant="caption" sx={{ color: '#94a3b8', fontSize: '0.7rem' }}>불투명</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
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
                        left: '100px',
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
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <IconBox width={36} height={36}>
                            <SearchIcon sx={{ fontSize: 20 }} />
                        </IconBox>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.3px' }}>
                            역 검색
                        </Typography>
                    </Stack>
                    <IconButton onClick={() => setActiveMenu(null)} size="small">
                        <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* 사이드바 컨텐츠 */}
                <Box sx={{ p: 3, overflowY: 'auto', height: 'calc(100vh - 70px)' }}>
                    <Card sx={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        borderRadius: '16px',
                        border: '1px solid rgba(59, 130, 246, 0.12)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)'
                    }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2.5 }}>
                                <IconBox width={40} height={40} bgcolor="#3b82f6">
                                    <LocationOnIcon sx={{ fontSize: 22 }} />
                                </IconBox>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', lineHeight: 1.3 }}>
                                    역 이름 검색
                                </Typography>
                            </Stack>
                            <SearchBox markers={markers} onSelect={handleSelectStation} />
                        </CardContent>
                    </Card>
                </Box>
            </Drawer>

            {/* 일정 설정 사이드바 */}
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
                        left: '100px',
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
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                        <IconBox width={36} height={36}>
                            <EventNoteIcon sx={{ fontSize: 20 }} />
                        </IconBox>
                        <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '0.3px' }}>
                            시점 설정
                        </Typography>
                    </Stack>
                    <IconButton onClick={() => setActiveMenu(null)} size="small">
                        <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                </Box>

                {/* 사이드바 컨텐츠 */}
                <Box sx={{ p: 3, overflowY: 'auto', height: 'calc(100vh - 70px)' }}>
                    {/* 날짜 선택 */}
                    <Card sx={{
                        mb: 3,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        borderRadius: '16px',
                        border: '1px solid rgba(236, 72, 153, 0.12)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #fdf2f8 100%)'
                    }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                <IconBox width={40} height={40} bgcolor="#ec4899">
                                    <EventNoteIcon sx={{ fontSize: 22 }} />
                                </IconBox>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', lineHeight: 1.3 }}>
                                    날짜 선택
                                </Typography>
                            </Stack>
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
                                                borderRadius: '10px',
                                                '& .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(236, 72, 153, 0.2)'
                                                },
                                                '&:hover .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: 'rgba(236, 72, 153, 0.4)'
                                                },
                                                '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                    borderColor: '#ec4899'
                                                }
                                            }
                                        }
                                    }}
                                />
                            </LocalizationProvider>
                        </CardContent>
                    </Card>                    {/* 시간 선택 */}
                    <Card sx={{
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        borderRadius: '16px',
                        border: '1px solid rgba(6, 182, 212, 0.12)',
                        background: 'linear-gradient(135deg, #ffffff 0%, #ecfeff 100%)'
                    }}>
                        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
                            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                                <IconBox width={40} height={40} bgcolor="#06b6d4">
                                    <WatchLaterIcon sx={{ fontSize: 22 }} />
                                </IconBox>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#0f172a', fontSize: '1rem', lineHeight: 1.3 }}>
                                    시간 선택
                                </Typography>
                            </Stack>
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
                                        borderRadius: '10px',
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(6, 182, 212, 0.2)'
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                            borderColor: 'rgba(6, 182, 212, 0.4)'
                                        },
                                        '& .Mui-focused .MuiOutlinedInput-notchedOutline': {
                                            borderColor: '#06b6d4'
                                        }
                                    }}
                                />
                                <Tooltip title="현재 시간" placement="top" arrow>
                                    <IconButton
                                        onClick={() => {
                                            getcurt()
                                            setSelectedDate(today)
                                        }}
                                        sx={{
                                            bgcolor: 'rgba(6, 182, 212, 0.1)',
                                            border: '1px solid rgba(6, 182, 212, 0.2)',
                                            borderRadius: '10px',
                                            width: 40,
                                            height: 40,
                                            color: '#06b6d4',
                                            '&:hover': {
                                                bgcolor: 'rgba(6, 182, 212, 0.2)'
                                            }
                                        }}
                                    >
                                        <WatchLaterIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Drawer>
        </>
    );
}

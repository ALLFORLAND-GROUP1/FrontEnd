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
import SearchBox from "../../modules/searchbox";
import {
    StyledSideMenu,
    LogoContainer,
    MenuItemButton,
    MenuIcon as StyledMenuIcon,
    MenuText,
} from "./SideMenuStyle";

export default function SideMenu({
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

        if (day === 6) return "토요일";
        if (day >= 1 && day <= 5) return "평일";
        if (day === 0) return "일요일";
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
                        지하철
                        <br />
                        혼잡도 분석
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
                        width: 420,
                        maxWidth: '90vw',
                        left: '105px',
                        height: '100vh',
                        position: 'fixed',
                        zIndex: 1100,
                        boxShadow: '3px 0 15px rgba(0, 0, 0, 0.08)',
                        backgroundColor: 'rgba(248, 250, 252, 0.98)',
                        backdropFilter: 'blur(12px)',
                        borderRight: '2px solid rgba(0, 0, 0, 0.06)',
                    },
                }}
            >
                {/* 메뉴 타이틀 헤더 */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderBottom: '2px solid rgba(0, 0, 0, 0.06)',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <MenuIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            지도 및 경로 설정
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setActiveMenu(null)} size="small">
                        <ArrowBackIosNewIcon />
                    </IconButton>
                </Box>

                {/* 사이드바 컨텐츠 */}
                <Box sx={{ p: 2 }}>
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                경로 API
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel>경로 API 선택</InputLabel>
                                <Select
                                    value={selectedRouteAPI}
                                    label="경로 API 선택"
                                    onChange={(e) => setselectedRouteAPI(e.target.value)}
                                    sx={{ height: 48 }}
                                >
                                    <MenuItem value="ors">OpenRouteService</MenuItem>
                                    <MenuItem value="gh">GraphHopper</MenuItem>
                                    <MenuItem value="tmap" disabled>TMAP</MenuItem>
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                지도 유형
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel>지도 유형</InputLabel>
                                <Select
                                    value={mapType}
                                    label="지도 유형"
                                    onChange={(e) => setMapType(e.target.value)}
                                    sx={{ height: 48 }}
                                >
                                    <MenuItem value="normal">일반 지도</MenuItem>
                                    <MenuItem value="aerial">위성 지도</MenuItem>
                                </Select>
                            </FormControl>
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
                        width: 420,
                        maxWidth: '90vw',
                        left: '105px',
                        height: '100vh',
                        position: 'fixed',
                        zIndex: 1100,
                        boxShadow: '3px 0 15px rgba(0, 0, 0, 0.08)',
                        backgroundColor: 'rgba(248, 250, 252, 0.98)',
                        backdropFilter: 'blur(12px)',
                        borderRight: '2px solid rgba(0, 0, 0, 0.06)',
                    },
                }}
            >
                {/* 메뉴 타이틀 헤더  */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderBottom: '2px solid rgba(0, 0, 0, 0.06)',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <SearchIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            역 검색
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setActiveMenu(null)} size="small">
                        <ArrowBackIosNewIcon />
                    </IconButton>
                </Box>

                {/* 사이드바 컨텐츠 */}
                <Box sx={{ p: 2 }}>
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
                        width: 420,
                        maxWidth: '90vw',
                        left: '105px',
                        height: '100vh',
                        position: 'fixed',
                        zIndex: 1100,
                        boxShadow: '3px 0 15px rgba(0, 0, 0, 0.08)',
                        backgroundColor: 'rgba(248, 250, 252, 0.98)',
                        backdropFilter: 'blur(12px)',
                        borderRight: '2px solid rgba(0, 0, 0, 0.06)',
                    },
                }}
            >
                {/* 메뉴 타이틀 헤더  */}
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        borderBottom: '2px solid rgba(0, 0, 0, 0.06)',
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <AccessTimeIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                            시간 선택
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setActiveMenu(null)} size="small">
                        <ArrowBackIosNewIcon />
                    </IconButton>
                </Box>

                {/* 사이드바 컨텐츠 */}
                <Box sx={{ p: 2 }}>
                    <Card sx={{ mb: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                요일 선택
                            </Typography>
                            <FormControl fullWidth>
                                <InputLabel>요일 선택</InputLabel>
                                <Select
                                    value={selectedDay}
                                    label="요일 선택"
                                    onChange={(e) => setSelectedDay(e.target.value)}
                                    sx={{ height: 48 }}
                                >
                                    <MenuItem value="평일">평일</MenuItem>
                                    <MenuItem value="토요일">토요일</MenuItem>
                                    <MenuItem value="일요일">일요일</MenuItem>
                                </Select>
                            </FormControl>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                시간 선택
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                    label="시간 선택"
                                    type="time"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    inputProps={{ step: 300 }}
                                    sx={{ flex: 1 }}
                                />
                                <Tooltip title="현재 시간으로 설정" arrow>
                                    <IconButton
                                        onClick={getcurt}
                                        color="primary"
                                        sx={{
                                            width: 48,
                                            height: 48,
                                            border: '1px solid #ccc',
                                            borderRadius: '8px',
                                            flexShrink: 0,
                                        }}
                                    >
                                        <AccessTimeIcon sx={{ fontSize: 24 }} />
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

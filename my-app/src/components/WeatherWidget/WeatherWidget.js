import { Box, Paper, Typography, IconButton, Chip } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import OpacityIcon from "@mui/icons-material/Opacity";
import AirIcon from "@mui/icons-material/Air";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import MinimizeIcon from "@mui/icons-material/Minimize";
import { useState } from "react";

// 날씨 상태에 따른 아이콘 매핑
const getWeatherIcon = (weather, isMinimized = false) => {
    const iconSize = isMinimized ? 28 : 28;
    const iconColor = isMinimized ? '#3b82f6' : '#ffffff';

    if (!weather) return <WbSunnyIcon sx={{ fontSize: iconSize, color: iconColor }} />;

    const condition = weather.toLowerCase();
    if (condition.includes('rain') || condition.includes('비')) {
        return <OpacityIcon sx={{ fontSize: iconSize, color: iconColor }} />;
    } else if (condition.includes('cloud') || condition.includes('구름')) {
        return <CloudIcon sx={{ fontSize: iconSize, color: iconColor }} />;
    } else {
        return <WbSunnyIcon sx={{ fontSize: iconSize, color: iconColor }} />;
    }
};

export default function WeatherWidget({ weatherData }) {
    const [isOpen, setIsOpen] = useState(true);

    if (!weatherData) {
        return null;
    }

    // 축소된 버튼 상태
    if (!isOpen) {
        return (
            <Box
                sx={{
                    position: "fixed",
                    top: 100,
                    right: 24,
                    zIndex: 1000,
                }}
            >
                <IconButton
                    onClick={() => setIsOpen(true)}
                    sx={{
                        width: 56,
                        height: 56,
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        borderRadius: "12px",
                        "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 1)",
                        }
                    }}
                >
                    {getWeatherIcon(weatherData.weather, true)}
                </IconButton>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                position: "fixed",
                top: 20,
                right: 24,
                zIndex: 1000,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    width: 260,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    borderRadius: "12px",
                    overflow: 'hidden'
                }}
            >
                {/* 헤더 */}
                <Box
                    sx={{
                        background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)",
                        px: 2.5,
                        py: 1.8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            {getWeatherIcon(weatherData.weather)}
                        </Box>
                        <Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: 'white',
                                    lineHeight: 1.2,
                                    fontSize: '0.9rem'
                                }}
                            >
                                현재 날씨
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'rgba(255,255,255,0.85)',
                                    fontSize: '0.7rem',
                                    fontWeight: 500
                                }}
                            >
                                실시간 기상 정보
                            </Typography>
                        </Box>
                    </Box>
                    <IconButton
                        onClick={() => setIsOpen(false)}
                        size="small"
                        sx={{
                            color: 'white',
                            bgcolor: 'rgba(255,255,255,0.2)',
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.3)',
                            }
                        }}
                    >
                        <MinimizeIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* 메인 온도 표시 */}
                {weatherData.temperature && (
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            py: 2.5,
                            background: 'linear-gradient(to bottom, rgba(96,165,250,0.1) 0%, transparent 100%)'
                        }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 700,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: 1,
                                mb: 1,
                                fontSize: '2.8rem'
                            }}
                        >
                            {weatherData.temperature}°
                        </Typography>
                        {weatherData.weather && (
                            <Chip
                                label={weatherData.weather}
                                size="small"
                                sx={{
                                    fontWeight: 600,
                                    bgcolor: 'rgba(59, 130, 246, 0.1)',
                                    color: '#2563eb',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    fontSize: '0.7rem',
                                    height: '24px'
                                }}
                            />
                        )}
                    </Box>
                )}

                {/* 상세 정보 그리드 */}
                <Box sx={{ px: 2.5, pb: 2.5 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                        {weatherData.feelsLike && (
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: '10px',
                                    bgcolor: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.15)',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.4 }}>
                                    <ThermostatIcon sx={{ fontSize: 18, color: '#ef4444' }} />
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }}>
                                        체감온도
                                    </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>
                                    {weatherData.feelsLike}°C
                                </Typography>
                            </Box>
                        )}

                        {weatherData.humidity && (
                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: '10px',
                                    bgcolor: 'rgba(59, 130, 246, 0.08)',
                                    border: '1px solid rgba(59, 130, 246, 0.15)',
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.4 }}>
                                    <OpacityIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, fontSize: '0.7rem' }}>
                                        습도
                                    </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem' }}>
                                    {weatherData.humidity}%
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* 날짜/시간 정보 */}
                    {weatherData.date && weatherData.time && (
                        <Box
                            sx={{
                                mt: 2.5,
                                pt: 2.5,
                                borderTop: '1px solid rgba(0,0,0,0.06)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 1.5
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.7,
                                    px: 1.5,
                                    py: 0.8,
                                    borderRadius: '8px',
                                    bgcolor: 'rgba(99, 102, 241, 0.08)',
                                    border: '1px solid rgba(99, 102, 241, 0.15)'
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: '#6366f1'
                                    }}
                                >
                                    📅
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: '#475569'
                                    }}
                                >
                                    {weatherData.date}
                                </Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.7,
                                    px: 1.5,
                                    py: 0.8,
                                    borderRadius: '8px',
                                    bgcolor: 'rgba(59, 130, 246, 0.08)',
                                    border: '1px solid rgba(59, 130, 246, 0.15)'
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: '#3b82f6'
                                    }}
                                >
                                    🕐
                                </Typography>
                                <Typography
                                    sx={{
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        color: '#475569'
                                    }}
                                >
                                    {weatherData.time}
                                </Typography>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

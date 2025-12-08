import { Box, Paper, Typography, IconButton, Chip } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import OpacityIcon from "@mui/icons-material/Opacity";
import AirIcon from "@mui/icons-material/Air";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";

// 날씨 상태에 따른 아이콘 매핑
const getWeatherIcon = (weather) => {
    if (!weather) return <WbSunnyIcon sx={{ fontSize: 40 }} />;

    const condition = weather.toLowerCase();
    if (condition.includes('rain') || condition.includes('비')) {
        return <OpacityIcon sx={{ fontSize: 40, color: '#3b82f6' }} />;
    } else if (condition.includes('cloud') || condition.includes('구름')) {
        return <CloudIcon sx={{ fontSize: 40, color: '#64748b' }} />;
    } else {
        return <WbSunnyIcon sx={{ fontSize: 40, color: '#f59e0b' }} />;
    }
};

export default function WeatherWidget({ weatherData }) {
    const [isOpen, setIsOpen] = useState(false);

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
                    {getWeatherIcon(weatherData.weather)}
                </IconButton>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                position: "fixed",
                top: 100,
                right: 24,
                zIndex: 1000,
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    minWidth: 300,
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
                        px: 3,
                        py: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '12px',
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
                                    fontWeight: 700,
                                    color: 'white',
                                    lineHeight: 1.2,
                                    fontSize: '1.1rem'
                                }}
                            >
                                현재 날씨
                            </Typography>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'rgba(255,255,255,0.9)',
                                    fontSize: '0.75rem'
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
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* 메인 온도 표시 */}
                {weatherData.temperature && (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 3,
                            background: 'linear-gradient(to bottom, rgba(96,165,250,0.1) 0%, transparent 100%)'
                        }}
                    >
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                lineHeight: 1,
                                mb: 1
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
                                    border: '1px solid rgba(59, 130, 246, 0.2)'
                                }}
                            />
                        )}
                    </Box>
                )}

                {/* 상세 정보 그리드 */}
                <Box sx={{ px: 3, pb: 3 }}>
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {weatherData.feelsLike && (
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    bgcolor: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.15)',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: 'rgba(239, 68, 68, 0.12)',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <ThermostatIcon sx={{ fontSize: 20, color: '#ef4444' }} />
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                        체감온도
                                    </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
                                    {weatherData.feelsLike}°C
                                </Typography>
                            </Box>
                        )}

                        {weatherData.humidity && (
                            <Box
                                sx={{
                                    p: 2,
                                    borderRadius: '12px',
                                    bgcolor: 'rgba(59, 130, 246, 0.08)',
                                    border: '1px solid rgba(59, 130, 246, 0.15)',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: 'rgba(59, 130, 246, 0.12)',
                                        transform: 'translateY(-2px)',
                                    }
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                    <OpacityIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                                    <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                                        습도
                                    </Typography>
                                </Box>
                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1e293b' }}>
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
                                textAlign: 'center'
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#64748b',
                                    fontWeight: 500,
                                    fontSize: '0.75rem'
                                }}
                            >
                                📅 {weatherData.date} • 🕐 {weatherData.time}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}

import { Box, Card, CardContent, Typography, Stack, IconButton, Grid } from "@mui/material";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import OpacityIcon from "@mui/icons-material/Opacity";
import AirIcon from "@mui/icons-material/Air";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import { useState } from "react";

// 날씨 상태에 따른 아이콘 매핑
const getWeatherIcon = (weather) => {
    if (!weather) return <WbSunnyIcon />;

    const condition = weather.toLowerCase();
    if (condition.includes('rain') || condition.includes('비')) {
        return <OpacityIcon />;
    } else if (condition.includes('cloud') || condition.includes('구름')) {
        return <CloudIcon />;
    } else {
        return <WbSunnyIcon />;
    }
};

export default function WeatherWidget({ weatherData }) {
    const [isOpen, setIsOpen] = useState(true);

    // 디버깅용 로그
    //console.log('[WeatherWidget] 받은 데이터:', weatherData);

    if (!weatherData) {
        return null;
    }

    // 축소된 버튼 상태
    if (!isOpen) {
        return (
            <Box
                sx={{
                    position: "fixed",
                    top: 20,
                    right: 500,
                    zIndex: 1000,
                }}
            >
                <IconButton
                    onClick={() => setIsOpen(true)}
                    sx={{
                        width: 56,
                        height: 56,
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
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
                top: 20,
                right: 500,
                zIndex: 1000,
            }}
        >
            <Card
                sx={{
                    minWidth: 280,
                    backdropFilter: "blur(12px)",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
                    borderRadius: "12px",
                }}
            >
                <CardContent sx={{ pb: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
                        <Box display="flex" alignItems="center" gap={1}>
                            {getWeatherIcon(weatherData.weather)}
                            <Typography variant="h6" fontWeight="bold">
                                날씨 정보
                            </Typography>
                        </Box>
                        <IconButton
                            onClick={() => setIsOpen(false)}
                            size="small"
                            sx={{ width: 32, height: 32 }}
                        >
                            ×
                        </IconButton>
                    </Box>

                    {/* 2x2 그리드 */}
                    <Grid container spacing={1.5}>
                        {weatherData.temperature && (
                            <Grid item xs={6}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <ThermostatIcon fontSize="small" color="error" />
                                    <Typography variant="body2">
                                        {weatherData.temperature}°C
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {weatherData.feelsLike && (
                            <Grid item xs={6}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <ThermostatIcon fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        체감 {weatherData.feelsLike}°C
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {weatherData.weather && (
                            <Grid item xs={6}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <CloudIcon fontSize="small" color="primary" />
                                    <Typography variant="body2">
                                        {weatherData.weather}
                                    </Typography>
                                </Box>
                            </Grid>
                        )}

                        {weatherData.humidity && (
                            <Grid item xs={6}>
                                <Box display="flex" alignItems="center" gap={0.5}>
                                    <OpacityIcon fontSize="small" color="info" />
                                    <Typography variant="body2">
                                        {weatherData.humidity}%
                                    </Typography>
                                </Box>
                            </Grid>
                        )}
                    </Grid>

                    {weatherData.date && weatherData.time && (
                        <Typography variant="caption" color="text.secondary" mt={1} display="block">
                            {weatherData.date} {weatherData.time}
                        </Typography>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}

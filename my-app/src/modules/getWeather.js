export async function getWeather(date, time, lat, lon) {
    try {
        // date는 dayjs 객체이거나 'YYYY-MM-DD' 형식의 문자열
        const formattedDate = typeof date === 'string'
            ? date
            : date.format('YYYY-MM-DD');

        // 시간을 시(hour)와 분(minute)으로 분리
        const [hour, minute] = time.split(':');

        const url = `http://localhost:8080/api/weather/by-coordinates?lat=${lat}&lon=${lon}&date=${formattedDate}&hour=${hour}&minute=${minute}`;

        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`날씨 조회 실패: ${res.status}`);
        }

        const data = await res.json();

        if (data.error) {
            console.error("날씨 조회 에러:", data.error);
            return null;
        }

        console.log('[날씨 API 응답 원본]', data);
        
        // 백엔드 응답 구조에서 날씨 데이터 추출
        if (data.data && data.data.requestedTimeWeather) {
            const weather = data.data.requestedTimeWeather;
            return {
                temperature: weather.main?.temp?.toFixed(1),
                weather: weather.weather?.[0]?.description || '정보 없음',
                humidity: weather.main?.humidity,
                windSpeed: weather.wind?.speed,
                feelsLike: weather.main?.feels_like?.toFixed(1),
                date: formattedDate,
                time: time,
            };
        }
        
        return null;
    } catch (error) {
        console.error("날씨 API 호출 실패:", error);
        return null;
    }
}

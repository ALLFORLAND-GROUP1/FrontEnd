// 색상 스케일: 0(녹색) -> 50(노랑) -> 100(빨강)
export function getColorForValue(value) {
    const v = Math.max(0, Math.min(100, Number(value) || 0));
    if (v <= 50) {
        const t = v / 50; 
        return lerpColor([46, 204, 113], [241, 196, 15], t);
    } else {
        const t = (v - 50) / 50; 
        return lerpColor([241, 196, 15], [231, 76, 60], t);
    }
}

export function getRadiusForCount(count, zoom) {
    const base = Math.max(10, Math.min(40, 8 + (count || 1) * 2));
    return Math.round(base * (1 + Math.max(0, 13 - (zoom || 10)) * 0.05));
}

function lerpColor(rgb1, rgb2, t) {
    const r = Math.round(rgb1[0] + (rgb2[0] - rgb1[0]) * t);
    const g = Math.round(rgb1[1] + (rgb2[1] - rgb1[1]) * t);
    const b = Math.round(rgb1[2] + (rgb2[2] - rgb1[2]) * t);
    return `rgb(${r},${g},${b})`;
}

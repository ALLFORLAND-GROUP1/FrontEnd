import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const LegendContainerStyle = styled(Box)(() => ({
    position: "absolute",
    top: '20px',
    right: '110px',
    zIndex: 1300,
    background: "rgba(255,255,255,0.97)",
    borderRadius: 12,
    boxShadow: "0 6px 20px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)",
    padding: "14px 18px",
    userSelect: "none",
    border: "1px solid rgba(0,0,0,0.06)",
    backdropFilter: "blur(8px)",
}));

const GradientBarStyle = styled(Box)(() => ({
    width: 320,
    height: 16,
    borderRadius: 999,
    background: "linear-gradient(90deg, #2ecc71 0%, #a8e063 25%, #f1c40f 50%, #f39c12 62.5%, #e67e22 75%, #e74c3c 100%)",
    marginTop: 10,
    marginBottom: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
}));


export { LegendContainerStyle, GradientBarStyle };
import styled from '@emotion/styled';
import { Box } from '@mui/material';

const IconBox = styled(Box)(({ theme, width, height, bgcolor, color }) => ({
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: width || 36,
    height: height || 36,
    backgroundColor: bgcolor || '#4babfa',
    color: color || '#ffffff',
    boxShadow: '0 2px 8px rgba(75, 171, 250, 0.25)',
}));

export default IconBox;

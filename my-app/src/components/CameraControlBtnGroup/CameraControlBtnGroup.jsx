import React from 'react';
import { Box, IconButton, Tooltip, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// 확대/축소 컨트롤 컨테이너
const ZoomControlContainer = styled(Paper)(() => ({
  position: 'fixed',
  bottom: '50px',
  right: '20px',
  zIndex: 1100,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  borderRadius: '8px',
  border: '1px solid #e0e0e0',
  overflow: 'hidden',
}));

// 확대/축소 버튼 스타일
const ZoomButton = styled(IconButton)(() => ({
  padding: '12px',
  borderRadius: 0,
  color: '#000',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  '&:not(:last-child)': {
    borderBottom: '1px solid #e0e0e0',
  },
}));

const CameraControlBtnGroup = ({ onZoomIn, onZoomOut, onCurrentLocation }) => {
  return (
    <ZoomControlContainer elevation={3}>
      <Tooltip title="확대" placement="left">
        <ZoomButton onClick={onZoomIn}>
          <ZoomInIcon />
        </ZoomButton>
      </Tooltip>

      <Tooltip title="축소" placement="left">
        <ZoomButton onClick={onZoomOut}>
          <ZoomOutIcon />
        </ZoomButton>
      </Tooltip>

      <Tooltip title="현재 위치로" placement="left">
        <ZoomButton onClick={onCurrentLocation}>
          <MyLocationIcon />
        </ZoomButton>
      </Tooltip>
    </ZoomControlContainer>
  );
};

export default CameraControlBtnGroup;

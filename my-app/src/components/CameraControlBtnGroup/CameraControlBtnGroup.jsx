import React from 'react';
import { IconButton, Tooltip, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MyLocationIcon from '@mui/icons-material/MyLocation';

// 확대/축소 컨트롤 컨테이너
const ZoomControlContainer = styled(Paper)(() => ({
  position: 'fixed',
  top: '20px',
  right: '16px',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(255,255,255,0.95)',
  borderRadius: '6px',
  overflow: 'hidden',
  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
}));

// 확대/축소 버튼 스타일
const ZoomButton = styled(IconButton)(() => ({
  padding: '13px',
  borderRadius: 0,
  color: '#000',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  '&:not(:last-child)': {
    borderBottom: '1px solid rgba(0,0,0,0.08)',
  },
}));

const CameraControlBtnGroup = ({ onZoomIn, onZoomOut, onCurrentLocation }) => {
  return (
    <ZoomControlContainer elevation={8}>
      <Tooltip title="확대" placement="right">
        <ZoomButton onClick={onZoomIn}>
          <AddIcon sx={{ fontSize: 27 }} />
        </ZoomButton>
      </Tooltip>

      <Tooltip title="축소" placement="right">
        <ZoomButton onClick={onZoomOut}>
          <RemoveIcon sx={{ fontSize: 27 }} />
        </ZoomButton>
      </Tooltip>

      <Tooltip title="내 위치" placement="right">
        <ZoomButton onClick={onCurrentLocation}>
          <MyLocationIcon sx={{ fontSize: 27 }} />
        </ZoomButton>
      </Tooltip>
    </ZoomControlContainer>
  );
};

export default CameraControlBtnGroup;

import React, { useState } from 'react';
import { Box, Slider, Typography, Paper, IconButton } from '@mui/material';
import OpacityIcon from '@mui/icons-material/Opacity';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const WeatherOpacityControl = ({ opacity, onOpacityChange, visible, onToggleVisibility }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 축소 상태
  if (!isOpen) {
    return (
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 1000,
          padding: '12px 16px',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
          },
        }}
        onClick={() => setIsOpen(true)}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OpacityIcon sx={{ color: '#1976d2', fontSize: 20 }} />
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e3a8a' }}>
            투명도
          </Typography>
          <ExpandLessIcon sx={{ fontSize: 20, color: '#64748b' }} />
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        top: 20,
        right: 20,
        zIndex: 1000,
        padding: '16px 20px',
        minWidth: 280,
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OpacityIcon sx={{ color: '#1976d2', fontSize: 20 }} />
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: '#1e3a8a',
              fontSize: '0.9rem',
            }}
          >
            날씨 레이어 투명도
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton
            onClick={onToggleVisibility}
            size="small"
            sx={{
              color: visible ? '#1976d2' : '#9e9e9e',
            }}
          >
            {visible ? <VisibilityIcon fontSize="small" /> : <VisibilityOffIcon fontSize="small" />}
          </IconButton>
          <IconButton onClick={() => setIsOpen(false)} size="small" sx={{ color: '#64748b' }}>
            <ExpandMoreIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ px: 1 }}>
        <Slider
          value={opacity * 100}
          onChange={(e, value) => onOpacityChange(value / 100)}
          min={0}
          max={100}
          step={1}
          disabled={!visible}
          valueLabelDisplay="auto"
          valueLabelFormat={value => `${value}%`}
          sx={{
            color: '#1976d2',
            height: 8,
            '& .MuiSlider-track': {
              border: 'none',
              background: 'linear-gradient(90deg, rgba(25,118,210,0.3) 0%, rgba(25,118,210,1) 100%)',
            },
            '& .MuiSlider-thumb': {
              height: 24,
              width: 24,
              backgroundColor: '#fff',
              border: '3px solid currentColor',
              boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
              '&:focus, &:hover, &.Mui-active, &.Mui-focusVisible': {
                boxShadow: '0 4px 12px rgba(25,118,210,0.4)',
              },
              '&:before': {
                display: 'none',
              },
            },
            '& .MuiSlider-valueLabel': {
              lineHeight: 1.2,
              fontSize: 12,
              background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
              padding: '4px 8px',
              borderRadius: '8px',
              fontWeight: 600,
            },
            '& .MuiSlider-rail': {
              opacity: 0.28,
              backgroundColor: '#bfbfbf',
            },
            '&.Mui-disabled': {
              color: '#bdbdbd',
            },
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
            투명
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: visible ? '#1976d2' : '#9e9e9e',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {Math.round(opacity * 100)}%
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 500 }}>
            불투명
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default WeatherOpacityControl;

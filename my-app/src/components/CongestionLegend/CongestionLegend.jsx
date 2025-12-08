import React from 'react';
import { Paper, Typography, Box, Chip } from '@mui/material';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';

const CongestionLegend = ({ title = '실시간 혼잡도', unit = '%' }) => {
  const levels = [
    { label: '쾌적', color: '#4ade80', range: '0-25' },
    { label: '보통', color: '#fbbf24', range: '25-50' },
    { label: '혼잡', color: '#fb923c', range: '50-75' },
    { label: '매우혼잡', color: '#ef4444', range: '75-100' },
  ];

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        bottom: 24,
        left: 130,
        zIndex: 1000,
        padding: '18px 22px',
        minWidth: 320,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleAltIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              color: '#1e3a8a',
              fontSize: '1rem',
              letterSpacing: '0.3px',
            }}
          >
            {title}
          </Typography>
        </Box>
        <Chip
          label="LIVE"
          size="small"
          sx={{
            height: 22,
            fontSize: '0.7rem',
            fontWeight: 700,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: 'white',
            animation: 'pulse 2s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.7 },
            },
          }}
        />
      </Box>

      <Box
        sx={{
          height: 14,
          borderRadius: '8px',
          background: 'linear-gradient(to right, #4ade80 0%, #fbbf24 30%, #fb923c 60%, #ef4444 100%)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15), inset 0 1px 2px rgba(255,255,255,0.3)',
          mb: 1.5,
          position: 'relative',
          overflow: 'hidden',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '50%',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)',
            borderRadius: '8px 8px 0 0',
          },
        }}
      />

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 2,
          px: 0.5,
        }}
      >
        {[0, 25, 50, 75, 100].map(val => (
          <Typography
            key={val}
            variant="caption"
            sx={{
              fontWeight: 700,
              color: '#64748b',
              fontSize: '0.75rem',
            }}
          >
            {val}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {levels.map(level => (
          <Box
            key={level.label}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.8,
              px: 1.2,
              py: 0.6,
              borderRadius: '8px',
              bgcolor: 'rgba(0,0,0,0.02)',
              border: '1px solid rgba(0,0,0,0.05)',
              flex: '1 1 auto',
              minWidth: 'fit-content',
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '4px',
                bgcolor: level.color,
                boxShadow: `0 2px 6px ${level.color}40`,
                flexShrink: 0,
              }}
            />
            <Typography
              variant="caption"
              sx={{
                fontSize: '0.7rem',
                fontWeight: 600,
                color: '#475569',
                whiteSpace: 'nowrap',
              }}
            >
              {level.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* <Typography
        variant="caption"
        sx={{
          display: 'block',
          mt: 1.5,
          textAlign: 'center',
          fontSize: '0.7rem',
          color: '#94a3b8',
          fontWeight: 500,
        }}
      >
        단위: {unit} • 30분 단위 갱신
      </Typography> */}
    </Paper>
  );
};

export default CongestionLegend;

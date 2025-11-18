import React from 'react';
import { getLegendContainerStyle, getGradientBarStyle } from './CongestionLegendStyle';

export default function CongestionLegend({ title = '혼잡도', offsetLeft = 120, width = 320, unit = '%' }) {
  return (
    <div style={getLegendContainerStyle(offsetLeft)}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 6, letterSpacing: '-0.3px' }}>
        {title}
      </div>
      <div style={getGradientBarStyle(width)} />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 13,
          color: '#555',
          fontWeight: 600,
          marginTop: 2,
        }}
      >
        <span>0</span>
        <span>25</span>
        <span>50</span>
        <span>75</span>
        <span>100</span>
      </div>
      <div style={{ marginTop: 4, textAlign: 'right', fontSize: 12, color: '#777', fontWeight: 500 }}>단위: {unit}</div>
    </div>
  );
}

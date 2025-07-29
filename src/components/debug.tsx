import React, { useEffect, useState } from 'react';

const VisualViewportDebug = () => {
  const [viewportData, setViewportData] = useState({
    width: 0,
    height: 0,
    offsetTop: 0,
    offsetLeft: 0,
    scale: 1,
  });

  useEffect(() => {
    const updateViewportInfo = () => {
      const v = window.visualViewport;
      if (!v) return;

      setViewportData({
        width: v.width,
        height: v.height,
        offsetTop: v.offsetTop,
        offsetLeft: v.offsetLeft,
        scale: v.scale,
      });
    };

    window.visualViewport?.addEventListener('resize', updateViewportInfo);
    window.visualViewport?.addEventListener('scroll', updateViewportInfo);

    // 최초 한번
    updateViewportInfo();

    return () => {
      window.visualViewport?.removeEventListener('resize', updateViewportInfo);
      window.visualViewport?.removeEventListener('scroll', updateViewportInfo);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        color: '#00ffcc',
        fontSize: 12,
        fontFamily: 'monospace',
        padding: '6px 10px',
        zIndex: 10000,
        pointerEvents: 'none',
        whiteSpace: 'pre-line',
        borderBottomRightRadius: 8,
      }}
    >
      {`visualViewport
width: ${viewportData.width.toFixed(1)}
height: ${viewportData.height.toFixed(1)}
offsetTop: ${viewportData.offsetTop.toFixed(1)}
offsetLeft: ${viewportData.offsetLeft.toFixed(1)}
scale: ${viewportData.scale.toFixed(2)}`}
    </div>
  );
};

export default VisualViewportDebug;

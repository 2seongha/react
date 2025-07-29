import React, { useEffect, useState } from 'react';

const ESTIMATED_KEYBOARD_HEIGHT = 400;

const KeyboardOverlay = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    
    const onResize = () => {
      const vh = window.visualViewport?.height || window.innerHeight;
      const fullHeight = window.innerHeight;
      const keyboard = fullHeight - vh;

      if (keyboard > 100) {
        // 키보드가 올라왔다고 판단
        setKeyboardHeight(Math.max(keyboard, ESTIMATED_KEYBOARD_HEIGHT));
      } else {
        // 키보드 내림
        setKeyboardHeight(0);
      }
    };

    window.visualViewport?.addEventListener('resize', onResize);
    return () => {
      window.visualViewport?.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: keyboardHeight,
        width: '100%',
        backgroundColor: 'white',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
};

export default KeyboardOverlay;
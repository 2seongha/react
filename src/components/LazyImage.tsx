import React, { useState, useEffect } from 'react';
import { IonImg } from '@ionic/react';

// 전역 캐시: 이미 페이드 처리된 이미지 목록
const imageCache = new Set<string>();

interface LazyImageProps {
  src: string;
  style?: React.CSSProperties;
  className?: string;
  fallbackSrc?: string;
  onLoad?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = React.memo(({
  src,
  style,
  className,
  fallbackSrc,
  onLoad,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [shouldTransition, setShouldTransition] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setLoaded(false);

    // src가 캐시에 있으면 트랜지션 생략
    setShouldTransition(!imageCache.has(src));
  }, [src]);

  const handleLoad = () => {
    imageCache.add(currentSrc); // 전역 캐시에 저장
    setLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  };

  return (
    <IonImg
      src={currentSrc}
      style={{
        ...style,
        opacity: loaded ? 1 : 0,
        transition: shouldTransition ? 'opacity 0.3s ease-in-out' : 'none',
      }}
      className={className}
      onIonImgDidLoad={handleLoad}
      onIonError={handleError}
    />
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { IonImg } from '@ionic/react';

// Intersection Observer를 사용한 lazy loading 훅
const useIntersectionObserver = (options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasIntersected) {
        setIsIntersecting(true);
        setHasIntersected(true);
        // 한 번 로드되면 observer 해제
        observer.disconnect();
      }
    }, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options,
    });

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [hasIntersected, options]);

  return { ref, isIntersecting: isIntersecting || hasIntersected };
};

interface LazyImageProps {
  src: string;
  alt: string;
  style?: React.CSSProperties;
  className?: string;
  fallbackSrc?: string;
  placeholder?: React.ReactNode;
  onLoad?: () => void;
  onError?: () => void;
}

// 공통 LazyImage 컴포넌트
const LazyImage: React.FC<LazyImageProps> = React.memo(({ 
  src, 
  alt, 
  style, 
  className,
  fallbackSrc,
  placeholder,
  onLoad,
  onError
}) => {
  const { ref, isIntersecting } = useIntersectionObserver();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = useCallback(() => {
    setLoaded(true);
    setError(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setError(true);
      onError?.();
    }
  }, [fallbackSrc, currentSrc, onError]);

  const containerStyle: React.CSSProperties = {
    display: 'inline-block',
    position: 'relative',
    overflow: 'hidden',
    ...style,
  };

  const imageStyle: React.CSSProperties = {
    opacity: loaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  return (
    <div ref={ref} style={containerStyle} className={className}>
      {!isIntersecting && placeholder && (
        <div style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent'
        }}>
          {placeholder}
        </div>
      )}
      
      {(isIntersecting || !placeholder) && !error && (
        <IonImg 
          src={currentSrc} 
          alt={alt}
          style={imageStyle}
          onIonImgDidLoad={handleLoad}
          onIonImgWillLoad={() => setLoaded(false)}
          onIonError={handleError}
        />
      )}
      
      {error && (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          color: '#999',
          fontSize: '12px'
        }}>
          {/* 이미지를 불러올 수 없습니다 */}
        </div>
      )}
    </div>
  );
});

LazyImage.displayName = 'LazyImage';

export default LazyImage;
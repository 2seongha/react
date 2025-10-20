import React, { useState, useEffect } from 'react';
import { imageCache } from '../utils/imageCache';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  showPlaceholder?: boolean;
}

const CachedImage: React.FC<CachedImageProps> = ({ 
  src, 
  fallback, 
  showPlaceholder = false,
  style,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        // 캐시에서 이미지 확인
        const cachedImage = imageCache.getCachedImage(src);
        
        if (cachedImage) {
          // 캐시된 이미지가 있으면 즉시 표시
          setImageSrc(src);
          setIsLoading(false);
        } else {
          // 캐시에 없으면 로드
          await imageCache.preloadImage(src);
          setImageSrc(src);
          setIsLoading(false);
        }
      } catch (error) {
        console.warn(`Failed to load image: ${src}`, error);
        setHasError(true);
        setIsLoading(false);
        
        if (fallback) {
          setImageSrc(fallback);
        }
      }
    };

    loadImage();
  }, [src, fallback]);

  // 로딩 중이고 플레이스홀더를 보여주지 않는 경우 빈 div 반환
  if (isLoading && !showPlaceholder) {
    return (
      <div 
        style={{ 
          ...style,
          backgroundColor: 'transparent',
          display: 'inline-block',
          minWidth: style?.width || 'auto',
          minHeight: style?.height || 'auto'
        }} 
        {...props} 
      />
    );
  }

  // 로딩 중인 경우 플레이스홀더 표시
  if (isLoading) {
    return (
      <div 
        style={{ 
          ...style,
          backgroundColor: 'var(--ion-color-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ion-color-medium)'
        }} 
        {...props}
      >
        <span style={{ fontSize: '12px' }}>Loading...</span>
      </div>
    );
  }

  // 에러가 발생했고 fallback이 없는 경우
  if (hasError && !fallback) {
    return (
      <div 
        style={{ 
          ...style,
          backgroundColor: 'var(--ion-color-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--ion-color-danger)'
        }} 
        {...props}
      >
        <span style={{ fontSize: '12px' }}>Error</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      style={{
        ...style,
        display: 'block',
        objectFit: 'contain'
      }}
      onError={() => {
        if (fallback && imageSrc !== fallback) {
          setImageSrc(fallback);
        } else {
          setHasError(true);
        }
      }}
      {...props}
    />
  );
};

export default CachedImage;
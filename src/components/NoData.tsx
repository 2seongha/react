import React, { useMemo, useCallback } from 'react';
import { IonImg } from '@ionic/react';
import useAppStore from '../stores/appStore';
import { noDataDark, noDataLight } from '../assets/images';
import './NoData.css';

interface NoDataProps {
  message?: string;
  imageSize?: string;
  opacity?: number;
  className?: string;
}

const NoData: React.FC<NoDataProps> = React.memo(({
  message = '데이터가 없습니다.',
  imageSize = '200px',
  opacity = 1,
  className = ''
}) => {
  const themeMode = useAppStore(state => state.themeMode);

  // 실제 적용된 테마 확인
  const getActualTheme = useCallback(() => {
    if (themeMode === 'dark') return 'dark';
    if (themeMode === 'light') return 'light';

    // system 모드일 때 실제 적용된 테마 확인
    const htmlElement = document.documentElement;
    const dataTheme = htmlElement.getAttribute('data-theme');
    if (dataTheme === 'dark' || dataTheme === 'light') {
      return dataTheme;
    }

    // fallback으로 시스템 설정 확인
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [themeMode]);

  // 테마에 따른 이미지 선택 메모이제이션
  const noDataImage = useMemo(() => {
    const actualTheme = getActualTheme();
    return actualTheme === 'dark' ? noDataDark : noDataLight;
  }, [getActualTheme]);

  // 이미지 스타일 메모이제이션
  const imageStyle = useMemo(() => ({
    width: imageSize,
    opacity: opacity
  }), [imageSize, opacity]);

  return (
    <div className={`no-data ${className}`}>
      <IonImg
        src={noDataImage}
        style={imageStyle}
        alt="no data"
      />
      <span className="no-data-message">{message}</span>
    </div>
  );
});

NoData.displayName = 'NoData';

export default NoData;
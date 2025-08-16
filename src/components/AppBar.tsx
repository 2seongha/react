import React, { ReactNode, useEffect } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonIcon,
  useIonRouter,
} from '@ionic/react';
import { menu, search, settingsSharp } from 'ionicons/icons';
import './AppBar.css';
import AnimatedBadge from './AnimatedBadge';
import useAppStore from '../stores/appStore';
import LazyImage from './LazyImage';

type AppBarProps = {
  title?: ReactNode;
  bottom?: ReactNode;
  showBackButton?: boolean;
  showLogo?: boolean;
  showSearchButton?: boolean;
  // showNotificationsButton?: boolean;
  showSettingButton?: boolean;
  showMenuButton?: boolean;
  showCount?: boolean;
  count?: number;
};

const AppBar: React.FC<AppBarProps> = ({
  title,
  bottom,
  showBackButton = false,
  showLogo = false,
  showSearchButton = false,
  showSettingButton = false,
  showMenuButton = false,
  showCount = false,
  count = 0,
}) => {
  const router = useIonRouter();
  const { themeMode } = useAppStore();

  // 실제 적용된 테마 확인
  const getActualTheme = () => {
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
  };

  const actualTheme = getActualTheme();

  // 로고 이미지 프리로드
  useEffect(() => {
    const preloadImages = [
      '/assets/images/app_logo_dark.webp',
      '/assets/images/app_logo_light.webp'
    ];
    
    preloadImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  return (
    <IonHeader mode='ios' translucent={true} className='app-bar'>
      <IonToolbar>
        {showBackButton &&
          <IonBackButton defaultHref='/app' mode='md' color={'primary'} />
        }

        {showLogo &&
          <div style={{ position: 'relative', width: '80px', height: '20px', marginLeft: '20px' }}>
            <LazyImage
              src="/assets/images/app_logo_dark.webp"
              style={{ 
                position: 'absolute',
                width: '100%', 
                height: '100%',
                display: actualTheme === 'light' ? 'block' : 'none'
              }}
            />
            <LazyImage
              src="/assets/images/app_logo_light.webp"
              style={{ 
                position: 'absolute',
                width: '100%', 
                height: '100%',
                display: actualTheme === 'dark' ? 'block' : 'none'
              }}
            />
          </div>
        }

        <IonTitle>
          <div className='app-bar-title-wrapper'>
            {title}
            {showCount ? <AnimatedBadge count={count} key={count} /> : null}
          </div>
        </IonTitle>
        <IonButtons slot="end">
          {showSearchButton &&
            <IonButton mode='md' shape='round' color={'medium'}
              className="app-bar-button"
              onClick={() => router.push('/settings', 'forward', 'push')}>
              <IonIcon icon={search} />
            </IonButton>
          }
          {showSettingButton &&
            <IonButton mode='md' shape='round' color={'medium'}
              className="app-bar-button"
              onClick={() => router.push('/settings', 'forward', 'push')}>
              <IonIcon icon={settingsSharp} />
            </IonButton>
          }
          {showMenuButton &&
            <IonButton mode='md' shape='round' color={'medium'}
              className="app-bar-button"
              onClick={() => router.push('/menu', 'forward', 'push')}>
              <IonIcon icon={menu} />
            </IonButton>
          }
        </IonButtons>
      </IonToolbar>
      {bottom}
    </IonHeader>
  );
};

export default AppBar;
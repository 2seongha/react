import React, { ReactNode, useEffect, useMemo } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonIcon,
  useIonRouter,
  IonMenuButton,
} from '@ionic/react';
import { headset, search, settingsSharp } from 'ionicons/icons';
import './AppBar.css';
import AnimatedBadge from './AnimatedBadge';
import useAppStore from '../stores/appStore';
import { appLogoDark, appLogoLight } from '../assets/images';
import CachedImage from './CachedImage';

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
  titleCenter?: boolean; // 타이틀 완전 가운데 정렬
  customEndButtons?: ReactNode; // 동적 버튼 추가
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
  titleCenter = true,
  customEndButtons,
}) => {
  const router = useIonRouter();
  const { themeMode } = useAppStore();

  // 실제 적용된 테마 확인 (메모이제이션)
  const actualTheme = useMemo(() => {
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

  return (
    <IonHeader mode='ios' translucent={false} className='app-bar'>
      <IonToolbar>
        <div style={{ display: 'flex', justifyContent: 'space-between', height: '48px' }}>
          {showLogo &&
            <div style={{ position: 'relative', width: '80px', height: '48px', marginLeft: '20px' }}>
              <CachedImage
                src={appLogoDark}
                alt="app logo"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  display: actualTheme === 'light' ? 'block' : 'none'
                }}
              />
              <CachedImage
                src={appLogoLight}
                alt="app logo"
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  display: actualTheme === 'dark' ? 'block' : 'none'
                }}
              />
            </div>
          }
          <div className='app-bar-title-wrapper' style={{
            justifyContent: titleCenter ? 'center' : 'start',
            paddingLeft: titleCenter || !showBackButton ? '0' : '56px',
          }}>
            {title}
            {showCount ? <AnimatedBadge count={count} /> : null}
          </div>
          {showBackButton ?
            <IonBackButton defaultHref='/app/home' mode='md' color={'primary'} />
            : <div></div>
          }
          <IonButtons slot="end" style={{marginRight:'8px'}}>
            {showSearchButton &&
              <IonButton mode='md' shape='round' color={'medium'}
                className="app-bar-button"
                onClick={() => router.push('/search', 'forward', 'push')}>
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
              <IonMenuButton
                mode='md'
                color={'medium'}
                className="app-bar-button"
                menu="main-menu"
              />
            }
            {customEndButtons}
          </IonButtons>
          {bottom}
        </div>
      </IonToolbar>
    </IonHeader>
  );
};

export default AppBar;
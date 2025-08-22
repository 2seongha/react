import React, { ReactNode, useEffect } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonImg,
  useIonRouter,
} from '@ionic/react';
import { headset, menu, search, settingsSharp } from 'ionicons/icons';
import './AppBar.css';
import AnimatedBadge from './AnimatedBadge';
import useAppStore from '../stores/appStore';
import { appLogoDark, appLogoLight } from '../assets/images';

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

  return (
    <IonHeader mode='ios' translucent={false} className='app-bar'>

      <IonToolbar>
        <IonTitle style={{ height: '48px' }}>
          <div className='app-bar-title-wrapper'>
            {title}
            {showCount ? <AnimatedBadge count={count} key={count} /> : null}
          </div>
        </IonTitle>
        {showBackButton &&
          <IonBackButton defaultHref='/app/home' mode='md' color={'primary'} />
        }

        {showLogo &&
          <div style={{ position: 'relative', width: '80px', height: '20px', marginLeft: '20px' }}>
            <IonImg
              src={appLogoDark}
              alt="app logo"
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: actualTheme === 'light' ? 'block' : 'none'
              }}
            />
            <IonImg
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
        {bottom}
      </IonToolbar>
    </IonHeader>
  );
};

export default AppBar;
import React, { useCallback, ReactNode } from 'react';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonButton,
  IonIcon,
  useIonRouter,
  IonImg,
} from '@ionic/react';
import { arrowBack, menu, notifications, search, settings, settingsSharp } from 'ionicons/icons';
import './AppBar.css';
import useAppStore from '../stores/appStore';
import AnimatedBadge from './AnimatedBadge';

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
  // showNotificationsButton = false,
  showSettingButton = false,
  showMenuButton = false,
  showCount = false,
  count = 0,
}) => {
  const router = useIonRouter();
  const themeMode = useAppStore(state => state.themeMode);

  const getLogoSrc = useCallback(() => {
    if (themeMode === 'dark') {
      return '/assets/images/app_logo_light.webp';
    } else if (themeMode === 'light') {
      return '/assets/images/app_logo_dark.webp';
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? '/assets/images/app_logo_light.webp' : '/assets/images/app_logo_dark.webp';
    }
  }, [themeMode]);

  return (
    <IonHeader mode='ios' translucent={true} collapse="condense" className='app-bar'>
      <IonToolbar className='app-bar-color'>
        {showBackButton &&
          <IonBackButton defaultHref='/app/home' mode='md' color={'primary'} />
        }

        {showLogo &&
          <div className='logo-wrapper'>
            <IonImg src={getLogoSrc()} slot='start'
              className='logo' />
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
          {/* {showNotificationsButton &&
            <IonButton mode='md' shape='round' color={'medium'}
              className="app-bar-button"
              onClick={() => router.push('/settings', 'forward', 'push')}>
              <IonIcon icon={notifications} />
            </IonButton>
          } */}
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
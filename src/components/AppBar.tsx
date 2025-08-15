import React, { ReactNode } from 'react';
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
  // showNotificationsButton = false,
  showSettingButton = false,
  showMenuButton = false,
  showCount = false,
  count = 0,
}) => {
  const router = useIonRouter();
  const { themeMode } = useAppStore();

  return (
    <IonHeader mode='ios' translucent={true} className='app-bar'>
      <IonToolbar className='app-bar-color'>
        {showBackButton &&
          <IonBackButton defaultHref='/app/home' mode='md' color={'primary'} />
        }

        {showLogo &&
          <div className='logo-container'>
            <div className={`logo ${themeMode === 'light' ? 'logo-visible' : 'logo-hidden'}`}>
              <LazyImage 
                src='/assets/images/app_logo_dark.webp'
                alt="App Logo Light" 
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <div className={`logo ${themeMode === 'dark' ? 'logo-visible' : 'logo-hidden'}`}>
              <LazyImage 
                src='/assets/images/app_logo_light.webp'
                alt="App Logo Dark" 
                style={{ width: '100%', height: '100%' }}
              />
            </div>
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
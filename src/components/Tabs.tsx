import { IonPage, IonFooter } from '@ionic/react';
import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Box } from '@mui/material';
import { Home as HomeIcon, Notifications as NotificationsIcon, Menu as MenuIcon } from '@mui/icons-material';

import Home from '../pages/Home';
import Notifications from '../pages/Notifications';
import More from '../pages/More';
import AppBar from './AppBar';
import './Tabs.css';

const Tabs: React.FC = () => {
  const [value, setValue] = useState(0);

  const getAppBarProps = () => {
    switch (value) {
      case 0:
        return { showLogo: true, showSearchButton: true, showMenuButton: true };
      case 1:
        return { title: <span>알림</span> };
      case 2:
        return { title: <span>더보기</span>, showSettingButton: true, showMenuButton: true };
      default:
        return { showLogo: true, showSearchButton: true, showMenuButton: true };
    }
  };

  const getPageClassName = () => {
    switch (value) {
      case 0:
        return 'home';
      case 1:
        return 'notifications';
      case 2:
        return 'more';
      default:
        return 'home';
    }
  };

  return (
    <IonPage className={getPageClassName()}>
      <AppBar {...getAppBarProps()} />
      <Home display={value === 0 ? 'block' : 'none'} />
      <Notifications display={value === 1 ? 'block' : 'none'} />
      <More display={value === 2 ? 'block' : 'none'} />
      <IonFooter>
        <BottomNavigation
          className='bottom-navigation'
          value={value}
          onChange={(_, newValue) => {
            setValue(newValue);
          }}
          showLabels
        >
          <BottomNavigationAction
            label="홈"
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            label="알림"
            icon={<NotificationsIcon />}
          />
          <BottomNavigationAction
            label="더보기"
            icon={<MenuIcon />}
          />
        </BottomNavigation>
      </IonFooter>
    </IonPage>
  );
};

export default Tabs;

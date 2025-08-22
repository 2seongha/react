import React from 'react';
import { IonFooter, useIonRouter } from '@ionic/react';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction } from '@mui/material';
import { HomeFilled as HomeIcon, Notifications as NotificationsIcon, MoreHoriz as MenuIcon } from '@mui/icons-material';
import useAppStore from '../stores/appStore';
import './BottomNavigation.css';

const BottomNavigation: React.FC = () => {
  const selectedTab = useAppStore(state => state.selectedTab);
  const setSelectedTab = useAppStore(state => state.setSelectedTab);
  const router = useIonRouter();

  return (
    <IonFooter className='bottom-navigation-wrapper'>
      <MuiBottomNavigation
        className='bottom-navigation'
        value={selectedTab}
        onChange={(_, newValue) => {
          setSelectedTab(newValue);
          console.log();
          switch (newValue) {
            case 0: return router.push('/app/home', 'none', 'replace');
            case 1: return router.push('/app/notifications', 'none', 'replace');
            case 2: return router.push('/app/more', 'none', 'replace');
          }
        }}
        showLabels
      >
        <BottomNavigationAction
          disableRipple
          label="홈"
          icon={<HomeIcon />}
        />
        <BottomNavigationAction
          disableRipple
          label="알림"
          icon={<NotificationsIcon />}
        />
        <BottomNavigationAction
          disableRipple
          label="더보기"
          icon={<MenuIcon />}
        />
      </MuiBottomNavigation>
    </IonFooter>
  );
};

export default BottomNavigation;
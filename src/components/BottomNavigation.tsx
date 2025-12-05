import React from 'react';
import { IonFooter, useIonRouter } from '@ionic/react';
import { BottomNavigation as MuiBottomNavigation, BottomNavigationAction, Badge } from '@mui/material';
import { HomeFilled as HomeIcon, Notifications as NotificationsIcon, MoreHoriz as MenuIcon } from '@mui/icons-material';
import useAppStore from '../stores/appStore';
import './BottomNavigation.css';
import _ from 'lodash';
import { webviewHaptic } from '../webview';

const BottomNavigation: React.FC = () => {
  const selectedTab = useAppStore(state => state.selectedTab);
  const setSelectedTab = useAppStore(state => state.setSelectedTab);
  const router = useIonRouter();

  const notifications = useAppStore((state) => state.notifications);

  return (
    <IonFooter className='bottom-navigation-wrapper'>
      <MuiBottomNavigation
        className='bottom-navigation'
        value={selectedTab}
        onChange={(_, newValue) => {
          webviewHaptic('mediumImpact');
          setSelectedTab(newValue);
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
          icon={
            <Badge
              badgeContent={notifications?.filter(n => n.READ_YN === 'N')?.length} color='error' max={999} invisible={_.isEmpty(notifications)}
              sx={{
                "& .MuiBadge-badge": {
                  backgroundColor: "#f65353",
                }
              }}
            >
              <NotificationsIcon />
            </Badge>
          }
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
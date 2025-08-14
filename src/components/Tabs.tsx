import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet, useIonRouter } from '@ionic/react';
import { home, document, notifications, menu } from 'ionicons/icons';
import React, { useEffect, useState } from 'react';
import { Route, Redirect, useLocation, useHistory } from 'react-router-dom';

import Home from '../pages/Home';
import Notifications from '../pages/Notifications';
import More from '../pages/More';

const Tabs: React.FC = () => {
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState('home');
  const router = useIonRouter();

  useEffect(() => {
    const path = location.pathname;
    if (path === '/app/home') setSelectedTab('home');
    else if (path === '/app/notifications') setSelectedTab('notifications');
    else if (path === '/app/more') setSelectedTab('more');
    else setSelectedTab('home');
  }, [location.pathname]);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Route path="/app/home" component={Home} exact />
        <Route path="/app/notifications" component={Notifications} exact />
        <Route path="/app/more" component={More} exact />
      </IonRouterOutlet>

      <IonTabBar slot="bottom" mode='md'>
        {/* <IonTabButton tab="home" onTouchStart={() => router.push('/app/home', 'root', 'replace')} selected={selectedTab === 'home'}>
          <IonIcon icon={home} />
          <IonLabel style={{ fontSize: '10px' }}>홈</IonLabel>
        </IonTabButton>
        <IonTabButton tab="notifications" onTouchStart={() => router.push('/app/notifications', 'root', 'replace')} selected={selectedTab === 'notifications'}>
          <IonIcon icon={notifications} />
          <IonLabel style={{ fontSize: '10px' }}>알림</IonLabel>
        </IonTabButton>
        <IonTabButton tab="more" onTouchStart={() => router.push('/app/more', 'root', 'replace')} selected={selectedTab === 'more'}>
          <IonIcon icon={menu} />
          <IonLabel style={{ fontSize: '10px' }}>더보기</IonLabel>
        </IonTabButton> */}
         <IonTabButton tab="home" href='/app/home' selected={selectedTab === 'home'}>
          <IonIcon icon={home} />
          <IonLabel style={{ fontSize: '10px' }}>홈</IonLabel>
        </IonTabButton>
        <IonTabButton tab="notifications" href='/app/notifications' selected={selectedTab === 'notifications'}>
          <IonIcon icon={notifications} />
          <IonLabel style={{ fontSize: '10px' }}>알림</IonLabel>
        </IonTabButton>
        <IonTabButton tab="more" href='/app/more' selected={selectedTab === 'more'}>
          <IonIcon icon={menu} />
          <IonLabel style={{ fontSize: '10px' }}>더보기</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;

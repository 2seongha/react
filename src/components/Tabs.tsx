import { IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel, IonRouterOutlet } from '@ionic/react';
import { home, document, notifications, menu } from 'ionicons/icons';
import React, { useEffect, useRef, useState } from 'react';
import { Route, Redirect, useLocation } from 'react-router-dom';

import Home from '../pages/Home';
import Todo from '../pages/Todo';
import Notifications from '../pages/Notifications';
import More from '../pages/More';

const Tabs: React.FC = () => {
  const location = useLocation();
  const [selectedTab, setSelectedTab] = useState('home');

  useEffect(() => {
    const path = location.pathname;
    if (path === '/app/home') setSelectedTab('home');
    else if (path === '/app/todo') setSelectedTab('todo');
    else if (path === '/app/notifications') setSelectedTab('notifications');
    else if (path === '/app/more') setSelectedTab('more');
    else setSelectedTab('home');
  }, [location.pathname]);

  return (
    <IonTabs>
      <IonRouterOutlet>
        <Redirect exact path="/app" to="/app/home" />
        <Route path="/app/home" component={Home} exact />
        <Route path="/app/todo" component={Todo} exact />
        <Route path="/app/notifications" component={Notifications} exact />
        <Route path="/app/more" component={More} exact />
      </IonRouterOutlet>

      <IonTabBar slot="bottom" mode='md'>
        <IonTabButton tab="home" href="/app/home" selected={selectedTab === 'home'}>
          <IonIcon icon={home} />
          <IonLabel>홈</IonLabel>
        </IonTabButton>
        <IonTabButton tab="todo" href="/app/todo" selected={selectedTab === 'todo'}>
          <IonIcon icon={document} />
          <IonLabel>미결함</IonLabel>
        </IonTabButton>
        <IonTabButton tab="notifications" href="/app/notifications" selected={selectedTab === 'notifications'}>
          <IonIcon icon={notifications} />
          <IonLabel>알림</IonLabel>
        </IonTabButton>
        <IonTabButton tab="more" href="/app/more" selected={selectedTab === 'more'}>
          <IonIcon icon={menu} />
          <IonLabel>더보기</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default Tabs;

import { IonApp, IonRouterOutlet, iosTransitionAnimation } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, BrowserRouter, HashRouter } from 'react-router-dom';
import React, { useEffect } from 'react';

import Tabs from './components/Tabs';
import Detail from './pages/Detail';
import Menu from './pages/Menu';
import Email from './pages/Email';

import usePreviousPath from './hooks/usePreviousPath';
import Notice from './pages/Notice';
import KeyboardOverlay from './components/KeyboardOverlay';
import VisualViewportDebug from './components/debug';

const RouterOutletWithAnimation: React.FC = () => {
  const { currentPath, prevPath } = usePreviousPath();

  useEffect(() => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }, []);

  const animation = React.useMemo(() => {
    if (currentPath.startsWith('/menu') || prevPath.startsWith('/menu')) {
      return iosTransitionAnimation;
    }
    return undefined;
  }, [currentPath, prevPath]);

  return (
    <IonRouterOutlet animation={animation}>
      <Route path="/app" component={Tabs} />
      <Route path="/detail" component={Detail} exact />
      <Route path="/menu" component={Menu} exact />
      <Route path="/notice" component={Notice} exact />
      <Route path="/secondAuth/email" component={Email} exact />
      <Redirect exact from="/" to="/app/home" />
    </IonRouterOutlet>
  );
};

const App: React.FC = () => {
  return (
      <IonApp style={{ height: 'calc(var(--vh, 1vh) * 100)' }}>
        <IonReactRouter>
          <RouterOutletWithAnimation />
        </IonReactRouter>
        <KeyboardOverlay />
        <VisualViewportDebug />
      </IonApp>
  );
};

export default App;
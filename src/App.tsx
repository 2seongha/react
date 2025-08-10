import { IonApp, IonRouterOutlet, iosTransitionAnimation } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, BrowserRouter, HashRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import Tabs from './components/Tabs';
import FlowList from './pages/FlowList';
import Detail from './pages/Detail';
import Menu from './pages/Menu';

import usePreviousPath from './hooks/usePreviousPath';
import Notice from './pages/Notice';
import Settings from './pages/Settings';
import useAppStore from './stores/appStore';
import { initWebview } from './webview';

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

  const varUA = navigator.userAgent.toLowerCase();
  return (
    <IonRouterOutlet animation={animation} mode={varUA.indexOf('android') > -1 ? 'md' : 'ios'}>
      <Route path="/app" component={Tabs} />
      <Route path="/flowList" component={FlowList} exact/>
      <Route path="/detail" component={Detail} exact />
      <Route path="/menu" component={Menu} exact />
      <Route path="/notice" component={Notice} exact />
      <Route path="/settings" component={Settings} exact />
      <Redirect exact from="/" to="/app/home" />
    </IonRouterOutlet>
  );
};

const App: React.FC = () => {
  const { themeMode } = useAppStore();
  const [isWebviewReady, setIsWebviewReady] = useState(false);

  useEffect(() => {
    // 웹뷰 초기화
    const initializeWebview = async () => {
      try {
        console.log('웹뷰 초기화 시작...');
        
        const success = await initWebview(
          // onPaddingReceived
          (padding) => {
            console.log('Padding received:', padding);
            // 패딩 정보를 사용하여 UI 조정
            document.documentElement.style.setProperty('--safe-area-top', `${padding.top}px`);
            document.documentElement.style.setProperty('--safe-area-bottom', `${padding.bottom}px`);
            document.documentElement.style.setProperty('--safe-area-left', `${padding.left}px`);
            document.documentElement.style.setProperty('--safe-area-right', `${padding.right}px`);
          },
          // onTokenReceived
          (tokens) => {
            console.log('Tokens received:', tokens.accessToken ? 'Access token received' : 'No access token');
            // 토큰 정보를 앱 스토어에 저장하거나 API 설정
          },
          // onUserInfoReceived
          (userInfo) => {
            console.log('User info received:', userInfo.loginId);
            // 사용자 정보를 앱 스토어에 저장
          },
          // onKeyboardChanged
          (keyboard) => {
            console.log('Keyboard visibility:', keyboard.isOpen, keyboard.height);
            // 키보드 상태에 따른 UI 조정
            if (keyboard.isOpen) {
              document.documentElement.style.setProperty('--keyboard-height', `${keyboard.height}px`);
            } else {
              document.documentElement.style.setProperty('--keyboard-height', '0px');
            }
          }
        );

        if (success) {
          console.log('웹뷰 초기화 완료!');
          setIsWebviewReady(true);
        }
      } catch (error) {
        console.error('웹뷰 초기화 실패:', error);
        // 웹뷰 초기화 실패해도 앱은 실행
        setIsWebviewReady(true);
      }
    };

    initializeWebview();
  }, []);

  useEffect(() => {
    const html = document.documentElement;

    if (themeMode === 'dark') {
      html.setAttribute('data-theme', 'dark');
    } else if (themeMode === 'light') {
      html.setAttribute('data-theme', 'light');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [themeMode]);

  // 웹뷰 초기화 완료될 때까지 로딩 화면 표시
  if (!isWebviewReady) {
    return (
      <IonApp>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          color: 'var(--ion-color-primary)'
        }}>
          앱 초기화 중...
        </div>
      </IonApp>
    );
  }

  return (
    <IonApp>
      <IonReactRouter>
        <RouterOutletWithAnimation />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
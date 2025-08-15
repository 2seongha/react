import { IonApp, IonRouterOutlet, iosTransitionAnimation } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, BrowserRouter, HashRouter } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import Tabs from './components/Tabs';
import FlowList from './pages/FlowList';
import Approval from './pages/Approval';
import Detail from './pages/Detail';
import Menu from './pages/Menu';
import Settings from './pages/Settings';

import usePreviousPath from './hooks/usePreviousPath';
import Notice from './pages/Notice';
import useAppStore from './stores/appStore';
import { initWebview } from './webview';
import { preloadCriticalImages, preloadAllImages, calculateProgress, type ImagePreloadProgress } from './utils/imagePreloader';
import { Commet } from 'react-loading-indicators';
import { getPlatformMode } from './utils';

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
    <IonRouterOutlet animation={animation} mode={getPlatformMode()}>
      <Route path="/app" component={Tabs} />
      <Route path="/flowList" component={FlowList} exact />
      <Route path="/approval" component={Approval} exact />
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
  const [completeInitWebview, setCompleteInitWebview] = useState<boolean>(false);

  useEffect(() => {
    // 웹뷰 초기화와 이미지 preload를 병렬로 실행
    const initializeApp = async () => {
      try {
        // 1단계: 중요 이미지들을 먼저 preload
        console.log('⚡ 중요 이미지 preload 시작...');
        await preloadCriticalImages();

        // 2단계: 웹뷰 초기화 (중요 이미지 로딩과 병렬 실행 가능)
        console.log('웹뷰 초기화 시작...');
        const webviewPromise = initWebview();

        // 3단계: 나머지 모든 이미지 preload (백그라운드에서)
        const allImagesPromise = preloadAllImages((loaded, total) => {
        });

        // 웹뷰 초기화 완료 대기
        const success = await webviewPromise;
        if (success) {
          console.log('웹뷰 초기화 완료!');
          setCompleteInitWebview(true);
        }

        // 모든 이미지 로딩도 완료 대기 (앱 시작에는 필수가 아님)
        allImagesPromise.catch(error => {
          console.warn('일부 이미지 로딩 실패:', error);
        });

      } catch (error) {
        console.error('앱 초기화 실패:', error);
      }
    };

    initializeApp();
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

  if (!completeInitWebview) return <div style={{ width: '100%', height: '100%', background: 'var(--ion-background-color)'}}/>
  return (
    <IonApp>
      <IonReactRouter>
        <RouterOutletWithAnimation />
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

import Home from './pages/Home';
import FlowList from './pages/FlowList';
import Approval from './pages/Approval';
import Detail from './pages/Detail';
import Menu from './pages/Menu';
import Settings from './pages/Settings';
import Notice from './pages/Notice';
import useAppStore from './stores/appStore';
import { initWebview } from './webview';
import { getPlatformMode } from './utils';
import Notifications from './pages/Notifications';
import More from './pages/More';
import { animationFrameManager } from './utils/animationFrame';


const App: React.FC = () => {
  const { themeMode } = useAppStore();
  const [completeInit, setCompleteInit] = useState<boolean>(false);
  const [webviewInitialized, setWebviewInitialized] = useState<boolean>(false);
  const [themeInitialized, setThemeInitialized] = useState<boolean>(false);

  useEffect(() => {
    // 웹뷰 초기화
    const initializeWebview = async () => {
      try {
        console.log('웹뷰 초기화 시작...');
        const success = await initWebview();
        if (success) {
          console.log('웹뷰 초기화 완료!');
          setWebviewInitialized(true);
        }
      } catch (error) {
        console.error('웹뷰 초기화 실패:', error);
      }
    };

    initializeWebview();
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // 전역 애니메이션 프레임 시스템 초기화
    console.log('애니메이션 프레임워크 초기화');
    
    // 앱 전체 성능 모니터링
    let frameCount = 0;
    let lastTime = performance.now();
    
    const performanceMonitor = () => {
      frameCount++;
      const currentTime = performance.now();
      
      if (currentTime - lastTime >= 5000) { // 5초마다 체크
        const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
        console.log(`앱 FPS: ${fps}`);
        frameCount = 0;
        lastTime = currentTime;
      }
    };
    
    // 애니메이션 프레임워크에 성능 모니터 등록
    const unsubscribe = animationFrameManager.subscribe(performanceMonitor);
    
    return () => {
      unsubscribe();
      console.log('애니메이션 프레임워크 정리');
    };
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
    }
    
    // 테마 초기화 완료 표시
    setThemeInitialized(true);
  }, [themeMode]);

  // 웹뷰와 테마 모두 초기화 완료되었을 때 앱 초기화 완료
  useEffect(() => {
    if (webviewInitialized && themeInitialized) {
      console.log('앱 초기화 완료!');
      console.log(completeInit);

      setCompleteInit(true);
      console.log(completeInit);
    }
  }, [webviewInitialized, themeInitialized]);

  if (!completeInit) return <div style={{ width: '100%', height: '100%', background: 'transparent' }} />
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet mode={getPlatformMode()}>
          <Route path="/app/home" component={Home} exact />
          <Route path="/app/notifications" component={Notifications} exact />
          <Route path="/app/more" component={More} exact />
          <Route path="/flowList" component={FlowList} exact />
          <Route path="/approval" component={Approval} exact />
          <Route path="/detail/:flowNo" component={Detail} exact/>
          <Route path="/menu" component={Menu} exact />
          <Route path="/notice" component={Notice} exact />
          <Route path="/settings" component={Settings} exact />
          <Redirect exact from="/" to="/app/home" />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
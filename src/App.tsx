import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react';
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
import MyPage from './pages/MyPage';
import Search from './pages/Search';

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

    // viewport resize 시 앱을 visualViewport 최상단에 fix
    const fixAppToTop = () => {
      if (window.visualViewport) {
        // visualViewport의 위치 정보 가져오기
        const { offsetTop, offsetLeft } = window.visualViewport;
        
        // 앱 컨테이너를 visualViewport 최상단에 고정
        const appElement = document.querySelector('ion-app') as HTMLElement;
        if (appElement) {
          appElement.style.position = 'fixed';
          appElement.style.top = `${offsetTop}px`;
          appElement.style.left = `${offsetLeft}px`;
          appElement.style.width = `${window.visualViewport.width}px`;
          appElement.style.height = `${window.visualViewport.height}px`;
        }
        
        // body와 html도 함께 조정
        document.body.style.position = 'fixed';
        document.body.style.top = `${offsetTop}px`;
        document.body.style.left = `${offsetLeft}px`;
        document.body.style.width = `${window.visualViewport.width}px`;
        document.body.style.height = `${window.visualViewport.height}px`;
        document.body.style.overflow = 'hidden';
        
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.top = `${offsetTop}px`;
        document.documentElement.style.left = `${offsetLeft}px`;
        document.documentElement.style.width = `${window.visualViewport.width}px`;
        document.documentElement.style.height = `${window.visualViewport.height}px`;
        document.documentElement.style.overflow = 'hidden';
      }
    };

    // visualViewport resize 이벤트 리스너
    if (window.visualViewport) {
      const handleViewportResize = () => {
        fixAppToTop();
      };

      window.visualViewport.addEventListener('resize', handleViewportResize);
      
      // 초기 설정
      fixAppToTop();

      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportResize);
      };
    }
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
    }
  }, [webviewInitialized, themeInitialized]);

  if (!completeInit) return <div style={{ width: '100%', height: '100%', background: 'transparent' }} />
  return (
    <IonApp>
      <IonReactRouter >
        <Menu />
        <IonRouterOutlet mode={getPlatformMode()} id="main-content">
          <Route path="/app/home" component={Home} exact />
          <Route path="/app/notifications" component={Notifications} exact />
          <Route path="/app/more" component={More} exact />
          <Route path="/flowList/:AREA_CODE" component={FlowList} exact />
          <Route path="/approval/:P_AREA_CODE/:AREA_CODE/:P_AREA_CODE_TXT/:AREA_CODE_TXT" component={Approval} exact />
          <Route path="/detail/:FLOWNO" component={Detail} exact />
          <Route path="/notice" component={Notice} exact />
          <Route path="/settings" component={Settings} exact />
          <Route path="/myPage" component={MyPage} exact />
          <Route path="/search" component={Search} exact />
          <Redirect exact from="/" to="/app/home" />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
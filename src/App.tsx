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

    // let scrollY = 0;

    // function lockScroll() {
    //   scrollY = window.scrollY;

    //   document.body.style.position = 'fixed';
    //   document.body.style.top = `-${scrollY}px`;
    //   document.body.style.left = '0';
    //   document.body.style.right = '0';
    //   document.body.style.width = '100%';
    //   document.body.style.overflow = 'hidden';

    //   document.documentElement.style.overflow = 'hidden';
    // }

    // function unlockScroll() {
    //   document.body.style.position = '';
    //   document.body.style.top = '';
    //   document.body.style.left = '';
    //   document.body.style.right = '';
    //   document.body.style.width = '';
    //   document.body.style.overflow = '';

    //   document.documentElement.style.overflow = '';

    //   window.scrollTo(0, scrollY);
    // }

    // if (window.visualViewport) {
    //   const handleViewportChange = () => {
    //     const { height } = window.visualViewport!;
    
    //     // 키보드가 올라왔는지 판단
    //     const keyboardVisible = height < window.innerHeight;
    
    //     if (keyboardVisible) {
    //       lockScroll();
    //     } else {
    //       unlockScroll();
    //     }
    //   };
    
    //   window.visualViewport.addEventListener('resize', handleViewportChange);
    //   window.visualViewport.addEventListener('scroll', handleViewportChange);
    // }
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
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

    // 키보드 높이에 따른 viewport 크기 조정
    const setupKeyboardCompensation = () => {
      const initialHeight = window.innerHeight;
      console.log('초기 viewport 높이:', initialHeight);
      
      // CSS 변수로 초기 높이 저장
      document.documentElement.style.setProperty('--initial-vh', `${initialHeight * 0.01}px`);
      document.documentElement.style.setProperty('--current-vh', `${initialHeight * 0.01}px`);
      
      // Visual Viewport API 사용하여 키보드 높이 감지
      if (window.visualViewport) {
        const handleViewportChange = () => {
          const currentHeight = window.visualViewport?.height || window.innerHeight;
          const keyboardHeight = initialHeight - currentHeight;
          
          console.log('Viewport 변화:', {
            초기높이: initialHeight,
            현재높이: currentHeight,
            키보드높이: keyboardHeight
          });
          
          if (keyboardHeight > 0) {
            // 키보드가 올라온 경우: viewport 높이를 키보드 높이만큼 줄임
            const adjustedHeight = currentHeight;
            const adjustedVH = adjustedHeight * 0.01;
            
            document.documentElement.style.setProperty('--current-vh', `${adjustedVH}px`);
            document.body.style.height = `${adjustedHeight}px`;
            document.documentElement.style.height = `${adjustedHeight}px`;
            
            console.log('키보드 올라옴 - 높이 조정:', adjustedHeight);
          } else {
            // 키보드가 내려간 경우: 원래 높이로 복원
            const originalVH = initialHeight * 0.01;
            
            document.documentElement.style.setProperty('--current-vh', `${originalVH}px`);
            document.body.style.height = `${initialHeight}px`;
            document.documentElement.style.height = `${initialHeight}px`;
            
            console.log('키보드 내려감 - 원래 높이 복원:', initialHeight);
          }
        };
        
        window.visualViewport.addEventListener('resize', handleViewportChange);
        
        return () => {
          window.visualViewport?.removeEventListener('resize', handleViewportChange);
        };
      }
      
      // Visual Viewport가 지원되지 않는 경우 window resize 이벤트 사용
      const handleWindowResize = () => {
        const currentHeight = window.innerHeight;
        const keyboardHeight = initialHeight - currentHeight;
        
        if (keyboardHeight > 50) { // 50px 이상 차이나면 키보드로 판단
          const adjustedVH = currentHeight * 0.01;
          document.documentElement.style.setProperty('--current-vh', `${adjustedVH}px`);
          document.body.style.height = `${currentHeight}px`;
          document.documentElement.style.height = `${currentHeight}px`;
        } else {
          const originalVH = initialHeight * 0.01;
          document.documentElement.style.setProperty('--current-vh', `${originalVH}px`);
          document.body.style.height = `${initialHeight}px`;
          document.documentElement.style.height = `${initialHeight}px`;
        }
      };
      
      window.addEventListener('resize', handleWindowResize);
      
      return () => {
        window.removeEventListener('resize', handleWindowResize);
      };
    };
    
    const cleanup = setupKeyboardCompensation();
    
    return () => {
      cleanup?.();
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
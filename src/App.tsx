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
    
    // 키보드 감지 완전 차단 - Layout/Visual Viewport 영향 없음
    const setupKeyboardBlocking = () => {
      // 초기 viewport 크기 고정
      const initialWidth = window.innerWidth;
      const initialHeight = window.innerHeight;
      const initialVH = initialHeight * 0.01;
      
      // CSS 변수 설정
      document.documentElement.style.setProperty('--vh', `${initialVH}px`);
      document.documentElement.style.setProperty('--initial-width', `${initialWidth}px`);
      document.documentElement.style.setProperty('--initial-height', `${initialHeight}px`);
      
      // 고정 크기 강제 적용
      document.documentElement.style.height = `${initialHeight}px`;
      document.body.style.height = `${initialHeight}px`;
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      
      // Visual Viewport API 완전 무력화
      if (window.visualViewport) {
        // 모든 Visual Viewport 이벤트를 빈 함수로 오버라이드
        const originalAddEventListener = window.visualViewport.addEventListener;
        const originalRemoveEventListener = window.visualViewport.removeEventListener;
        
        // addEventListener를 무력화하여 키보드 관련 이벤트 감지 차단
        window.visualViewport.addEventListener = function(type: string, listener: any, options?: any) {
          // 키보드 관련 이벤트는 등록하지 않음
          if (type === 'resize' || type === 'scroll') {
            return;
          }
          return originalAddEventListener.call(this, type, listener, options);
        };
        
        // removeEventListener도 무력화
        window.visualViewport.removeEventListener = function(type: string, listener: any, options?: any) {
          if (type === 'resize' || type === 'scroll') {
            return;
          }
          return originalRemoveEventListener.call(this, type, listener, options);
        };
        
        // Visual Viewport 속성들을 고정값으로 오버라이드
        try {
          Object.defineProperty(window.visualViewport, 'width', {
            get: () => initialWidth,
            configurable: false
          });
          Object.defineProperty(window.visualViewport, 'height', {
            get: () => initialHeight,
            configurable: false
          });
          Object.defineProperty(window.visualViewport, 'offsetLeft', {
            get: () => 0,
            configurable: false
          });
          Object.defineProperty(window.visualViewport, 'offsetTop', {
            get: () => 0,
            configurable: false
          });
          Object.defineProperty(window.visualViewport, 'scale', {
            get: () => 1,
            configurable: false
          });
        } catch (e) {
          // 일부 브라우저에서 제한될 수 있음
        }
      }
      
      // window.innerHeight/innerWidth도 고정값 반환하도록 오버라이드
      const originalInnerHeight = window.innerHeight;
      const originalInnerWidth = window.innerWidth;
      
      Object.defineProperty(window, 'innerHeight', {
        get: () => originalInnerHeight,
        configurable: false
      });
      
      Object.defineProperty(window, 'innerWidth', {
        get: () => originalInnerWidth,
        configurable: false
      });
      
      // CSS의 100vh, 100vw도 고정값으로 강제
      const style = document.createElement('style');
      style.textContent = `
        :root {
          --real-vh: ${initialVH}px !important;
        }
        html, body {
          height: ${initialHeight}px !important;
          min-height: ${initialHeight}px !important;
          max-height: ${initialHeight}px !important;
        }
      `;
      document.head.appendChild(style);
      
      // 스크롤 위치 고정
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      return () => {
        // 복원은 하지 않음 (키보드 감지 차단 유지)
      };
    };
    
    const cleanup = setupKeyboardBlocking();
    
    // resize 이벤트도 완전 차단
    const blockResize = (e: Event) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      return false;
    };
    
    // 스크롤 이벤트 차단 (ion-content 제외)
    const preventScroll = (e: Event) => {
      const target = e.target as Element;
      const isInsideIonContent = target?.closest?.('ion-content');
      
      if (!isInsideIonContent) {
        e.preventDefault();
        e.stopImmediatePropagation();
        window.scrollTo(0, 0);
        return false;
      }
    };
    
    // 터치 이벤트 차단 (ion-content 제외)
    const preventTouch = (e: TouchEvent) => {
      const target = e.target as Element;
      const isInsideIonContent = target?.closest?.('ion-content');
      
      if (!isInsideIonContent) {
        e.preventDefault();
        return false;
      }
    };
    
    // 모든 viewport 변화 관련 이벤트 차단
    window.addEventListener('resize', blockResize, { passive: false });
    window.addEventListener('orientationchange', blockResize, { passive: false });
    window.addEventListener('scroll', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventTouch, { passive: false });
    document.addEventListener('scroll', preventScroll, { passive: false });
    document.body.addEventListener('scroll', preventScroll, { passive: false });
    
    return () => {
      cleanup?.();
      window.removeEventListener('resize', blockResize);
      window.removeEventListener('orientationchange', blockResize);
      window.removeEventListener('scroll', preventScroll);
      window.removeEventListener('touchmove', preventTouch);
      document.removeEventListener('scroll', preventScroll);
      document.body.removeEventListener('scroll', preventScroll);
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
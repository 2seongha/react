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
    
    // Visual Viewport API 완전 대체 및 무력화
    const setupViewportReplacement = () => {
      // 초기 viewport 크기를 절대값으로 고정
      const initialWidth = window.innerWidth;
      const initialHeight = window.innerHeight;
      const initialVH = initialHeight * 0.01;
      
      console.log(`고정 크기: ${initialWidth}x${initialHeight}`);
      
      // CSS 변수 설정
      document.documentElement.style.setProperty('--vh', `${initialVH}px`);
      document.documentElement.style.setProperty('--initial-width', `${initialWidth}px`);
      document.documentElement.style.setProperty('--initial-height', `${initialHeight}px`);
      
      // Visual Viewport API 프록시로 가로채기 (추가 보안)
      if (window.visualViewport) {
        console.log('React에서 Visual Viewport 추가 보안 설정');
        
        // 이미 프록시가 설정되어 있는지 확인
        if (window.visualViewport.width !== initialWidth || window.visualViewport.height !== initialHeight) {
          console.log('Visual Viewport가 아직 변경됨 - 추가 처리 필요');
          
          // 프록시가 작동하지 않는 경우 강제로 속성 오버라이드
          const originalViewport = window.visualViewport;
          const fixedProperties: Record<string, { value: number }> = {
            width: { value: initialWidth },
            height: { value: initialHeight },
            offsetLeft: { value: 0 },
            offsetTop: { value: 0 },
            pageLeft: { value: 0 },
            pageTop: { value: 0 },
            scale: { value: 1 }
          };
          
          // 각 속성을 개별적으로 오버라이드
          Object.keys(fixedProperties).forEach(prop => {
            try {
              Object.defineProperty(originalViewport, prop, {
                get: () => fixedProperties[prop].value,
                configurable: true
              });
            } catch (e) {
              console.log(`${prop} 속성 오버라이드 실패:`, e);
            }
          });
        }
        
        console.log('Visual Viewport 추가 보안 완료');
      }
      
      // window 크기 및 screen 속성들 추가 보안
      console.log('현재 window 크기:', window.innerWidth, 'x', window.innerHeight);
      
      // window 크기가 아직 변경되었다면 추가 처리
      if (window.innerWidth !== initialWidth || window.innerHeight !== initialHeight) {
        console.log('Window 크기 변경 감지 - 강제 복원');
        
        try {
          Object.defineProperty(window, 'innerHeight', {
            get: () => initialHeight,
            configurable: true
          });
          
          Object.defineProperty(window, 'innerWidth', {
            get: () => initialWidth,
            configurable: true
          });
          
          console.log('Window 크기 강제 복원 완료');
        } catch (e) {
          console.log('Window 속성 복원 실패:', e);
        }
      }
      
      // 주기적으로 Visual Viewport 크기 모니터링 및 강제 복원
      const monitorViewport = () => {
        if (window.visualViewport) {
          const currentWidth = window.visualViewport.width;
          const currentHeight = window.visualViewport.height;
          
          if (currentWidth !== initialWidth || currentHeight !== initialHeight) {
            console.log(`Viewport 크기 변경 감지: ${currentWidth}x${currentHeight} -> ${initialWidth}x${initialHeight}로 복원`);
            
            // 강제로 속성 재설정
            try {
              Object.defineProperty(window.visualViewport, 'width', {
                get: () => initialWidth,
                configurable: true
              });
              Object.defineProperty(window.visualViewport, 'height', {
                get: () => initialHeight,
                configurable: true
              });
            } catch (e) {}
          }
        }
      };
      
      // 100ms마다 모니터링
      const monitorInterval = setInterval(monitorViewport, 100);
      
      return () => {
        clearInterval(monitorInterval);
      };
      
      // 고정 크기 강제 적용
      document.documentElement.style.width = `${initialWidth}px`;
      document.documentElement.style.height = `${initialHeight}px`;
      document.documentElement.style.position = 'fixed';
      document.documentElement.style.top = '0';
      document.documentElement.style.left = '0';
      document.documentElement.style.overflow = 'hidden';
      
      document.body.style.width = `${initialWidth}px`;
      document.body.style.height = `${initialHeight}px`;
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      
      // CSS로 추가 강제
      const style = document.createElement('style');
      style.textContent = `
        * {
          --real-vw: ${initialWidth / 100}px !important;
          --real-vh: ${initialVH}px !important;
        }
        html, body, ion-app {
          width: ${initialWidth}px !important;
          height: ${initialHeight}px !important;
          min-width: ${initialWidth}px !important;
          min-height: ${initialHeight}px !important;
          max-width: ${initialWidth}px !important;
          max-height: ${initialHeight}px !important;
        }
      `;
      document.head.appendChild(style);
      
      // 스크롤 위치 고정
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      
      console.log('Viewport 완전 고정 완료');
      
      return () => {
        // 복원하지 않음
      };
    };
    
    const cleanup = setupViewportReplacement();
    
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
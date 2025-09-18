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
    
    // Viewport 크기 변화 완전 차단 - 무조건 고정 크기 유지
    const setupViewportFixed = () => {
      // 초기 viewport 크기를 완전히 고정
      const initialWidth = window.innerWidth;
      const initialHeight = window.innerHeight;
      const initialVH = initialHeight * 0.01;
      
      // CSS 변수 고정
      document.documentElement.style.setProperty('--vh', `${initialVH}px`);
      document.documentElement.style.setProperty('--initial-width', `${initialWidth}px`);
      document.documentElement.style.setProperty('--initial-height', `${initialHeight}px`);
      
      // 완전 고정 스타일 적용
      const applyFixedDimensions = () => {
        // HTML과 body를 초기 크기로 완전 고정
        document.documentElement.style.width = `${initialWidth}px`;
        document.documentElement.style.height = `${initialHeight}px`;
        document.documentElement.style.minWidth = `${initialWidth}px`;
        document.documentElement.style.minHeight = `${initialHeight}px`;
        document.documentElement.style.maxWidth = `${initialWidth}px`;
        document.documentElement.style.maxHeight = `${initialHeight}px`;
        document.documentElement.style.position = 'fixed';
        document.documentElement.style.top = '0';
        document.documentElement.style.left = '0';
        document.documentElement.style.overflow = 'hidden';
        
        document.body.style.width = `${initialWidth}px`;
        document.body.style.height = `${initialHeight}px`;
        document.body.style.minWidth = `${initialWidth}px`;
        document.body.style.minHeight = `${initialHeight}px`;
        document.body.style.maxWidth = `${initialWidth}px`;
        document.body.style.maxHeight = `${initialHeight}px`;
        document.body.style.position = 'fixed';
        document.body.style.top = '0';
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.bottom = '0';
        document.body.style.overflow = 'hidden';
        
        // 스크롤 위치도 고정
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      };
      
      // 초기 적용
      applyFixedDimensions();
      
      // Visual Viewport 크기 변화 강제 차단
      if (window.visualViewport) {
        let isBlocking = false;
        
        const blockViewportChanges = () => {
          if (isBlocking) return;
          isBlocking = true;
          
          // 즉시 고정 크기 복원
          applyFixedDimensions();
          
          // Visual Viewport를 초기 크기로 강제 복원 시도
          try {
            // 일부 브라우저에서 viewport 크기를 강제로 설정
            Object.defineProperty(window.visualViewport, 'width', {
              value: initialWidth,
              writable: false,
              configurable: false
            });
            Object.defineProperty(window.visualViewport, 'height', {
              value: initialHeight,
              writable: false,
              configurable: false
            });
          } catch (e) {
            // 읽기 전용 속성이므로 에러 무시
          }
          
          // 연속 호출로 강제 유지
          setTimeout(() => {
            applyFixedDimensions();
            setTimeout(() => {
              applyFixedDimensions();
              isBlocking = false;
            }, 10);
          }, 10);
        };
        
        // 모든 viewport 관련 이벤트 차단
        window.visualViewport.addEventListener('scroll', blockViewportChanges);
        window.visualViewport.addEventListener('resize', blockViewportChanges);
        
        // 추가 보안 - 주기적으로 크기 확인하고 복원
        const intervalId = setInterval(() => {
          if (window.visualViewport && 
              (window.visualViewport.width !== initialWidth || 
               window.visualViewport.height !== initialHeight)) {
            blockViewportChanges();
          }
          applyFixedDimensions();
        }, 100);
        
        return () => {
          window.visualViewport?.removeEventListener('scroll', blockViewportChanges);
          window.visualViewport?.removeEventListener('resize', blockViewportChanges);
          clearInterval(intervalId);
        };
      }
      
      // 일반 window resize도 차단
      const blockWindowResize = () => {
        applyFixedDimensions();
      };
      
      window.addEventListener('resize', blockWindowResize);
      window.addEventListener('orientationchange', blockWindowResize);
      
      return () => {
        window.removeEventListener('resize', blockWindowResize);
        window.removeEventListener('orientationchange', blockWindowResize);
      };
    };
    
    const cleanup = setupViewportFixed();
    
    // 스크롤과 터치 이벤트 완전 차단 (Viewport 고정 보조)
    const preventAllMovement = (e: Event) => {
      const target = e.target as Element;
      const isInsideIonContent = target?.closest?.('ion-content');
      
      if (!isInsideIonContent) {
        e.preventDefault();
        e.stopImmediatePropagation();
        
        // 즉시 위치 고정
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        
        return false;
      }
    };
    
    // 모든 움직임 관련 이벤트 차단
    const events = ['scroll', 'touchmove', 'wheel', 'touchstart', 'touchend'];
    const targets = [window, document, document.body, document.documentElement];
    
    targets.forEach(target => {
      events.forEach(eventType => {
        target.addEventListener(eventType, preventAllMovement, { passive: false });
      });
    });
    
    return () => {
      cleanup?.();
      
      // 모든 이벤트 리스너 제거
      targets.forEach(target => {
        events.forEach(eventType => {
          target.removeEventListener(eventType, preventAllMovement);
        });
      });
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
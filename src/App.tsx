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
    
    // Visual Viewport를 고정해서 키보드가 올라와도 스크롤 방지 (iOS 최적화)
    const setupViewportFixed = () => {
      // 초기 viewport 높이를 고정
      const initialHeight = window.innerHeight;
      document.documentElement.style.setProperty('--vh', `${initialHeight * 0.01}px`);
      document.documentElement.style.height = `${initialHeight}px`;
      document.body.style.height = `${initialHeight}px`;
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      
      // iOS에서 즉시 스크롤 차단을 위한 동기 처리
      const immediateScrollReset = () => {
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
      };
      
      // Visual Viewport 이벤트로 스크롤 완전 차단 (iOS 최적화)
      if (window.visualViewport) {
        let rafId: number;
        
        const handleViewportChange = () => {
          // 즉시 동기 스크롤 리셋 (깜빡임 방지)
          immediateScrollReset();
          
          // 추가적인 비동기 보정
          if (rafId) {
            cancelAnimationFrame(rafId);
          }
          
          rafId = requestAnimationFrame(() => {
            immediateScrollReset();
            
            // iOS에서 Visual Viewport offset 보정
            if (window.visualViewport) {
              const offsetX = window.visualViewport.offsetLeft;
              const offsetY = window.visualViewport.offsetTop;
              if (offsetX !== 0 || offsetY !== 0) {
                window.scrollTo(-offsetX, -offsetY);
              }
            }
          });
        };
        
        const handleViewportResize = () => {
          immediateScrollReset();
          
          // 리사이즈 완료 후 추가 보정
          setTimeout(() => {
            immediateScrollReset();
          }, 10);
          
          handleViewportChange();
        };
        
        // Visual Viewport 이벤트 리스닝
        window.visualViewport.addEventListener('scroll', handleViewportChange);
        window.visualViewport.addEventListener('resize', handleViewportResize);
        
        return () => {
          if (rafId) {
            cancelAnimationFrame(rafId);
          }
          window.visualViewport?.removeEventListener('scroll', handleViewportChange);
          window.visualViewport?.removeEventListener('resize', handleViewportResize);
        };
      }
    };
    
    const cleanup = setupViewportFixed();
    
    // viewport 스크롤 완전 차단 (iOS 최적화)
    let isScrollPreventing = false;
    
    const preventViewportScroll = (e: Event) => {
      const target = e.target as Element;
      const isInsideIonContent = target?.closest?.('ion-content');
      
      if (!isInsideIonContent && !isScrollPreventing) {
        isScrollPreventing = true;
        e.preventDefault();
        e.stopImmediatePropagation();
        
        // 즉시 스크롤 위치 고정 (동기)
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        
        // 추가 보정 (비동기)
        requestAnimationFrame(() => {
          window.scrollTo(0, 0);
          document.body.scrollTop = 0;
          document.documentElement.scrollTop = 0;
          isScrollPreventing = false;
        });
        
        return false;
      }
    };
    
    const preventTouchMove = (e: TouchEvent) => {
      const target = e.target as Element;
      const isInsideIonContent = target?.closest?.('ion-content');
      
      if (!isInsideIonContent) {
        // 즉시 스크롤 위치 고정
        window.scrollTo(0, 0);
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }
    };
    
    // 모든 스크롤 관련 이벤트 차단 (더 적극적)
    window.addEventListener('scroll', preventViewportScroll, { passive: false });
    window.addEventListener('touchmove', preventTouchMove, { passive: false });
    window.addEventListener('wheel', preventViewportScroll, { passive: false });
    document.addEventListener('scroll', preventViewportScroll, { passive: false });
    document.body.addEventListener('scroll', preventViewportScroll, { passive: false });
    document.documentElement.addEventListener('scroll', preventViewportScroll, { passive: false });
    
    return () => {
      cleanup?.();
      window.removeEventListener('scroll', preventViewportScroll);
      window.removeEventListener('touchmove', preventTouchMove);
      window.removeEventListener('wheel', preventViewportScroll);
      document.removeEventListener('scroll', preventViewportScroll);
      document.body.removeEventListener('scroll', preventViewportScroll);
      document.documentElement.removeEventListener('scroll', preventViewportScroll);
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
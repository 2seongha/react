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
import { preloadCriticalImages, preloadAllImages, calculateProgress, type ImagePreloadProgress } from './utils/imagePreloader';

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
  const [imageProgress, setImageProgress] = useState<ImagePreloadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
    isComplete: false
  });
  const [isImagesReady, setIsImagesReady] = useState(false);

  useEffect(() => {
    // 웹뷰 초기화와 이미지 preload를 병렬로 실행
    const initializeApp = async () => {
      try {
        // 1단계: 중요 이미지들을 먼저 preload
        console.log('⚡ 중요 이미지 preload 시작...');
        await preloadCriticalImages((loaded, total) => {
          const progress = calculateProgress(loaded, total);
          setImageProgress(prev => ({
            ...progress,
            total: prev.total || total // 전체 로딩 진행률을 위해 전체 이미지 수 유지
          }));
        });

        // 2단계: 웹뷰 초기화 (중요 이미지 로딩과 병렬 실행 가능)
        console.log('웹뷰 초기화 시작...');
        const webviewPromise = initWebview(
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

        // 3단계: 나머지 모든 이미지 preload (백그라운드에서)
        const allImagesPromise = preloadAllImages((loaded, total) => {
          const progress = calculateProgress(loaded, total);
          setImageProgress(progress);
          
          if (progress.isComplete) {
            console.log('🎉 모든 이미지 로딩 완료!');
            setIsImagesReady(true);
          }
        });

        // 웹뷰 초기화 완료 대기
        const success = await webviewPromise;
        if (success) {
          console.log('웹뷰 초기화 완료!');
          setIsWebviewReady(true);
        }

        // 모든 이미지 로딩도 완료 대기 (앱 시작에는 필수가 아님)
        allImagesPromise.catch(error => {
          console.warn('일부 이미지 로딩 실패:', error);
          setIsImagesReady(true); // 실패해도 앱은 계속 실행
        });
        
      } catch (error) {
        console.error('앱 초기화 실패:', error);
        // 초기화 실패해도 앱은 실행
        setIsWebviewReady(true);
        setIsImagesReady(true);
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

  // 웹뷰 초기화 완료될 때까지 로딩 화면 표시
  if (!isWebviewReady) {
    return (
      <IonApp>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '18px',
            color: 'var(--ion-color-primary)',
            marginBottom: '30px'
          }}>
            앱 초기화 중...
          </div>
          
          {/* 이미지 로딩 진행률 */}
          <div style={{
            width: '100%',
            maxWidth: '300px',
            marginBottom: '20px'
          }}>
            <div style={{
              fontSize: '14px',
              color: 'var(--ion-color-medium)',
              marginBottom: '8px'
            }}>
              이미지 로딩 중... {imageProgress.percentage}%
            </div>
            
            {/* 프로그레스 바 */}
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: 'var(--ion-color-light)',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${imageProgress.percentage}%`,
                height: '100%',
                backgroundColor: 'var(--ion-color-primary)',
                transition: 'width 0.3s ease'
              }} />
            </div>
            
            <div style={{
              fontSize: '12px',
              color: 'var(--ion-color-medium)',
              marginTop: '4px'
            }}>
              {imageProgress.loaded} / {imageProgress.total} 이미지
            </div>
          </div>
          
          {/* 추가 상태 정보 */}
          <div style={{
            fontSize: '12px',
            color: 'var(--ion-color-medium)',
            opacity: 0.7
          }}>
            {isImagesReady ? '✅ 이미지 로딩 완료' : '🖼️ 이미지 로딩 중...'}
          </div>
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
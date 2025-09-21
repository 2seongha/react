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

    window.addEventListener('scroll', function () {
      window.scrollTo(0, 0); // 항상 top으로 되돌리기
    });

    const isActuallyScrollable = (el: Element | null): boolean => {
      if (!el) return false;

      const style = getComputedStyle(el);
      const canScrollY =
        (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
        el.scrollHeight > el.clientHeight;

      const canScrollX =
        (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
        el.scrollWidth > el.clientWidth;

      return canScrollY || canScrollX;
    };

    const findActuallyScrollableParent = async (touch: any, el: HTMLElement | null): Promise<Element | null> => {
      let current = document.elementFromPoint(touch.clientX, touch.clientY);
      // let current: HTMLElement | null = el;
      console.log(current);

      while (current && current !== document.body) {
        // ✅ Ionic: ion-content가 나타나면 getScrollElement 사용
        if (current.tagName === 'ION-DATETIME') {
          return current;
        }
        if (current.tagName === 'ION-CONTENT') {
          const ionContent = current as any; // TS용 any, 또는 Capacitor/Ionic 타입 쓰면 더 좋음
          if (ionContent.getScrollElement) {
            const scrollEl: HTMLElement = await ionContent.getScrollElement();
            if (isActuallyScrollable(scrollEl)) {
              return scrollEl;
            }
          }
          return null;
        }

        // ✅ 일반 DOM: overflow + scrollHeight 판별
        if (isActuallyScrollable(current)) return current;
        current = current.parentElement;
      }

      return null;
    };

    const handleTouchMove = async (e: TouchEvent) => {
      const target = e.target as HTMLElement;
      const touch = e.touches[0]; // 첫 번째 터치 포인트
      const scrollableParent = await findActuallyScrollableParent(touch, target);
      if (!scrollableParent) {
        e.preventDefault(); // ✅ 스크롤 불가능하면 차단
      }
    };

    window.addEventListener('touchmove', (e) => {
      // async 핸들러는 바로 쓸 수 없어서 이렇게 래핑
      handleTouchMove(e);
    }, { passive: false });
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
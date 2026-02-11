import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect, useLocation } from 'react-router-dom';
import React, { useCallback, useEffect, useRef, useState } from 'react';

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
import { useImagePreload } from './hooks/useImagePreload';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Attach from './pages/Attach';
import PersonalExpense from './pages/PersonalExpense';
import LoadingIndicator from './components/LoadingIndicator';
import 'simple-notify/dist/simple-notify.css'
import CreditCard from './pages/CreditCard';

const App: React.FC = () => {
  const themeMode = useAppStore(state => state.themeMode);

  // 렌더링과 무관한 플래그들은 모두 ref
  const webviewInitializedRef = useRef(false);
  const themeInitializedRef = useRef(false);

  const [fixedHeight, setFixedHeight] = useState<number>(0);
  const { isLoading: imageLoading, loadedCount } = useImagePreload();


  // 초기화 상태를 모두 확인하는 함수
  const checkAllInitialized = useCallback(() => {
    if (
      webviewInitializedRef.current &&
      themeInitializedRef.current &&
      imageLoading
    ) {

      console.log("앱 초기화 완료!");
      console.log(`이미지 ${loadedCount}개 캐싱 완료`);

      const initialHeight = document.documentElement.offsetHeight;
      setFixedHeight(initialHeight); // 여기서 단 1번 렌더링
    }
  }, [imageLoading, loadedCount]);


  // 1) 테마 설정 + 테마 완료 플래그 등록
  useEffect(() => {
    const html = document.documentElement;

    if (themeMode === "dark") {
      html.setAttribute("data-theme", "dark");
    } else if (themeMode === "light") {
      html.setAttribute("data-theme", "light");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      html.setAttribute("data-theme", prefersDark ? "dark" : "light");

      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        html.setAttribute("data-theme", e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleChange);
    }

    // 플래그 업데이트
    if (!themeInitializedRef.current) {
      themeInitializedRef.current = true;
      initializeWebview(); // 테마가 준비되면 웹뷰 초기화 시작
    }

  }, [themeMode]);


  // 2) 웹뷰 초기화
  const initializeWebview = async () => {
    try {
      console.log("웹뷰 초기화 시작...");
      const success = await initWebview();
      if (success) {
        console.log("웹뷰 초기화 완료!");
        webviewInitializedRef.current = true;
        checkAllInitialized();
      }
    } catch (err) {
      console.error("웹뷰 초기화 실패:", err);
    }
  };


  // 3) 이미지 로딩 완료 감지 후 최종 체크
  useEffect(() => {
    checkAllInitialized();
  }, [imageLoading, loadedCount]);


  // 4) 초기화 로딩 화면
  if (!fixedHeight) return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--ion-background-color)",
        }}
      >
        <LoadingIndicator color="var(--ion-text-color)" />
      </div>
    </>
  );

  return (
    <IonApp style={{ height: fixedHeight }}>
      <IonReactRouter >
        <Menu />
        <IonRouterOutlet mode={getPlatformMode()} id="main-content">
          <Route path="/app/home" component={Home} exact />
          <Route path="/app/notifications" component={Notifications} exact />
          <Route path="/app/more" component={More} exact />
          <Route path="/flowList/:AREA_CODE" component={FlowList} exact />
          <Route path="/approval/:P_AREA_CODE/:AREA_CODE/:P_AREA_CODE_TXT/:AREA_CODE_TXT" component={Approval} exact />
          <Route path="/detail/:FLOWNO/:P_AREA_CODE/:AREA_CODE/:P_AREA_CODE_TXT/:AREA_CODE_TXT/:isNotification?" component={Detail} exact />
          <Route path="/notice" component={Notice} exact />
          <Route path="/settings" component={Settings} exact />
          <Route path="/myPage" component={MyPage} exact />
          <Route path="/search" component={Search} exact />
          <Route path="/privacyPolicy" component={PrivacyPolicy} exact />
          <Route path="/termsOfUse" component={TermsOfUse} exact />
          <Route path="/attach/:FileName/:AttachUrl?" component={Attach} exact />
          <Route path="/personalExpense" component={PersonalExpense} exact />
          <Route path="/creditCard" component={CreditCard} exact />
          <Redirect exact from="/" to="/app/home" />
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

export const modalStack: string[] = [];

export const pushModal = (id: string) => {
  modalStack.push(id);
};

export const popModal = () => {
  modalStack.pop();
};

export const getTopModalId = () => {
  return modalStack[modalStack.length - 1] || null;
};
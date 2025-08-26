// webview.ts
// 웹뷰일 때 실행되는 메소드들

interface ShellPadding {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

interface KeyboardVisibility {
  isOpen: boolean;
  height: number;
}

interface CorpModel {
  // 필요한 corp 모델 속성들 정의
  [key: string]: any;
}

interface DeviceInfo {
  [key: string]: any;
}

// 글로벌 웹뷰 함수들 선언
declare global {
  interface Window {
    webviewTheme: (theme: string) => void;
    webviewLogout: () => void;
    webviewPushSetting: () => void;
    webviewHistoryPop: () => void;
    webviewToast: (msg: string) => void;
    webviewHaptic: (type: string) => void;
    webviewNoticeOnOff: (val: string, org: string) => void;
    webviewAppEnd: () => void;
    webviewAttach: (title: string, url: string) => void;
    webviewBadge: (badge: string) => void;
    webviewPrivacyPolicy: () => void;
    webviewTermsOfUse: () => void;
    webviewBiometrics: () => void;
    initWebview: () => void;
  }
}

// 웹뷰 함수들 래퍼
export const webviewTheme = (theme: string): void => {
  if (typeof window !== 'undefined' && window.webviewTheme) {
    window.webviewTheme(theme);
  }
};

export const webviewLogout = (): void => {
  if (typeof window !== 'undefined' && window.webviewLogout) {
    window.webviewLogout();
  }
};

export const webviewPushSetting = (): void => {
  if (typeof window !== 'undefined' && window.webviewPushSetting) {
    window.webviewPushSetting();
  }
};

export const webviewHistoryPop = (): void => {
  if (typeof window !== 'undefined' && window.webviewHistoryPop) {
    window.webviewHistoryPop();
  } else {
    // 브라우저 히스토리 백
    window.history.back();
  }
};

export const webviewToast = (msg: string): void => {
  if (typeof window !== 'undefined' && window.webviewToast) {
    window.webviewToast(msg);
  }
};

export const webviewHaptic = (type: string): void => {
  if (typeof window !== 'undefined' && window.webviewHaptic) {
    window.webviewHaptic(type);
  }
};

export const webviewNoticeOnOff = (val: string, org: string): void => {
  if (typeof window !== 'undefined' && window.webviewNoticeOnOff) {
    window.webviewNoticeOnOff(val, org);
  }
};

export const webviewAppEnd = (): void => {
  if (typeof window !== 'undefined' && window.webviewAppEnd) {
    window.webviewAppEnd();
  }
};

export const webviewAttach = (title: string, url: string): void => {
  if (typeof window !== 'undefined' && window.webviewAttach) {
    window.webviewAttach(title, url);
  }
};

export const webviewBadge = (badge: string): void => {
  if (typeof window !== 'undefined' && window.webviewBadge) {
    window.webviewBadge(badge);
  }
};

export const webviewPrivacyPolicy = (): void => {
  if (typeof window !== 'undefined' && window.webviewPrivacyPolicy) {
    window.webviewPrivacyPolicy();
  }
};

export const webviewTermsOfUse = (): void => {
  if (typeof window !== 'undefined' && window.webviewTermsOfUse) {
    window.webviewTermsOfUse();
  }
};

export const webviewBiometrics = (): void => {
  if (typeof window !== 'undefined' && window.webviewBiometrics) {
    window.webviewBiometrics();
  }
};

// Completer 역할을 하는 Promise resolver들
let paddingResolver: ((value: boolean) => void) | null = null;
let userInfoResolver: ((value: boolean) => void) | null = null;
let tokenResolver: ((value: boolean) => void) | null = null;

const paddingPromise = new Promise<boolean>((resolve) => {
  paddingResolver = resolve;
});

const userInfoPromise = new Promise<boolean>((resolve) => {
  userInfoResolver = resolve;
});

const tokenPromise = new Promise<boolean>((resolve) => {
  tokenResolver = resolve;
});

// 웹뷰 초기화 함수
export const initWebview = async (): Promise<boolean> => {
  await _initWebview();

  await Promise.all([
    paddingPromise,
    tokenPromise,
    userInfoPromise,
  ]);

  return true;
};

const _initWebview = async (): Promise<void> => {
  const isWebView = 'Y'; // 환경변수 가져오기
  console.log('----- webview Init Start -----', isWebView);
  document.documentElement.style.setProperty('--ion-safe-area-top', `40px`);
  document.documentElement.style.setProperty('--ion-safe-area-bottom', `58px`);

  if (isWebView == 'Y') {
    // 패딩 정보 수신
    const receivePadding = (event: Event) => {
      console.log('----- webview receivePadding Start -----');
      const customEvent = event as CustomEvent;
      const detail = JSON.parse(customEvent.detail);

      const result: ShellPadding = {
        top: Math.round(parseFloat(detail.top)),
        bottom: Math.round(parseFloat(detail.bottom)),
        left: Math.round(parseFloat(detail.left)),
        right: Math.round(parseFloat(detail.right)),
      };

      // 패딩 정보를 사용하여 UI 조정
      console.log('Padding received:', result);
      document.documentElement.style.setProperty('--ion-safe-area-top', `${result.top}px`);
      document.documentElement.style.setProperty('--ion-safe-area-bottom', `${result.bottom}px`);

      // 초기화 완료 시에만 resolver 호출
      if (paddingResolver) {
        paddingResolver(true);
        paddingResolver = null;
      }
      console.log('----- webview receivePadding End -----');
    };

    window.removeEventListener('receivePadding', receivePadding);
    window.addEventListener('receivePadding', receivePadding);

    // 토큰 정보 수신
    const receiveToken = (event: Event) => {
      console.log('----- webview receiveToken Start -----');
      const customEvent = event as CustomEvent;
      const detail = JSON.parse(customEvent.detail);

      const tokens = {
        deviceToken: detail.deviceToken,
        deviceInfo: detail.deviceInfo
      };

      // localStorage에 저장
      localStorage.setItem('deviceToken', tokens.deviceToken);
      localStorage.setItem('deviceInfo', JSON.stringify(tokens.deviceInfo));

      // 토큰 정보 처리
      if (tokenResolver) {
        tokenResolver(true);
        tokenResolver = null;
      }
      console.log('----- webview receiveToken End -----');
    };

    window.removeEventListener('receiveToken', receiveToken);
    window.addEventListener('receiveToken', receiveToken);

    // 사용자 정보 수신
    const receiveUserInfo = (event: Event) => {
      console.log('----- webview receiveUserInfo Start -----');
      const customEvent = event as CustomEvent;
      const detail = JSON.parse(customEvent.detail);

      const userInfo = {
        loginId: detail.loginId,
        corp: JSON.parse(detail.corp) as CorpModel
      };

      // 사용자 정보 처리
      console.log('User info received:', userInfo.loginId);

      if (userInfoResolver) {
        userInfoResolver(true);
        userInfoResolver = null;
      }
      console.log('----- webview receiveUserInfo End -----');
    };

    window.removeEventListener('receiveUserInfo', receiveUserInfo);
    window.addEventListener('receiveUserInfo', receiveUserInfo);

    // 뒤로가기 버튼 처리
    const receiveBack = () => {
      console.log('----- webview receiveBack -----');

      const currentPath = window.location.pathname;

      // 경로가 "/app"으로 시작하면 종료 처리
      if (currentPath.startsWith('/app/')) {
        webviewAppEnd();
      } else {
        window.history.back();
      }
    };

    window.removeEventListener('receiveBack', receiveBack);
    window.addEventListener('receiveBack', receiveBack);

    // 생체인증 결과 수신
    const receiveBiometrics = (event: Event) => {
      console.log('----- webview receiveBiometrics -----');
      const customEvent = event as CustomEvent;
      const detail = JSON.parse(customEvent.detail);

      const didAuthenticate = detail.didAuthenticate;

      if (didAuthenticate === 'true') {
        webviewToast('생체 인증에 성공했습니다');
        // React Router로 홈으로 이동
        window.location.href = '/';
      }
    };

    window.removeEventListener('receiveBiometrics', receiveBiometrics);
    window.addEventListener('receiveBiometrics', receiveBiometrics);

    // 키보드 상태 수신
    const receiveKeyboard = (event: Event) => {
      console.log('----- webview receiveKeyboard -----');
      const customEvent = event as CustomEvent;
      const detail = JSON.parse(customEvent.detail);

      const result: KeyboardVisibility = {
        isOpen: detail.isOpen === 'true',
        height: Math.round(parseFloat(detail.keyboardHeight) || 0),
      };

      // 키보드 상태에 따른 UI 조정
      console.log('Keyboard visibility:', result.isOpen, result.height);
      if (result.isOpen) {
        document.documentElement.style.setProperty('--keyboard-height', `${result.height}px`);
      } else {
        document.documentElement.style.setProperty('--keyboard-height', '0px');
      }
    };

    window.removeEventListener('receiveKeyboard', receiveKeyboard);
    window.addEventListener('receiveKeyboard', receiveKeyboard);

    // 웹뷰 초기화 완료 신호
    if (typeof window !== 'undefined' && window.initWebview) {
      window.initWebview();
    }
  } else {
    // 웹뷰가 아닌 경우 바로 완료 처리
    if (paddingResolver) {
      paddingResolver(true);
      paddingResolver = null;
    }
    if (tokenResolver) {
      tokenResolver(true);
      tokenResolver = null;
    }
    if (userInfoResolver) {
      userInfoResolver(true);
      userInfoResolver = null;
    }
  }
};

// localStorage 헬퍼 함수들
export const getStoredToken = (key: 'accessToken' | 'refreshToken' | 'deviceToken'): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

export const getStoredDeviceInfo = (): DeviceInfo | null => {
  if (typeof window !== 'undefined') {
    const deviceInfo = localStorage.getItem('deviceInfo');
    return deviceInfo ? JSON.parse(deviceInfo) : null;
  }
  return null;
};
// webview-interop.ts

declare global {
  interface Window {
    webviewTheme?: (theme: string) => void;
    webviewLogout?: () => void;
    webviewPushSetting?: () => void;
    webviewHistoryPop?: () => void;
    webviewToast?: (msg: string) => void;
    webviewHaptic?: (type: string) => void;
    webviewNoticeOnOff?: (val: string, org: string) => void;
    webviewAppEnd?: () => void;
    webviewAttach?: (title: string, url: string) => void;
    webviewPrivacyPolicy?: () => void;
    webviewTermsOfUse?: () => void;
    webviewBiometrics?: () => void;
    initWebview?: () => void;
  }
}

// ✅ 예시 함수 정의 (없으면 정의해서 사용하거나, native에서 주입됨)
export const webviewTheme = (theme: string) => {
  window.webviewTheme?.(theme);
};

export const webviewLogout = () => {
  window.webviewLogout?.();
};

export const webviewPushSetting = () => {
  window.webviewPushSetting?.();
};

export const webviewToast = (msg: string) => {
  window.webviewToast?.(msg);
};

export const webviewHaptic = (type: string) => {
  window.webviewHaptic?.(type);
};

export const webviewNoticeOnOff = (val: string, org: string) => {
  window.webviewNoticeOnOff?.(val, org);
};

export const webviewAppEnd = () => {
  window.webviewAppEnd?.();
};

export const webviewAttach = (title: string, url: string) => {
  window.webviewAttach?.(title, url);
};

export const webviewPrivacyPolicy = () => {
  window.webviewPrivacyPolicy?.();
};

export const webviewTermsOfUse = () => {
  window.webviewTermsOfUse?.();
};

export const webviewBiometrics = () => {
  window.webviewBiometrics?.();
};

export const initWebview = () => {
  window.initWebview?.();
};
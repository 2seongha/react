import React, { useEffect } from 'react';
import {
  IonContent,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonIcon,
  IonToggle,
  IonCard,
  IonItem
} from '@ionic/react';
import useAppStore from '../stores/appStore';
import AppBar from '../components/AppBar';
import { webviewLogout, webviewPushSetting, webviewTheme } from '../webview';
import { chevronForward, contrastOutline, moonOutline, open, sunnyOutline } from 'ionicons/icons';
import "./Settings.css";
import CustomDialog from '../components/Dialog';
import { patchPsuhAllow, postFcmToken } from '../stores/service';

const Settings: React.FC = () => {
  const themeMode = useAppStore(state => state.themeMode);
  const setThemeMode = useAppStore(state => state.setThemeMode);

  const pushAllow = useAppStore(state => state.pushAllow);
  const getPushAllow = useAppStore(state => state.getPushAllow);
  const setPushAllow = useAppStore(state => state.setPushAllow);

  useEffect(() => {
    getPushAllow();
  }, [])

  const handleThemeChange = (value: string) => {
    const newTheme = value as 'light' | 'dark' | 'system';

    // AppStore에 저장 (영구적으로 localStorage에 저장됨)
    setThemeMode(newTheme);

    // 웹뷰에 테마 변경 알림
    webviewTheme(newTheme);
  };

  const handleLogout = () => {
    postFcmToken([localStorage.getItem('deviceToken') || ''], [], null);
    webviewLogout();
    return true;
  };

  return (
    <IonPage className='settings'>
      <AppBar title={<span>설정</span>} showBackButton={true} />
      <IonContent
        scrollX={false}
        scrollY={false}
        scrollEvents={false}
        style={{
          '--padding-start': '21px',
          '--padding-end': '21px',
        }}>
        <IonCard className='settings-card' style={{ marginTop: '12px' }}>
          <span className='settings-card-title'>테마</span>
          <div className='settings-card-button'>
            <span>모드</span>
            <IonSegment
              mode='ios'
              value={themeMode}
              onIonChange={e => handleThemeChange(e.detail.value as string)}
              style={{
                width: '210px',
                '--background': 'transparent',
                border: '1px solid var(--custom-border-color-100)'
              }}
            >
              <IonSegmentButton value="light" style={{
                '--indicator-color': 'var(--ion-color-primary)',
                '--border-color': 'var(--custom-border-color-100)',
              }}>
                <IonIcon src={sunnyOutline} size='small'></IonIcon>
              </IonSegmentButton>
              <IonSegmentButton value="system" style={{
                '--indicator-color': 'var(--ion-color-primary)',
                '--border-color': 'var(--custom-border-color-100)',
              }}>
                <IonIcon src={contrastOutline} size='small'></IonIcon>
              </IonSegmentButton>
              <IonSegmentButton value="dark" style={{
                '--indicator-color': 'var(--ion-color-primary)',
                '--border-color': 'var(--custom-border-color-100)',
              }}>
                <IonIcon src={moonOutline} size='small'></IonIcon>
              </IonSegmentButton>
            </IonSegment>
          </div>
        </IonCard>
        <IonCard className='settings-card' style={{ marginTop: '12px' }}>
          <span className='settings-card-title'>푸시 알림</span>
          <div className='settings-card-button'>
            <span>개인 알림</span>
            <IonToggle checked={pushAllow?.PERSONAL_ALLOW === 'Y' ? true : false} onIonChange={(e) => {
              const checked = e.target.checked;
              patchPsuhAllow(checked ? 'Y' : 'N', pushAllow?.NOTICE_ALLOW || 'Y');
            }} />
          </div>
          <div className='settings-card-button'>
            <span>공지 알림</span>
            <IonToggle checked={pushAllow?.NOTICE_ALLOW === 'Y' ? true : false} onIonChange={(e) => {
              const checked = e.target.checked;
              patchPsuhAllow(pushAllow?.PERSONAL_ALLOW || 'Y', checked ? 'Y' : 'N');
            }} />
          </div>
          <div className='settings-card-button ion-activatable' onClick={() => {
            webviewPushSetting();
            // ion
          }}>
            <span>디바이스 설정</span>
            <IonIcon src={chevronForward} slot='end' style={{ margin: 0 }} size='small' />
          </div>
        </IonCard>
        <IonItem
          className='settings-logout-button'
          button
          mode='md'
          id='logout-trigger'>
          로그아웃
          <IonIcon src={chevronForward} slot='end' style={{ margin: 0 }} size='small' />
        </IonItem>
        <CustomDialog
          trigger="logout-trigger"
          title="알림"
          message="로그아웃 하시겠습니까?"
          firstButtonText='아니오'
          secondButtonText='예'
          onSecondButtonClick={handleLogout}
        />
      </IonContent>
    </IonPage >
  );
};

export default Settings;
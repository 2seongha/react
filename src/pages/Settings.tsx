import React, { ReactNode } from 'react';
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
import { webviewLogout, webviewTheme } from '../webview';
import { themeIcon, bellIcon } from '../assets/images';
import CachedImage from '../components/CachedImage';
import { chevronForward, contrastOutline, moonOutline, sunnyOutline } from 'ionicons/icons';
import "./Settings.css";
import CustomDialog from '../components/Dialog';

const Settings: React.FC = () => {
  const themeMode = useAppStore(state => state.themeMode);
  const setThemeMode = useAppStore(state => state.setThemeMode);

  const handleThemeChange = (value: string) => {
    const newTheme = value as 'light' | 'dark' | 'system';

    // AppStore에 저장 (영구적으로 localStorage에 저장됨)
    setThemeMode(newTheme);

    // 웹뷰에 테마 변경 알림
    webviewTheme(newTheme);
  };

  const handleLogout = () => {
    webviewLogout();
  };

  return (
    <IonPage className='settings'>
      <AppBar title={<span>설정</span>} showBackButton={true} />
      <IonContent style={{
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
            <IonToggle />
          </div>
          <div className='settings-card-button'>
            <span>공지 알림</span>
            <IonToggle />
          </div>
        </IonCard>
        <IonItem
          className='settings-logout-button'
          button
          mode='md'
          id='logout-trigger'>
          로그아웃
          <IonIcon src={chevronForward} slot='end' style={{ margin: 0 }} size='small'></IonIcon>
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
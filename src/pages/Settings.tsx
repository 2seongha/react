import React from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonBackButton,
  IonSegment,
  IonSegmentButton
} from '@ionic/react';
import useAppStore from '../stores/appStore';
import AppBar from '../components/AppBar';
import { webviewTheme } from '../webview';
import LazyImage from '../components/LazyImage';
import { themeIcon, bellIcon, lockIcon } from '../assets/images';

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


  return (
    <IonPage>
      <AppBar title={<span>설정</span>} showBackButton={true} />
      <IonContent>
        <IonList>
          <IonItem>
            <LazyImage 
              src={themeIcon} 
              style={{ width: '24px', height: '24px', marginRight: '16px' }}
              alt="테마 설정"
              placeholder={<div style={{ width: '24px', height: '24px', backgroundColor: '#f0f0f0', borderRadius: '4px' }} />}
            />
            <IonLabel>
              <h3>테마 설정</h3>
              <IonSegment 
                value={themeMode} 
                onIonChange={e => handleThemeChange(e.detail.value as string)}
                style={{ marginTop: '8px' }}
              >
                <IonSegmentButton value="light">
                  <IonLabel>라이트</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="system">
                  <IonLabel>시스템</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="dark">
                  <IonLabel>다크</IonLabel>
                </IonSegmentButton>
              </IonSegment>
            </IonLabel>
          </IonItem>
          
          <IonItem button>
            <LazyImage 
              src={bellIcon} 
              style={{ width: '24px', height: '24px', marginRight: '16px' }}
              alt="알림 설정"
              placeholder={<div style={{ width: '24px', height: '24px', backgroundColor: '#f0f0f0', borderRadius: '4px' }} />}
            />
            <IonLabel>알림 설정</IonLabel>
          </IonItem>
          
          <IonItem button>
            <LazyImage 
              src={lockIcon} 
              style={{ width: '24px', height: '24px', marginRight: '16px' }}
              alt="보안 설정"
              placeholder={<div style={{ width: '24px', height: '24px', backgroundColor: '#f0f0f0', borderRadius: '4px' }} />}
            />
            <IonLabel>보안 설정</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
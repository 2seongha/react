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

const Settings: React.FC = () => {
  const themeMode = useAppStore(state => state.themeMode);
  const setThemeMode = useAppStore(state => state.setThemeMode);

  const handleThemeChange = (value: string) => {
    setThemeMode(value as 'light' | 'dark' | 'system');
  };

  return (
    <IonPage>
      <AppBar title={<span>설정</span>} showBackButton={true} />
      <IonContent>
        <IonList>
          <IonItem>
            <img 
              src="/assets/images/icon/config/theme.webp" 
              style={{ width: '24px', height: '24px', marginRight: '16px' }}
              alt="Theme"
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
            <img 
              src="/assets/images/icon/config/bell.webp" 
              style={{ width: '24px', height: '24px', marginRight: '16px' }}
              alt="Notification"
            />
            <IonLabel>알림 설정</IonLabel>
          </IonItem>
          
          <IonItem button>
            <img 
              src="/assets/images/icon/config/lock.webp" 
              style={{ width: '24px', height: '24px', marginRight: '16px' }}
              alt="Security"
            />
            <IonLabel>보안 설정</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
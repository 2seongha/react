import React, { useState } from 'react';
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
  IonSegmentButton,
  IonInput,
  IonButton
} from '@ionic/react';
import useAppStore from '../stores/appStore';
import AppBar from '../components/AppBar';
import { webviewTheme, webviewBadge, webviewToast, webviewHaptic } from '../webview';
import LazyImage from '../components/LazyImage';
import { themeIcon, bellIcon, lockIcon } from '../assets/images';

const Settings: React.FC = () => {
  const themeMode = useAppStore(state => state.themeMode);
  const setThemeMode = useAppStore(state => state.setThemeMode);
  const [badgeNumber, setBadgeNumber] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  const handleThemeChange = (value: string) => {
    const newTheme = value as 'light' | 'dark' | 'system';

    // AppStore에 저장 (영구적으로 localStorage에 저장됨)
    setThemeMode(newTheme);

    // 웹뷰에 테마 변경 알림
    webviewTheme(newTheme);
  };

  const handleBadgeTest = () => {
    console.log('Badge 테스트:', badgeNumber);
    webviewBadge(badgeNumber);
  };

  const handleToastTest = () => {
    console.log('Toast 테스트:', toastMessage);
    webviewToast(toastMessage);
  };

  const handleHapticTest = (hapticType: string) => {
    console.log('Haptic 테스트:', hapticType);
    webviewHaptic(hapticType);
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

            />
            <IonLabel>알림 설정</IonLabel>
          </IonItem>

          <IonItem button>
            <LazyImage
              src={lockIcon}
              style={{ width: '24px', height: '24px', marginRight: '16px' }}

            />
            <IonLabel>보안 설정</IonLabel>
          </IonItem>

          {/* 배지 테스트 섹션 */}
          <IonItem>
            <IonLabel position="stacked">배지 숫자 테스트</IonLabel>
            <IonInput
              type="number"
              value={badgeNumber}
              placeholder="숫자를 입력하세요"
              onIonInput={(e) => setBadgeNumber(e.detail.value!)}
              style={{ marginTop: '8px' }}
            />
          </IonItem>
          
          <IonItem>
            <IonButton 
              expand="block" 
              onClick={handleBadgeTest}
              disabled={!badgeNumber.trim()}
              style={{ width: '100%', height: '48px' }}
            >
              webviewBadge 테스트 실행
            </IonButton>
          </IonItem>

          {/* 토스트 테스트 섹션 */}
          <IonItem>
            <IonLabel position="stacked">토스트 메시지 테스트</IonLabel>
            <IonInput
              type="text"
              value={toastMessage}
              placeholder="토스트 메시지를 입력하세요"
              onIonInput={(e) => setToastMessage(e.detail.value!)}
              style={{ marginTop: '8px' }}
            />
          </IonItem>
          
          <IonItem>
            <IonButton 
              expand="block" 
              onClick={handleToastTest}
              disabled={!toastMessage.trim()}
              style={{ width: '100%', height: '48px' }}
              color="secondary"
            >
              webviewToast 테스트 실행
            </IonButton>
          </IonItem>

          {/* 햅틱 테스트 섹션 */}
          <IonItem>
            <IonLabel>
              <h3>햅틱 피드백 테스트</h3>
              <p>다양한 햅틱 피드백을 테스트해보세요</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', paddingBottom:'100px' }}>
              <IonButton 
                expand="block" 
                fill="outline"
                onClick={() => handleHapticTest('lightImpact')}
                color="success"
                style={{ height: '48px' }}
              >
                Light Impact
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="outline"
                onClick={() => handleHapticTest('mediumImpact')}
                color="warning"
                style={{ height: '48px' }}
              >
                Medium Impact
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="outline"
                onClick={() => handleHapticTest('heavyImpact')}
                color="danger"
                style={{ height: '48px' }}
              >
                Heavy Impact
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="outline"
                onClick={() => handleHapticTest('selectionClick')}
                color="medium"
                style={{ height: '48px' }}
              >
                Selection Click
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="outline"
                onClick={() => handleHapticTest('vibrate')}
                color="dark"
                style={{ height: '48px' }}
              >
                Vibrate
              </IonButton>
            </div>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
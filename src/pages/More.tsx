import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonIcon,
  IonLabel
} from '@ionic/react';
import {
  notificationsOutline,
  logOutOutline,
  settingsOutline,
  informationCircleOutline,
  shieldOutline,
  documentTextOutline
} from 'ionicons/icons';
import React from 'react';
import AppBar from '../components/AppBar';

const More: React.FC = () => {
  const handleLogout = () => {
    // 로그아웃 로직 구현
    console.log('로그아웃 클릭');
  };

  const handleMenuClick = (menuName: string) => {
    console.log(`${menuName} 클릭`);
  };

  return (
    <IonPage>
      <AppBar title={<span>더보기</span>} showSettingButton={true} showMenuButton={true}/>
      <IonContent>
        <IonList>
          <IonItem button onTouchStart={() => handleMenuClick('공지사항')}>
            <IonIcon icon={notificationsOutline} slot="start" />
            <IonLabel>공지사항</IonLabel>
          </IonItem>

          <IonItem button routerLink="/settings">
            <IonIcon icon={settingsOutline} slot="start" />
            <IonLabel>설정</IonLabel>
          </IonItem>

          <IonItem button onTouchStart={() => handleMenuClick('버전 정보')}>
            <IonIcon icon={informationCircleOutline} slot="start" />
            <IonLabel>버전 정보</IonLabel>
          </IonItem>

          <IonItem button onTouchStart={() => handleMenuClick('개인정보처리방침')}>
            <IonIcon icon={shieldOutline} slot="start" />
            <IonLabel>개인정보처리방침</IonLabel>
          </IonItem>

          <IonItem button onTouchStart={() => handleMenuClick('서비스 이용약관')}>
            <IonIcon icon={documentTextOutline} slot="start" />
            <IonLabel>서비스 이용약관</IonLabel>
          </IonItem>

          <IonItem button onTouchStart={handleLogout}>
            <IonIcon icon={logOutOutline} slot="start" />
            <IonLabel>로그아웃</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default More;

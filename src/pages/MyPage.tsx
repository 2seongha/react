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
  IonIcon,
  IonButton
} from '@ionic/react';
import { personOutline, settingsOutline, logOutOutline } from 'ionicons/icons';
import useAppStore from '../stores/appStore';
import LazyImage from '../components/LazyImage';
import { personIcon } from '../assets/images';

const MyPage: React.FC = () => {
  const { user } = useAppStore();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>내 정보</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <LazyImage 
            src={personIcon} 
            style={{ width: '80px', height: '80px', marginBottom: '16px', borderRadius: '50%' }}
            alt="프로필 이미지"
            placeholder={<div style={{ width: '80px', height: '80px', marginBottom: '16px', backgroundColor: '#f0f0f0', borderRadius: '50%' }} />}
          />
          <h2>{user.name || '사용자'}</h2>
          <p style={{ color: 'var(--grey-text-color)' }}>
            {user.loginId || 'user@example.com'}
          </p>
        </div>

        <IonList>
          <IonItem button>
            <IonIcon icon={personOutline} slot="start" />
            <IonLabel>프로필 관리</IonLabel>
          </IonItem>
          <IonItem button routerLink="/config">
            <IonIcon icon={settingsOutline} slot="start" />
            <IonLabel>설정</IonLabel>
          </IonItem>
          <IonItem button>
            <IonIcon icon={logOutOutline} slot="start" />
            <IonLabel>로그아웃</IonLabel>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MyPage;
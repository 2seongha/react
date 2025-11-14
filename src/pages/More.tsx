import {
  IonContent,
  IonPage,
  IonItem,
  IonCard,
  useIonRouter,
} from '@ionic/react';
import React from 'react';
import AppBar from '../components/AppBar';
import BottomTabBar from '../components/BottomNavigation';
import './More.css';

const More: React.FC = () => {
  const router = useIonRouter();

  return (
    <IonPage className="more">
      <AppBar title={<span>더보기</span>} showMenuButton={true} showSettingButton={true} />
      <IonContent scrollEvents={false} scrollY={false}>
        <IonCard className='more-card' style={{ marginTop: '12px' }}>
          <span className='more-card-title'>법적 정보 및 기타</span>
          <IonItem
            button
            mode='ios'
            className='more-card-button'
            onClick={() => {
              router.push('/privacyPolicy', 'forward', 'push');
            }}>개인정보 처리방침</IonItem>
          <IonItem
            button
            mode='ios'
            className='more-card-button'
            onClick={() => {
              router.push('/termsOfUse', 'forward', 'push');
            }}>서비스 이용약관</IonItem>
        </IonCard>
       
      </IonContent>
      <BottomTabBar />
    </IonPage>
  );
};

export default More;

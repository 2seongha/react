import {
  IonContent,
  IonPage,
  IonItem,
  IonCard,
  useIonRouter,
  IonIcon,
} from '@ionic/react';
import React from 'react';
import AppBar from '../components/AppBar';
import BottomTabBar from '../components/BottomNavigation';
import './More.css';
import { chevronForward, navigate } from 'ionicons/icons';

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
            mode='md'
            className='more-card-button'
            onClick={() => {
              router.push('/privacyPolicy', 'forward', 'push');
            }}>
            개인정보 처리방침
            <IonIcon src={chevronForward} slot='end' style={{ margin: 0 }} size='small'></IonIcon>
          </IonItem>
          <IonItem
            button
            mode='md'
            className='more-card-button'
            onClick={() => {
              router.push('/termsOfUse', 'forward', 'push');
            }}>
            서비스 이용약관
            <IonIcon src={chevronForward} slot='end' style={{ margin: 0 }} size='small'></IonIcon>
          </IonItem>
        </IonCard>

      </IonContent>
      <BottomTabBar />
    </IonPage>
  );
};

export default More;

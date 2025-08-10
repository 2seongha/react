import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import AppBar from '../components/AppBar';

const Detail: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <AppBar title={<span>상세</span>} showBackButton={true} />
      </IonHeader>
      <IonContent className="ion-padding">
        <p>상세 페이지입니다.</p>
      </IonContent>
    </IonPage>
  );
};

export default Detail;

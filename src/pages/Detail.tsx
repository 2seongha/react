import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import CommonAppBar from '../components/CustomHeader';

const Detail: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <CommonAppBar title={'상세'} showBackButton={true} />
      </IonHeader>
      <IonContent className="ion-padding">
        <p>상세 페이지입니다.</p>
      </IonContent>
    </IonPage>
  );
};

export default Detail;

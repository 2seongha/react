import { IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
import AppBar from '../components/AppBar';

const Menu: React.FC = () => {
  return (
    <IonPage>
      <AppBar title={<span>메뉴</span>} showBackButton={true} />
      <IonContent className="ion-padding">
        <p>메뉴 페이지입니다.</p>
      </IonContent>
    </IonPage>
  );
};

export default Menu;

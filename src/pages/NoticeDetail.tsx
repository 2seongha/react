import React from 'react';
import {
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton
} from '@ionic/react';
import { useParams } from 'react-router-dom';

const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/notice" />
          </IonButtons>
          <IonTitle>공지사항 상세</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" scrollEvents={false} scrollX={false} scrollY={false}>
        <div style={{ height: '100%', overflow: 'auto' }}>
        <p>공지사항 상세 페이지</p>
        <p>ID: {id}</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default NoticeDetail;
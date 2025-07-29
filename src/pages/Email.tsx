import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonFooter,
  IonItem,
  IonLabel,
} from '@ionic/react';
import React, { useState } from 'react';
import CommonAppBar from '../components/CustomHeader';

const Email: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = () => {
    console.log('입력한 이메일:', email);
    // 여기에 이메일 인증 처리 로직 추가
  };

  return (
    <IonPage>
      <IonHeader>
        <CommonAppBar title="이메일 인증" showBackButton={true} />
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="floating">이메일 주소</IonLabel>
          <IonInput
            type="email"
            value={email}
            onIonChange={(e) => setEmail(e.detail.value!)}
            placeholder="example@example.com"
          />
        </IonItem>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonButton expand="block" onClick={handleSubmit}>
            전송
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Email;

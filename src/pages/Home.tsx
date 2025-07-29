import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonAlert,
} from '@ionic/react';
import React, { useState } from 'react';
import CommonAppBar from '../components/CustomHeader';

const Home: React.FC = () => {
  const [showDialog, setShowDialog] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <IonPage>
      <IonHeader>
        <CommonAppBar title="홈" showBackButton={false} />
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem routerLink="/detail">
            <IonLabel>상세화면</IonLabel>
          </IonItem>
          <IonItem routerLink="/menu">
            <IonLabel>메뉴</IonLabel>
          </IonItem>
          <IonItem routerLink="/notice">
            <IonLabel>공지</IonLabel>
          </IonItem>
          <IonItem button onClick={() => setShowDialog(true)}>
            <IonLabel>다이얼로그 열기</IonLabel>
          </IonItem>
          <IonItem routerLink="/secondAuth/email" >
            <IonLabel>2차 비밀번호 초기화</IonLabel>
          </IonItem>
        </IonList>

        <IonAlert
          isOpen={showDialog}
          onDidDismiss={() => setShowDialog(false)}
          header="입력 다이얼로그"
          inputs={[
            {
              name: 'inputValue',
              type: 'text',
              placeholder: '값을 입력하세요',
            },
          ]}
          buttons={[
            {
              text: '취소',
              role: 'cancel',
              handler: () => {
                setShowDialog(false);
              },
            },
            {
              text: '확인',
              handler: (data) => {
                setInputValue(data.inputValue);
                setShowDialog(false);
              },
            },
          ]}
        />

        {/* 입력한 값 보여주기 (디버깅용) */}
        {inputValue && (
          <div style={{ padding: '16px', fontSize: '16px' }}>
            입력한 값: <strong>{inputValue}</strong>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;

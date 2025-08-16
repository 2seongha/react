import { IonContent, IonPage } from '@ionic/react';
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';

interface DetailParams {
  flowNo: string;
}

const Detail: React.FC = () => {
  const { flowNo } = useParams<DetailParams>();
  
  // approvals에서 flowNo에 맞는 approval만 구독 (shallow로 최적화)
  const approval = useAppStore(
    state => state.approvals?.find(approval => approval.flowNo === flowNo) || null,
    shallow
  );

  if (!approval) {
    return (
      <IonPage>
        <AppBar title={<span>상세</span>} showBackButton={true} />
        <IonContent fullscreen>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: 'var(--ion-color-medium)'
          }}>
            해당 결재 정보를 찾을 수 없습니다.
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppBar title={<span>{approval.apprTitle}</span>} showBackButton={true} />
      <IonContent fullscreen>
        <div style={{ padding: '20px' }}>
          <h2>{approval.apprTitle}</h2>
          <p><strong>결재번호:</strong> {approval.flowNo}</p>
          <p><strong>상신자:</strong> {approval.creatorName}</p>
          <p><strong>상신일:</strong> {approval.createDate}</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Detail;

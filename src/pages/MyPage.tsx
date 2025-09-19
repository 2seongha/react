import React from 'react';
import {
  IonContent,
  IonPage,
} from '@ionic/react';
import useAppStore from '../stores/appStore';
import AppBar from '../components/AppBar';

const MyPage: React.FC = () => {
  const user = useAppStore((state) => state.user);
  const corp = useAppStore((state) => state.corp);

  return (
    <IonPage>
      <AppBar
        title={<span></span>}
        showBackButton
      />
      <IonContent scrollEvents={false} scrollX={false} scrollY={false}>
        <div style={{ height: '100%', overflow: 'auto' }}>
        <div style={{ padding: '22px' }}>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>내 정보</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>이름</span>
            <span>{user?.NAME}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>아이디</span>
            <span>{user?.LOGIN_ID}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>회사코드</span>
            <span>{user?.BUKRS}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>이메일</span>
            <span>{user?.MAIL}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>조직코드</span>
            <span>{user?.ORGEH}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>부서명</span>
            <span>{user?.ORGTX}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>직급</span>
            <span>{user?.RANK || '-'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>직급명</span>
            <span>{user?.RANK_NAME || '-'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>직책</span>
            <span>{user?.POSITIONN || '-'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>직책명</span>
            <span>{user?.POSITIONN_NAME || '-'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>코스트센터</span>
            <span>{user?.KOSTL || '-'}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>코스트센터명</span>
            <span>{user?.KOSTL_NAME || '-'}</span>
          </div>
        </div>
        <div style={{height:'22px', backgroundColor:'var(--ion-background-color2)'}}></div>
        <div style={{ padding: '22px' }}>
          <span style={{ fontSize: '18px', fontWeight: '600' }}>그룹 정보</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>그룹코드</span>
            <span>{corp?.corpId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
            <span style={{ color: 'var(--ion-color-secondary)' }}>그룹명</span>
            <span>{corp?.corpNm}</span>
          </div>
        </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default MyPage;
import React from 'react';
import {
  IonCard,
  IonContent,
  IonPage,
} from '@ionic/react';
import useAppStore from '../stores/appStore';
import AppBar from '../components/AppBar';
import './MyPage.css'

const MyPage: React.FC = () => {
  const user = useAppStore((state) => state.user);
  const corp = useAppStore((state) => state.corp);

  return (
    <IonPage className='mypage'>
      <AppBar
        showBackButton
      />
      <IonContent>
        <IonCard className='mypage-card'>
          <span className='mypage-card-title'>{user?.NAME}님의 정보</span>
          {/* <div className='mypage-card-button'>
            <span >이름</span>
            <span>{user?.NAME}</span>
          </div> */}
          <div className='mypage-card-button'>
            <span >아이디</span>
            <span>{user?.LOGIN_ID}</span>
          </div>
          <div className='mypage-card-button'>
            <span >회사코드</span>
            <span>{user?.BUKRS}</span>
          </div>
          <div className='mypage-card-button'>
            <span >이메일</span>
            <span>{user?.MAIL}</span>
          </div>
          <div className='mypage-card-button'>
            <span >조직코드</span>
            <span>{user?.ORGEH}</span>
          </div>
          <div className='mypage-card-button'>
            <span >부서명</span>
            <span>{user?.ORGTX}</span>
          </div>
          <div className='mypage-card-button'>
            <span >직급</span>
            <span>{user?.RANK || '-'}</span>
          </div>
          <div className='mypage-card-button'>
            <span >직급명</span>
            <span>{user?.RANK_NAME || '-'}</span>
          </div>
        </IonCard>
        <IonCard className='mypage-card'>
          <span className='mypage-card-title'>그룹 정보</span>
          <div className='mypage-card-button'>
            <span >그룹코드</span>
            <span>{corp?.CORP_ID}</span>
          </div>
          <div className='mypage-card-button'>
            <span >그룹명</span>
            <span>{corp?.CORP_NM}</span>
          </div>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default MyPage;
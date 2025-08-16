import { IonContent, IonPage, IonHeader } from '@ionic/react';
import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';

interface DetailParams {
  flowNo: string;
}

const Detail: React.FC = () => {
  const { flowNo } = useParams<DetailParams>();
  const [scrollY, setScrollY] = useState(0);
  const contentRef = useRef<HTMLIonContentElement>(null);
  
  // approvals에서 flowNo에 맞는 approval만 구독 (shallow로 최적화)
  const approval = useAppStore(
    state => state.approvals?.find(approval => approval.flowNo === flowNo) || null,
    shallow
  );

  useEffect(() => {
    const content = contentRef.current;
    if (!content) {
      console.log('contentRef is null');
      return;
    }

    const handleScroll = (event: any) => {
      console.log('ionScroll event triggered:', event);
      content.getScrollElement().then((scrollElement) => {
        const currentScrollY = scrollElement.scrollTop;
        console.log('Scroll Y:', currentScrollY);
        setScrollY(currentScrollY);
      });
    };

    console.log('Adding ionScroll listener');
    content.addEventListener('ionScroll', handleScroll);
    
    return () => {
      console.log('Removing ionScroll listener');
      content.removeEventListener('ionScroll', handleScroll);
    };
  }, []);

  // SliverAppBar 스타일 계산
  const maxHeaderHeight = 200;
  const minHeaderHeight = 0; // FlexibleSpace 완전히 사라짐
  const appBarHeight = 56; // 고정 AppBar 높이
  const currentFlexibleHeight = Math.max(minHeaderHeight, maxHeaderHeight - scrollY);
  const totalHeaderHeight = appBarHeight + currentFlexibleHeight;
  const headerOpacity = Math.max(0, 1 - (scrollY / maxHeaderHeight));
  const isCollapsed = scrollY >= maxHeaderHeight;
  console.log(scrollY);
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
      {/* SliverAppBar 스타일 헤더 */}
      <IonHeader 
        style={{
          height: `${totalHeaderHeight}px`,
          transition: 'none', // 스크롤에 따라 즉시 반응
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 고정 AppBar */}
        <AppBar title={<span>{isCollapsed ? approval.apprTitle : ''}</span>} showBackButton={true} />
        
        {/* FlexibleSpace */}
        <div 
          style={{
            height: `${currentFlexibleHeight}px`,
            background: 'linear-gradient(135deg, var(--ion-color-primary), var(--ion-color-secondary))',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'center',
            color: 'white',
            opacity: headerOpacity,
            overflow: 'hidden',
            paddingBottom: '20px',
          }}
        >
          <h1 style={{ 
            margin: 0, 
            fontSize: '2rem',
            textAlign: 'center',
            padding: '0 20px',
            transform: `translateY(${Math.max(0, scrollY * 0.5)}px)`,
            opacity: Math.max(0, 1 - (scrollY / 100)),
          }}>
            {approval.apprTitle}
          </h1>
          <p style={{ 
            margin: '8px 0 0 0', 
            opacity: Math.max(0, 1 - (scrollY / 80)),
            transform: `translateY(${Math.max(0, scrollY * 0.3)}px)`,
          }}>
            {approval.creatorName} • {approval.createDate}
          </p>
        </div>
      </IonHeader>
      
      <IonContent 
        ref={contentRef}
        onIonScroll={(e) => {
          console.log('onIonScroll event:', e.detail.scrollTop);
          setScrollY(e.detail.scrollTop);
        }}
        scrollEvents={true}
      >

        {/* 메인 콘텐츠 */}
        <div style={{ 
          padding: '20px',
          backgroundColor: 'var(--ion-background-color)',
          minHeight: '200vh' // 스크롤 테스트용
        }}>
          <div style={{ 
            backgroundColor: 'var(--ion-item-background)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>결재 정보</h3>
            <p><strong>결재번호:</strong> {approval.flowNo}</p>
            <p><strong>상신자:</strong> {approval.creatorName}</p>
            <p><strong>상신일:</strong> {approval.createDate}</p>
            <p><strong>상태:</strong> 대기중</p>
          </div>

          <div style={{ 
            backgroundColor: 'var(--ion-item-background)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 16px 0' }}>상세 내용</h3>
            <p>결재 요청 상세 내용이 여기에 표시됩니다.</p>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>

          {/* 더 많은 콘텐츠 */}
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} style={{ 
              backgroundColor: 'var(--ion-item-background)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h4>섹션 {i + 1}</h4>
              <p>스크롤 테스트를 위한 추가 콘텐츠입니다. 헤더가 어떻게 변화하는지 확인해보세요.</p>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Detail;

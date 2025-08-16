import { IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, RefresherCustomEvent, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { AreaModel } from '../stores/types';
import { motion } from 'framer-motion';
import { Commet } from 'react-loading-indicators';
import './FlowList.css';
import { getFlowIcon, getPlatformMode } from '../utils';
import { refreshOutline } from 'ionicons/icons';
import LazyImage from '../components/LazyImage';

const FlowList: React.FC = () => {
  const setFlowList = useAppStore(state => state.setFlowList);
  const fetchFlowList = useAppStore(state => state.fetchFlowList);
  const flowList = useAppStore(state => state.flowList);
  useEffect(() => {
    return setFlowList(null);
  }, [])

  useIonViewWillEnter(() => {
    // setFlowList(null);
    fetchFlowList();
  });

  // 새로고침 핸들러 최적화
  const handleRefresh = useCallback(async (event: RefresherCustomEvent) => {
    setFlowList(null);
    await Promise.allSettled([fetchFlowList()]);
    event.detail.complete();
  }, [setFlowList, fetchFlowList]);

  // flowList의 전체 카운트 계산 (메모이제이션)
  const totalCount = useMemo(() => {
    return flowList ? flowList.reduce((sum, area) => sum + parseInt(area.cnt!), 0) : 0;
  }, [flowList]);

  // 렌더링할 리스트 아이템들 메모이제이션
  const renderedItems = useMemo(() => {
    if (!flowList) return null;
    
    return flowList.map((area, index) => (
      <FlowListItem 
        key={`flow-list-item-${area.flowCode}-${index}`} 
        area={area} 
        index={index} 
      />
    ));
  }, [flowList]);

  return (
    <IonPage className='flow-list'>
      <AppBar key='flow-list-app-bar' title={
        <span>미결함</span>
      } showBackButton={true} showCount={true} count={totalCount} />

      <IonContent fullscreen >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode={getPlatformMode()}>
          {getPlatformMode() === 'md' ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>
        {!flowList ? (
          <div className='loading-indicator-wrapper'>
            <Commet color="var(--ion-color-primary)" size="medium" text="" textColor="" />
          </div>
        ) : renderedItems}
      </IonContent>
    </IonPage>
  );
};

export default FlowList;

interface FlowListProps {
  area: AreaModel;
  index: number;
}

const FlowListItem: React.FC<FlowListProps> = React.memo(({ area, index }) => {
  const router = useIonRouter();
  
  // 아이콘 정보 메모이제이션
  const icon = useMemo(() => getFlowIcon(area.flowCode!), [area.flowCode]);
  
  // 클릭 핸들러 최적화
  const handleClick = useCallback(() => {
    router.push('/approval', 'forward', 'push');
  }, [router]);

  // 스타일 객체 메모이제이션
  const iconStyle = useMemo(() => ({ 
    backgroundColor: icon.backgroundColor 
  }), [icon.backgroundColor]);

  const containerStyle = useMemo(() => ({
    marginTop: '10px',
    overflow: 'hidden' as const,
    willChange: 'transform, opacity', // GPU 가속 힌트
    transform: 'translateZ(0)', // 하드웨어 가속 강제
  }), []);

  // 애니메이션 props 메모이제이션 (GPU 가속 최적화)
  const motionProps = useMemo(() => ({
    layout: true,
    initial: { 
      y: 20,
      opacity: 0.5, 
      scale: 0.9,
    },
    animate: { 
      y: 0,
      opacity: 1, 
      scale: 1,
    },
    transition: {
      duration: 0.3,
      delay: Math.min(index * 0.05, 0.3), // 최대 지연 시간 제한
      ease: [0.25, 0.46, 0.45, 0.94] as const, // easeOutQuart
      type: "spring" as const,
      stiffness: 300,
      damping: 30,
    },
  }), [index]);

  return (
    <motion.div
      {...motionProps}
      style={containerStyle}
    >
      <IonItem 
        button 
        className='flow-list-item' 
        onClick={handleClick} 
        mode='md'
      >
        <div className='flow-list-item-icon' style={iconStyle}>
          <LazyImage 
            src={icon.image} 
          />
        </div>
        <span>{area.oLtext}</span>
        <div className='animated-badge'>
          <span>{Number(area.cnt)}</span>
        </div>
      </IonItem>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수로 불필요한 리렌더링 방지
  return (
    prevProps.area.flowCode === nextProps.area.flowCode &&
    prevProps.area.oLtext === nextProps.area.oLtext &&
    prevProps.area.cnt === nextProps.area.cnt &&
    prevProps.index === nextProps.index
  );
});
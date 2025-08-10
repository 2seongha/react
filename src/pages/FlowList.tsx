import { IonContent, IonHeader, IonImg, IonItem, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, RefresherCustomEvent, useIonViewWillEnter } from '@ionic/react';
import React from 'react';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { AreaModel } from '../stores/types';
import { motion } from 'framer-motion';
import { Commet } from 'react-loading-indicators';
import './FlowList.css';
import { getFlowIcon } from '../utils';

const FlowList: React.FC = () => {
  const setFlowList = useAppStore(state => state.setFlowList);
  const fetchFlowList = useAppStore(state => state.fetchFlowList);
  const flowList = useAppStore(state => state.flowList);

  useIonViewWillEnter(() => {
    setFlowList(null);
    fetchFlowList();
  });

  async function handleRefresh(event: RefresherCustomEvent) {
    setFlowList(null);
    await Promise.allSettled(([fetchFlowList()]));
    event.detail.complete();
  }

  // flowList의 전체 카운트 계산 (메모이제이션)
  const totalCount = React.useMemo(() => {
    return flowList ? flowList.reduce((sum, area) => sum + parseInt(area.cnt!), 0) : 0;
  }, [flowList]);

  return (
    <IonPage className='flow-list'>
      <AppBar title={
        <span>미결함</span>
      } showBackButton={true} showCount={true} count={totalCount}></AppBar>

      <IonContent fullscreen >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        {!flowList ?
          <div className='loading-indicator-wrapper'>
            <Commet color="var(--ion-color-primary)" size="medium" text="" textColor="" />
          </div> : flowList?.map((area, index) => {
            return <FlowListItem area={area} index={index} key={index}></FlowListItem>;
          })}
      </IonContent>
    </IonPage>
  );
};

export default FlowList;

interface FlowListProps {
  area: AreaModel;
  index: number;
}

const FlowListItem: React.FC<FlowListProps> = ({ area, index }) => {
  const icon = getFlowIcon(area.flowCode!);

  return (
    <motion.div key={area.flowCode}
      layout
      initial={{
        opacity: 0,
        height: '30px',
        overflow: 'hidden'
      }}
      animate={{
        opacity: 1,
        height: '60px',
        overflow: 'visible'
      }}
      style={{
        background: 'var(--ion-background-color)',
        willChange: 'opacity, height',
        overflow: 'hidden', // 여기는 style로 고정
        WebkitBackfaceVisibility: 'hidden',
        WebkitTransform: 'translateZ(0)', // 강제 하드웨어 가속
      }}
      transition={{
        duration: 0.2,
        delay: index * 0.02,
        ease: "linear",
      }}
    >
      <IonItem button className='flow-list-item' onClick={() => { }} mode='md'>
        <div className='flow-list-item-icon' style={{ backgroundColor: icon.backgroundColor }}>
          <IonImg src={icon.image}></IonImg>
        </div>
        <span>{area?.oLtext}</span>
        <div className='animated-badge'>
          <span>{Number(area.cnt)}</span>
        </div>
      </IonItem>
    </motion.div>
  );
}
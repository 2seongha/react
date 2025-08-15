import { IonContent, IonHeader, IonImg, IonItem, IonLabel, IonList, IonPage, IonRefresher, IonRefresherContent, IonTitle, IonToolbar, RefresherCustomEvent, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import React, { useEffect } from 'react';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { AreaModel } from '../stores/types';
import { motion } from 'framer-motion';
import { Commet } from 'react-loading-indicators';
import './FlowList.css';
import { getFlowIcon, getPlatformMode } from '../utils';
import { refreshOutline } from 'ionicons/icons';

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
      <AppBar key='flow-list-app-bar' title={
        <span>미결함</span>
      } showBackButton={true} showCount={true} count={totalCount} />

      <IonContent fullscreen >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode={getPlatformMode()}>
          {getPlatformMode() === 'md' ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>
        {!flowList ?
          <div className='loading-indicator-wrapper'>
            <Commet color="var(--ion-color-primary)" size="medium" text="" textColor="" />
          </div> : flowList?.map((area, index) => {
            return <FlowListItem area={area} index={index} key={`flow-list-item-${index}`} />;
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
  const router = useIonRouter();
  const icon = getFlowIcon(area.flowCode!);

  return (
    <motion.div
      layout
      initial={{
        opacity: 0,
        scale: .9
      }}
      animate={{
        opacity: 1,
        scale: 1
      }}
      transition={{
        duration: 0.2,
        delay: index * 0.02,
        ease: "linear",
      }}
      style={{
        marginTop: '10px',
        overflow: 'hidden', // ← 고정
      }}
    >
      <IonItem button className='flow-list-item' onClick={() => { router.push('/approval', 'forward', 'push') }} mode='md'>
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
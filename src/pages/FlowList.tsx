import { IonContent, IonImg, IonItem, IonPage, IonRefresher, IonRefresherContent, RefresherCustomEvent, useIonRouter, useIonViewWillEnter, isPlatform } from '@ionic/react';
import { useParams } from 'react-router-dom';
import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Commet } from 'react-loading-indicators';
import { refreshOutline } from 'ionicons/icons';
import { useShallow } from 'zustand/shallow';
import useAppStore from '../stores/appStore';
import { AreaModel } from '../stores/types';
import { getFlowIcon } from '../utils';
import NoData from '../components/NoData';
import AppBar from '../components/AppBar';
import './FlowList.css';

const FlowList: React.FC = () => {
  const { AREA_CODE } = useParams<{ AREA_CODE: string }>();
  const setAreas = useAppStore(state => state.setAreas);
  const fetchAreas = useAppStore(state => state.fetchAreas);
  const flowList = useAppStore(useShallow(state => state.areas?.find(area => area.AREA_CODE === AREA_CODE) || null));

  // 캐싱된 타이틀 ref
  const cachedTitleRef = useRef<string>('');

  useIonViewWillEnter(() => {
    fetchAreas('');
  });

  // 새로고침 핸들러 최적화
  const handleRefresh = useCallback(async (event: RefresherCustomEvent) => {
    setAreas(null);
    if (AREA_CODE) {
      await Promise.allSettled([fetchAreas('')]);
    }
    event.detail.complete();
  }, [setAreas, fetchAreas, AREA_CODE]);

  // 애니메이션을 위한 count 상태
  const [totalCount, seTotalCount] = useState(0);

  // totalCount 변경 시 애니메이션으로 업데이트
  useEffect(() => {
    seTotalCount(0);
    setTimeout(() => {
      seTotalCount(flowList?.CNT ? Number(flowList.CNT) : 0);
    }, 200)
  }, [flowList?.CNT]);

  // title 메모이제이션
  const titleElement = useMemo(() => {
    // flowList가 로드되면 캐싱
    if (flowList?.O_LTEXT) {
      cachedTitleRef.current = flowList.O_LTEXT;
    }
    // flowList가 없으면 캐싱된 값 사용, 그것도 없으면 빈 문자열
    const title = flowList?.O_LTEXT || cachedTitleRef.current || '';
    return <span>{title}</span>;
  }, [flowList?.O_LTEXT]);

  // 렌더링할 리스트 아이템들 메모이제이션
  const renderedItems = useMemo(() => {
    if (!flowList) return null;

    return flowList.CHILDREN?.map((area, index) => (
      <FlowListItem
        key={`flow-list-item-${area.AREA_CODE}-${index}`}
        area={area}
        index={index}
      />
    ));
  }, [flowList]);

  return (
    <IonPage className='flow-list'>
      <AppBar
        key='flow-list-app-bar'
        title={titleElement}
        showBackButton={true}
        showCount={true}
        count={totalCount}
      />
      <IonContent scrollEvents={false} scrollX={false}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          {isPlatform('android') ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>

        {!flowList ?
          <div className='loading-indicator-wrapper'>
            <Commet color="var(--ion-color-primary)" size="medium" text="" textColor="" />
          </div>
          : (!flowList.CHILDREN || flowList.CHILDREN.length === 0) ?
            <NoData message="해당 항목에 대한 데이터가 없습니다." />
            :
            <div>
              {renderedItems}
            </div>
        }

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
  const icon = useMemo(() => getFlowIcon(area.FLOWCODE!), [area.FLOWCODE]);

  // 클릭 핸들러 최적화
  const handleClick = useCallback(() => {
    router.push(`/approval/${area.P_AREA_CODE}/${area.AREA_CODE}/${area.P_AREA_CODE_TXT}/${area.O_LTEXT}`, 'forward', 'push');
  }, [router]);

  // 스타일 객체 메모이제이션
  const iconStyle = useMemo(() => ({
    backgroundColor: icon.backgroundColor
  }), [icon.backgroundColor]);

  const containerStyle = useMemo(() => ({
    marginTop: '10px',
    overflow: 'hidden' as const,
  }), []);

  // 애니메이션 props 메모이제이션 (GPU 가속 최적화)
  const motionProps = useMemo(() => ({
    layout: true,
    initial: {
      y: 20,
      scale: 0.95,
    },
    animate: {
      y: 0,
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
    // <motion.div
    //   {...motionProps}
    //   style={containerStyle}
    // >
    <IonItem
      button
      className='flow-list-item'
      onClick={handleClick}
      mode='md'
    >
      <div className='flow-list-item-icon' style={iconStyle}>
        <IonImg
          src={icon.image}
          alt="flow icon"
        />
      </div>
      <span>{area.O_LTEXT}</span>
      <div className='animated-badge'>
        <span>{Number(area.CNT)}</span>
      </div>
    </IonItem>
    // </motion.div>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수로 불필요한 리렌더링 방지
  return (
    prevProps.area.FLOWCODE === nextProps.area.FLOWCODE &&
    prevProps.area.O_LTEXT === nextProps.area.O_LTEXT &&
    prevProps.area.CNT === nextProps.area.CNT &&
    prevProps.index === nextProps.index
  );
});
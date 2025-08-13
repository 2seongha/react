import { IonBackButton, IonContent, IonHeader, IonIcon, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, IonTitle, IonToolbar, RefresherCustomEvent, useIonRouter, useIonViewWillEnter, IonButton, IonDatetime, IonPopover, IonLabel, IonItem } from '@ionic/react';
import React, { useState, useMemo, useCallback } from 'react';
import { Virtuoso } from 'react-virtuoso';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { chevronForwardOutline, refreshOutline, calendarOutline, closeOutline, refresh } from 'ionicons/icons';
import { ApprovalModel } from '../stores/types';
import { motion } from 'framer-motion';
import { Commet } from 'react-loading-indicators';
import CustomItem from '../components/CustomItem';
import './Approval.css';

const Approval: React.FC = () => {
  const setApprovals = useAppStore(state => state.setApprovals);
  const fetchApprovals = useAppStore(state => state.fetchApprovals);
  const approvals = useAppStore(state => state.approvals);
  const router = useIonRouter();
  
  // 초기 로딩 상태 추적
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  // 스크롤 상태 추적
  const [isScrolling, setIsScrolling] = useState(false);

  // 기본 날짜 설정 (6개월 전 ~ 오늘) - useMemo로 최적화
  const { defaultStartDate, defaultEndDate } = useMemo(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    return {
      defaultStartDate: sixMonthsAgo.toISOString().split('T')[0], // YYYY-MM-DD 형식
      defaultEndDate: today.toISOString().split('T')[0]
    };
  }, []); // 빈 배열로 컴포넌트 마운트 시에만 실행

  // 날짜 선택 관련 상태
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  useIonViewWillEnter(() => {
    setApprovals(null);
    setIsInitialLoad(true);
    fetchApprovals();
  });

  async function handleRefresh(event: RefresherCustomEvent) {
    setApprovals(null);
    setIsInitialLoad(true);
    await Promise.allSettled(([fetchApprovals()]));
    event.detail.complete();
  }

  // 초기 로딩 완료 후 애니메이션 비활성화
  React.useEffect(() => {
    if (approvals && isInitialLoad) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false);
      }, 400);
      
      return () => clearTimeout(timer);
    }
  }, [approvals, isInitialLoad]);

  // flowList의 전체 카운트 계산 (메모이제이션)
  const totalCount = React.useMemo(() => {
    return approvals ? approvals.length : 0;
  }, [approvals]);

  // 날짜 포맷팅 함수 - useCallback으로 최적화
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '날짜 선택';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }, []);

  // 날짜 초기화 함수 (기본값으로 리셋) - useCallback으로 최적화
  const resetDates = useCallback(() => {
    setStartDate(defaultStartDate);
    setEndDate(defaultEndDate);
  }, [defaultStartDate, defaultEndDate]);

  // 날짜 선택 확인 함수 - useCallback으로 최적화
  const handleStartDateConfirm = useCallback((value: string) => {
    setStartDate(value);
    setIsStartDateOpen(false);
  }, []);

  const handleEndDateConfirm = useCallback((value: string) => {
    setEndDate(value);
    setIsEndDateOpen(false);
  }, []);

  // 네비게이션 핸들러 - useCallback으로 최적화
  const handleBackNavigation = useCallback(() => {
    router.push('/flowList', 'back', 'pop');
  }, [router]);

  // 스크롤 이벤트 핸들러
  const handleScrollStart = useCallback(() => {
    setIsScrolling(true);
  }, []);

  const handleScrollEnd = useCallback(() => {
    // 스크롤이 끝난 후 약간의 지연을 두어 DOM 업데이트 완료 대기
    setTimeout(() => {
      setIsScrolling(false);
    }, 100);
  }, []);

  // Virtuoso용 아이템 렌더러
  const VirtualizedApprovalItem = useCallback((index: number, approval: ApprovalModel) => {
    return (
      <ApprovalItem 
        approval={approval} 
        index={index} 
        key={`approval-item-${index}`}
        enableAnimation={isInitialLoad}
      />
    );
  }, [isInitialLoad]);

  return (
    <IonPage className='approval'>
      <AppBar
        title={
          <div className='app-bar-title-wrapper'>
            <span className='app-bar-sub-title' onClick={handleBackNavigation}>미결함</span>
            <IonIcon src={chevronForwardOutline} style={{ width: 16, color: 'var(--ion-color-secondary)' }} />
            <span>SAP 전표</span>
          </div>
        }
        bottom={
          <>
            <IonToolbar>
              <IonSearchbar />
            </IonToolbar>
            {/* 날짜 선택 섹션 */}
            <IonToolbar>
              {/* 시작일 버튼 */}
              <IonButton
                id="start-date-trigger"
                fill="outline"
                size="small"
                style={{ flex: 1 }}
                onClick={() => setIsStartDateOpen(true)}
              >
                <IonIcon icon={calendarOutline} style={{ marginRight: '6px' }} />
                {formatDate(startDate)}
              </IonButton>
              <span>~</span>
              {/* 종료일 버튼 */}
              <IonButton
                id="end-date-trigger"
                fill="outline"
                size="small"
                style={{ flex: 1 }}
                onClick={() => setIsEndDateOpen(true)}
              >
                <IonIcon icon={calendarOutline} style={{ marginRight: '6px' }} />
                {formatDate(endDate)}
              </IonButton>

              {/* 초기화 버튼 */}
              <IonButton
                size="small"
                onClick={resetDates}
                disabled={startDate === defaultStartDate && endDate === defaultEndDate}
              >
                <IonIcon icon={refresh} />
              </IonButton>
            </IonToolbar>

            {/* 시작일 선택 팝오버 */}
            <IonPopover
              trigger="start-date-trigger"
              isOpen={isStartDateOpen}
              onDidDismiss={() => setIsStartDateOpen(false)}
              showBackdrop={true}
            >
              <IonDatetime
                value={startDate}
                onIonChange={(e) => handleStartDateConfirm(e.detail.value as string)}
                presentation="date"
                locale="ko-KR"
                max={endDate || undefined}
              />
            </IonPopover>

            {/* 종료일 선택 팝오버 */}
            <IonPopover
              trigger="end-date-trigger"
              isOpen={isEndDateOpen}
              onDidDismiss={() => setIsEndDateOpen(false)}
              showBackdrop={true}
            >
              <IonDatetime
                value={endDate}
                onIonChange={(e) => handleEndDateConfirm(e.detail.value as string)}
                presentation="date"
                locale="ko-KR"
                min={startDate || undefined}
              />
            </IonPopover>
          </>
        }
        showBackButton={true}
        showCount={true}
        count={totalCount} />

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} disabled={isScrolling}>
          <IonRefresherContent pullingIcon={refreshOutline}></IonRefresherContent>
        </IonRefresher>
        {!approvals ? (
          <div className='loading-indicator-wrapper'>
            <Commet color="var(--ion-color-primary)" size="medium" text="" textColor="" />
          </div>
        ) : (
          <Virtuoso
            data={approvals}
            itemContent={VirtualizedApprovalItem}
            style={{ height: '100%' }}
            overscan={5}
            increaseViewportBy={200}
            defaultItemHeight={120}
            isScrolling={handleScrollStart}
            endReached={handleScrollEnd}
            components={{
              Item: ({ children, ...props }) => (
                <div {...props} style={{ ...props.style, marginBottom: 12, minHeight: 100 }}>
                  {children}
                </div>
              )
            }}
          />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Approval;

interface ApprovalProps {
  approval: ApprovalModel;
  index: number;
  enableAnimation?: boolean;
}

const ApprovalItem: React.FC<ApprovalProps> = React.memo(({ approval, index, enableAnimation = false }) => {
  const [isChecked, setIsChecked] = React.useState(false);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    setIsChecked(checked);
    console.log(`Approval ${approval.apprTitle} ${checked ? 'selected' : 'deselected'}`);
  }, [approval.apprTitle]);

  const motionProps = useMemo(() => ({
    layout: true,
    initial: {
      x: '-20%',
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
    },
    transition: {
      duration: 0.2,
      delay: index * 0.02,
      ease: "linear" as const,
    },
    style: {
      overflow: 'visible' as const,
      marginBottom: 12,
    }
  }), [index]);

  const titleElement = useMemo(() => <span>{approval.apprTitle}</span>, [approval.apprTitle]);
  const subElement = useMemo(() => <div style={{ height: '40px' }}> hello</div>, []);

  const itemContent = (
    <CustomItem
      selectable={true}
      checked={isChecked}
      title={titleElement}
      onCheckboxChange={handleCheckboxChange}
      sub={subElement}
    />
  );

  // 애니메이션 활성화 상태에 따라 조건부 렌더링
  return enableAnimation ? (
    <motion.div {...motionProps}>
      {itemContent}
    </motion.div>
  ) : (
    <div style={{ marginBottom: 12 }}>
      {itemContent}
    </div>
  );
});
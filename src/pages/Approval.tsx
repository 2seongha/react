import { IonBackButton, IonContent, IonHeader, IonIcon, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, IonTitle, IonToolbar, RefresherCustomEvent, useIonRouter, useIonViewWillEnter, IonButton, IonDatetime, IonPopover, IonLabel, IonItem } from '@ionic/react';
import React, { useState, useMemo, useCallback } from 'react';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { chevronForwardOutline, refreshOutline, calendarOutline, closeOutline, refresh } from 'ionicons/icons';
import { ApprovalModel } from '../stores/types';
import { motion } from 'framer-motion';
import { Commet } from 'react-loading-indicators';
import CustomItem from '../components/CustomItem';
import './Approval.css';
import { Virtuoso } from 'react-virtuoso';

const Approval: React.FC = () => {
  const setApprovals = useAppStore(state => state.setApprovals);
  const fetchApprovals = useAppStore(state => state.fetchApprovals);
  const approvals = useAppStore(state => state.approvals);
  const router = useIonRouter();


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
    fetchApprovals();
  });

  async function handleRefresh(event: RefresherCustomEvent) {
    setApprovals(null);
    await Promise.allSettled(([fetchApprovals()]));
    event.detail.complete();
  }

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

  // IonContent 스크롤 엘리먼트 참조
  const scrollElementRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    scrollElementRef.current = document.querySelector('.ion-content-scroll-host') as HTMLElement;
  }, []);


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

      <IonContent fullscreen scrollY={false}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon={refreshOutline}></IonRefresherContent>
        </IonRefresher>
        {!approvals ? (
          <div className='loading-indicator-wrapper'>
            <Commet color="var(--ion-color-primary)" size="medium" text="" textColor="" />
          </div>
        ) : (
          <Virtuoso
            className="ion-content-scroll-host"
            data={approvals}
            itemContent={(index, approval) => (
              <ApprovalItem
                approval={approval}
                index={index}
                key={`approval-item-${index}`} // key는 이 위치에 없어도 괜찮음
              />
            )}
          >
          </Virtuoso>


          // <Virtuoso
          //   className="ion-content-scroll-host"
          //   data={approvals}
          //   // style={{ height: '100%' }}
          //   itemContent={(index, approval) => (
          //     <ApprovalItem
          //       approval={approval}
          //       index={index}
          //       key={`approval-item-${index}`}
          //     />
          //   )}
          //   // defaultItemHeight={120}
          //   // overscan={5}
          //   // increaseViewportBy={200}
          // />
        )}
      </IonContent>
    </IonPage>
  );
};

export default Approval;

interface ApprovalProps {
  approval: ApprovalModel;
  index: number;
}

const ApprovalItem: React.FC<ApprovalProps> = React.memo(({ approval, index }) => {
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
      duration: 0.4,
      delay: index * 0.04,
      ease: "linear" as const,
    },
    style: {
      overflow: 'visible' as const,
      marginBottom: 12,
    }
  }), [index]);

  const titleElement = useMemo(() => <span>{approval.apprTitle}</span>, [approval.apprTitle]);
  const subElement = useMemo(() => <div style={{ height: '40px' }}> hello</div>, []);

  return (
    <motion.div {...motionProps}>
      <CustomItem
        selectable={true}
        checked={isChecked}
        title={titleElement}
        onClick={() => { }}
        onCheckboxChange={handleCheckboxChange}
        sub={subElement}
      />
    </motion.div>
  );
});
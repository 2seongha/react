import { IonBackButton, IonContent, IonHeader, IonIcon, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, IonTitle, IonToolbar, RefresherCustomEvent, useIonRouter, useIonViewWillEnter, IonButton, IonDatetime, IonPopover, IonLabel, IonItem, IonCheckbox, IonFab, IonFabButton, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/react';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { chevronForwardOutline, refreshOutline, calendarOutline, closeOutline, refresh, arrowUp } from 'ionicons/icons';
import { ApprovalModel } from '../stores/types';
import { motion } from 'framer-motion';
import { Commet } from 'react-loading-indicators';
import CustomItem from '../components/CustomItem';
import './Approval.css';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { getPlatformMode } from '../utils';

const Approval: React.FC = () => {
  const setApprovals = useAppStore(state => state.setApprovals);
  const fetchApprovals = useAppStore(state => state.fetchApprovals);
  const approvals = useAppStore(state => state.approvals);
  const router = useIonRouter();
  const [isTop, setIsTop] = useState(true);
  const [isInitial, setIsInitial] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);


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
    setIsInitial(true);
    setSelectedItems(new Set());
    fetchApprovals();
  });

  async function handleRefresh(event: RefresherCustomEvent) {
    setApprovals(null);
    setIsInitial(true);
    setSelectedItems(new Set());
    await Promise.allSettled(([fetchApprovals()]));
    event.detail.complete();
  }

  //* 스크롤 관련
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const scrollToTop = () => {
    virtuosoRef.current?.scrollToIndex({
      index: 0,
      behavior: 'smooth', // or 'auto'
    });
  };
  // 스크롤 중일 때만 버튼 보이기
  const handleScroll = useCallback((scrolling: boolean) => {
    if (scrolling) {
      setIsScrolling(true);

      // 스크롤 멈춘 후 1000ms 뒤에 버튼 숨김
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 2000);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // flowList의 전체 카운트 계산 (메모이제이션)
  const totalCount = React.useMemo(() => {
    return approvals ? approvals.length : 0;
  }, [approvals]);

  useEffect(() => {
    if (approvals != null) {
      setTimeout(() => {
        setIsInitial(false);
      }, (approvals.length - 1) * 20 + 200);
    }
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

  // 아이템 선택 상태 관리 - useCallback으로 최적화
  const handleItemSelection = useCallback((flowNo: string, isSelected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(flowNo);
      } else {
        newSet.delete(flowNo);
      }
      return newSet;
    });
  }, []);

  // 전체 선택 상태 계산
  const isAllSelected = useMemo(() => {
    if (!approvals || approvals.length === 0) return false;
    return selectedItems.size === approvals.length;
  }, [selectedItems.size, approvals?.length]);

  // 전체 선택/해제 핸들러
  const handleSelectAll = useCallback(() => {
    if (!approvals) return;

    if (isAllSelected) {
      // 전체 해제
      setSelectedItems(new Set());
    } else {
      // 전체 선택
      const allItemIds = approvals.map((approval) => approval.flowNo);
      setSelectedItems(new Set(allItemIds));
    }
  }, [approvals, isAllSelected]);


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
            <IonToolbar>
              <IonItem button onClick={handleSelectAll} mode='md' className='select-all-button'>
                <IonCheckbox
                  mode='md'
                  checked={isAllSelected}
                />
                <span>전체 선택 ({selectedItems.size}/{approvals?.length ?? 0})</span>
              </IonItem>
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

      <IonContent fullscreen scrollY={false} >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode={getPlatformMode()} disabled={!isTop}>
          {getPlatformMode() === 'md' ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>

        {!approvals ? (
          <div className='loading-indicator-wrapper'>
            <Commet color="var(--ion-color-primary)" />
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            className="ion-content-scroll-host"
            atTopStateChange={(isTop) => {
              setIsTop(isTop);
              if (isTop) {
                setIsScrolling(false);
                if (scrollTimeoutRef.current) {
                  clearTimeout(scrollTimeoutRef.current);
                }
              }
            }}
            isScrolling={handleScroll}
            data={approvals}
            overscan={5}
            itemContent={(index, approval) => (
              <ApprovalItem
                approval={approval}
                index={index}
                animate={isInitial}
                isSelected={selectedItems.has(approval.flowNo)}
                onSelectionChange={handleItemSelection}
              />
            )}
          />
        )}
        <IonFab
          vertical="bottom"
          horizontal="end"
          slot="fixed"
          style={{
            opacity: (isScrolling && !isTop) ? 1 : 0,
            transform: (isScrolling && !isTop) ? 'scale(1)' : 'scale(0.8)',
            transition: 'all 0.3s ease-in-out',
            pointerEvents: (isScrolling && !isTop) ? 'auto' : 'none'
          }}
        >
          <IonButton onClick={scrollToTop} className='scroll-top-button'>
            <span>상단으로 이동</span>
          </IonButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Approval;

interface ApprovalProps {
  approval: ApprovalModel;
  index: number;
  animate: boolean;
  isSelected: boolean;
  onSelectionChange: (id: string, isSelected: boolean) => void;
}

const ApprovalItem: React.FC<ApprovalProps> = React.memo(({ approval, index, animate, isSelected, onSelectionChange }) => {

  const handleCheckboxChange = useCallback((checked: boolean) => {
    onSelectionChange(approval.flowNo, checked);
  }, [approval.flowNo, onSelectionChange]);


  const motionProps = useMemo(() => ({
    layout: true,
    initial: {
      x: '-100%',
    },
    animate: {
      x: 0,
    },
    transition: {
      duration: 0.2,
      delay: index * 0.02,
      ease: "linear" as const,
    },
    style: {
      overflow: 'visible' as const,
    }
  }), [index]);

  const titleElement = useMemo(() => <span>{approval.apprTitle}</span>, [approval.apprTitle]);
  const subElement = useMemo(() => <div style={{ height: '40px' }}> hello</div>, []);

  const itemStyle = {
    minHeight: '52px',
    height: 'auto'
  };

  return (
    <div style={itemStyle}>
      {animate ? (
        <motion.div {...motionProps}>
          <CustomItem
            selectable={true}
            checked={isSelected}
            title={titleElement}
            onClick={() => { }}
            onCheckboxChange={handleCheckboxChange}
            sub={subElement}
          />
        </motion.div>
      ) : (
        <CustomItem
          selectable={true}
          checked={isSelected}
          title={titleElement}
          onClick={() => { }}
          onCheckboxChange={handleCheckboxChange}
          sub={subElement}
        />
      )}
    </div>
  );
});
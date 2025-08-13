import { IonBackButton, IonContent, IonHeader, IonIcon, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, IonTitle, IonToolbar, RefresherCustomEvent, useIonRouter, useIonViewWillEnter, IonButton, IonDatetime, IonPopover, IonLabel, IonItem, IonCheckbox, IonFab, IonFabButton, IonItemSliding, IonItemOptions, IonItemOption } from '@ionic/react';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { chevronForwardOutline, refreshOutline, calendarOutline, closeOutline, refresh, arrowUp } from 'ionicons/icons';
import { ApprovalModel } from '../stores/types';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState<string>('');
  const scrollCallbackRef = useRef<(() => void) | null>(null);


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
    setSelectedItems(new Set());
    setSearchText('');
    fetchApprovals();
  });

  async function handleRefresh(event: RefresherCustomEvent) {
    setApprovals(null);
    setSelectedItems(new Set());
    setSearchText('');
    await Promise.allSettled(([fetchApprovals()]));
    event.detail.complete();
  }

  //* 스크롤 관련
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const scrollToTop = () => {
    virtuosoRef.current?.scrollToIndex({ index: 0, behavior: 'smooth' });
  };

  // 전체 카운트 계산 (메모이제이션)
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

  // 검색어로 필터링된 결과
  const filteredApprovals = useMemo(() => {
    if (!approvals) return null;
    if (!searchText.trim()) return approvals;

    return approvals.filter(approval =>
      approval.apprTitle.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [approvals, searchText]);

  // 필터된 카운트 계산
  const filteredCount = React.useMemo(() => {
    return filteredApprovals ? filteredApprovals.length : 0;
  }, [filteredApprovals]);

  // 전체 선택 상태 계산 (필터된 결과 기준)
  const isAllSelected = useMemo(() => {
    if (!filteredApprovals || filteredApprovals.length === 0) return false;
    const filteredFlowNos = filteredApprovals.map(approval => approval.flowNo);
    return filteredFlowNos.every(flowNo => selectedItems.has(flowNo));
  }, [selectedItems, filteredApprovals]);

  // 검색 핸들러
  const handleSearch = useCallback((e: CustomEvent) => {
    const searchValue = e.detail.value;
    setSearchText(searchValue);

    // 검색어가 있을 때만 필터링에서 제외된 선택 항목들 제거
    if (searchValue.trim() && approvals) {
      const filteredFlowNos = approvals
        .filter(approval =>
          approval.apprTitle.toLowerCase().includes(searchValue.toLowerCase())
        )
        .map(approval => approval.flowNo);

      setSelectedItems(prev => {
        const newSet = new Set<string>();
        for (const flowNo of prev) {
          // 현재 필터 결과에 포함된 항목만 선택 상태 유지
          if (filteredFlowNos.includes(flowNo)) {
            newSet.add(flowNo);
          }
        }
        return newSet;
      });
    }
    // 검색어가 비어있으면 선택 상태는 그대로 유지 (모든 항목이 다시 보이므로)
  }, [approvals]);

  // 전체 선택/해제 핸들러
  const handleSelectAll = useCallback(() => {
    if (!filteredApprovals) return;

    if (isAllSelected) {
      // 전체 해제
      setSelectedItems(new Set());
    } else {
      // 전체 선택 (필터된 결과만)
      const allItemIds = filteredApprovals.map((approval) => approval.flowNo);
      setSelectedItems(new Set(allItemIds));
    }
  }, [filteredApprovals, isAllSelected]);

  const renderItem = useCallback((index: number, approval: ApprovalModel) => {
    const isSelected = selectedItems.has(approval.flowNo);
    return (
      <div className={`approval-item-wrapper ${isSelected ? 'selected' : ''}`}>
        <ApprovalItem
          key={approval.flowNo}
          approval={approval}
          index={index}
          isSelected={isSelected}
          onSelectionChange={handleItemSelection}
        />
      </div>
    );
  }, [selectedItems, handleItemSelection]);



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
              <IonSearchbar
                value={searchText}
                onIonInput={handleSearch}
                placeholder="제목 / 상신자"
                showClearButton="focus"
                debounce={50}
              />
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
                <span>전체 선택 ({selectedItems.size}/{filteredCount})</span>
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

      <IonContent
        fullscreen
        scrollY={false}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode={getPlatformMode()} disabled={!isTop}>
          {getPlatformMode() === 'md' ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>

        {!approvals ? (
          <div className='loading-indicator-wrapper'>
            <Commet color="var(--ion-color-primary)" />
          </div>
        ) : filteredApprovals && filteredApprovals.length > 0 ? (
          <Virtuoso
            className="ion-content-scroll-host"
            ref={virtuosoRef}
            data={filteredApprovals}
            overscan={20}
            initialItemCount={10}
            initialTopMostItemIndex={0}
            increaseViewportBy={{ top: 500, bottom: 200 }}
            atTopStateChange={(atTop) => setIsTop(atTop)}
            rangeChanged={() => {
              if (scrollCallbackRef.current) {
                scrollCallbackRef.current();
              }
            }}
            // components={{
            //   List: React.forwardRef<HTMLDivElement, any>((props, ref) => (
            //     <div {...props} ref={ref} style={{ ...(props.style || {}), paddingBottom: '12px' }} />
            //   ))
            // }}
            itemContent={renderItem}
          />
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '200px',
            color: 'var(--ion-color-medium)'
          }}>
            {searchText ? '검색 결과가 없습니다.' : '데이터가 없습니다.'}
          </div>
        )}
        <ScrollToTopFab
          isTop={isTop}
          onScrollToTop={scrollToTop}
          scrollCallbackRef={scrollCallbackRef}
        />
      </IonContent>
    </IonPage >
  );
};

export default Approval;

// Swipeable Item Component
interface SwipeAction {
  label: string;
  color: string;
  onClick: () => void;
}

interface SwipeableItemProps {
  children: React.ReactNode;
  actions: SwipeAction[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const SwipeableItem: React.FC<SwipeableItemProps> = ({ children, actions, isOpen, setIsOpen }) => {
  const [dragX, setDragX] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);

  const actionWidth = 80;
  const totalActionsWidth = actions.length * actionWidth;

  const handleDragEnd = useCallback((_: any, info: any) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;

    console.log('Drag ended - offset:', offset, 'velocity:', velocity, 'totalWidth:', totalActionsWidth);

    // 거리 기준으로 30% 이상 스와이프하면 열기 (더 민감하게)
    const distanceThreshold = totalActionsWidth * 0.01;
    // 빠른 속도 기준
    const velocityThreshold = -150;

    // 왼쪽으로 스와이프한 경우 (음수 offset)
    if (offset < 0) {
      // 거리나 속도 중 하나라도 임계값을 넘으면 열기
      if (Math.abs(offset) > distanceThreshold || velocity < velocityThreshold) {
        console.log('Opening - distance triggered:', Math.abs(offset), '>', distanceThreshold, 'or velocity triggered:', velocity, '<', velocityThreshold);
        setDragX(-totalActionsWidth);
        setIsOpen(true);
      } else {
        console.log('Closing - thresholds not met');
        setDragX(0);
        setIsOpen(false);
      }
    } else {
      // 오른쪽으로 스와이프하거나 이동하지 않은 경우 닫기
      console.log('Closing - positive offset or no movement');
      setDragX(0);
      setIsOpen(false);
    }
  }, [totalActionsWidth, setIsOpen]);

  useEffect(() => {
    if (isOpen) {
      setDragX(-totalActionsWidth);
    } else {
      setDragX(0);
    }
  }, [isOpen, totalActionsWidth]);

  return (
    <div
      ref={constraintsRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: '12px'
      }}
    >
      {/* Action Buttons */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: totalActionsWidth,
          display: 'flex',
          zIndex: 1
        }}
      >
        {actions.map((action, index) => (
          <div
            key={index}
            onClick={action.onClick}
            style={{
              width: actionWidth,
              backgroundColor: action.color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            {action.label}
          </div>
        ))}
      </div>

      {/* Swipeable Content */}
      <motion.div
        drag="x"
        dragConstraints={{
          left: -totalActionsWidth,
          right: 0
        }}
        animate={{
          x: dragX,
          transition: {
            type: "spring",
            damping: 30,
            stiffness: 400,
            mass: 0.8
          }
        }}
        onDragEnd={handleDragEnd}
        dragElastic={0.05}
        dragMomentum={false}
        dragDirectionLock={true}
        dragTransition={{
          bounceStiffness: 600,
          bounceDamping: 20
        }}
        style={{
          position: 'relative',
          zIndex: 2,
          backgroundColor: 'var(--ion-background-color)',
          cursor: 'grab'
        }}
        whileDrag={{
          cursor: 'grabbing'
        }}
      >
        {children}
      </motion.div>
    </div>
  );
};

// 독립적인 ScrollToTop FAB 컴포넌트
interface ScrollToTopFabProps {
  isTop: boolean;
  onScrollToTop: () => void;
  scrollCallbackRef: React.MutableRefObject<(() => void) | null>;
}

const ScrollToTopFab: React.FC<ScrollToTopFabProps> = React.memo(({ isTop, onScrollToTop, scrollCallbackRef }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Virtuoso의 rangeChanged 이벤트를 통해 스크롤 감지
    const handleScroll = () => {
      if (!isTop) {
        if (!isScrolling) {  // 이미 스크롤 중이면 중복 처리 방지
          setIsScrolling(true);
        }

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 2000);
      }
    };

    // callback 등록
    scrollCallbackRef.current = handleScroll;

    return () => {
      scrollCallbackRef.current = null;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isTop, isScrolling, scrollCallbackRef]);

  return (
    <IonFab
      vertical="bottom"
      horizontal="end"
      slot="fixed"
      style={{
        marginBottom: '12px',
        opacity: (isScrolling && !isTop) ? 1 : 0,
        transform: (isScrolling && !isTop) ? 'scale(1)' : 'scale(0.8)',
        transition: 'all 0.3s ease-in-out',
        pointerEvents: (isScrolling && !isTop) ? 'auto' : 'none'
      }}
    >
      <IonButton onClick={onScrollToTop} className='scroll-top-button'>
        <span>상단으로 이동</span>
      </IonButton>
    </IonFab>
  );
});

interface ApprovalProps {
  approval: ApprovalModel;
  index: number;
  isSelected: boolean;
  onSelectionChange: (id: string, isSelected: boolean) => void;
}

// Optimized ApprovalItem with swipe actions
const ApprovalItem: React.FC<ApprovalProps> = ({ approval, index, isSelected, onSelectionChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    onSelectionChange(approval.flowNo, checked);
  }, [approval.flowNo, onSelectionChange]);

  const handleApprove = useCallback(() => {
    console.log('승인:', approval.flowNo);
    setIsOpen(false);
  }, [approval.flowNo]);

  const handleReject = useCallback(() => {
    console.log('반려:', approval.flowNo);
    setIsOpen(false);
  }, [approval.flowNo]);

  const titleElement = useMemo(() => <span>{approval.apprTitle}</span>, [approval.apprTitle]);
  const subElement = useMemo(() => <div style={{ height: '40px' }}> hello</div>, []);

  return (
    <SwipeableItem
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      actions={[
        { label: '승인', color: '#4CAF50', onClick: handleApprove },
        { label: '반려', color: '#F44336', onClick: handleReject }
      ]}
    >
      <CustomItem
        selectable={true}
        checked={isSelected}
        title={titleElement}
        onClick={() => { }}
        onCheckboxChange={handleCheckboxChange}
        sub={subElement}
      />
    </SwipeableItem>
  );
};


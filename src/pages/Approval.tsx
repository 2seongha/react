import { IonBackButton, IonContent, IonHeader, IonIcon, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, IonTitle, IonToolbar, RefresherCustomEvent, useIonRouter, useIonViewWillEnter, IonButton, IonDatetime, IonPopover, IonLabel, IonItem, IonCheckbox, IonFab, IonFabButton, IonItemSliding, IonItemOptions, IonItemOption, IonButtons } from '@ionic/react';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { chevronForwardOutline, refreshOutline, calendarOutline, closeOutline, refresh, arrowUp, calendarClearOutline, calendar, calendarClear, close, checkmark, person } from 'ionicons/icons';
import { ApprovalModel } from '../stores/types';
import { motion, AnimatePresence, color } from 'framer-motion';
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

  const totalCount = approvals?.length ?? 0;

  //* 날짜 관련
  const { defaultStartDate, defaultEndDate } = useMemo(() => {
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 6);

    return {
      defaultStartDate: sixMonthsAgo.toISOString().split('T')[0], // YYYY-MM-DD 형식
      defaultEndDate: today.toISOString().split('T')[0]
    };
  }, []); // 빈 배열로 컴포넌트 마운트 시에만 실행

  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

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

  //* 스크롤 관련
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const scrollToTop = () => {
    virtuosoRef.current?.scrollToIndex({ index: 0, behavior: 'smooth' });
  };

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
      approval.apprTitle.toLowerCase().includes(searchText.toLowerCase()) ||
      approval.creatorName.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [approvals, searchText]);

  // 필터링된 결과가 변경될 때 선택된 아이템 중 필터에서 제외된 것들 제거
  useEffect(() => {
    if (filteredApprovals && selectedItems.size > 0) {
      const filteredFlowNos = filteredApprovals.map(approval => approval.flowNo);
      const newSelectedItems = new Set<string>();

      selectedItems.forEach(flowNo => {
        if (filteredFlowNos.includes(flowNo)) {
          newSelectedItems.add(flowNo);
        }
      });

      // 선택된 아이템이 변경되었을 때만 업데이트
      if (newSelectedItems.size !== selectedItems.size) {
        setSelectedItems(newSelectedItems);
      }
    }
  }, [filteredApprovals, selectedItems]);

  // filteredFlowNos 메모이제이션
  const filteredFlowNos = useMemo(() =>
    filteredApprovals?.map(approval => approval.flowNo) ?? [],
    [filteredApprovals]
  );

  // 전체 선택 상태 계산
  const isAllSelected = useMemo(() => {
    if (filteredFlowNos.length === 0) return false;
    return filteredFlowNos.every(flowNo => selectedItems.has(flowNo));
  }, [selectedItems, filteredFlowNos]);

  // 검색 핸들러
  const handleSearch = useCallback((e: CustomEvent) => {
    const searchValue = e.detail.value;
    setSearchText(searchValue);
  }, []);

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
    if (!approval || !approval.flowNo) {
      return <div className="approval-item-wrapper">Error: Invalid item</div>;
    }

    const isSelected = selectedItems.has(approval.flowNo);
    return (
      <div className={`approval-item-wrapper ${isSelected ? 'selected' : ''} ${index === 0 ? 'first-item' : ''}`}>
        <ApprovalItem
          key={approval.flowNo}
          approval={approval}
          index={index}
          isSelected={isSelected}
          onSelectionChange={handleItemSelection}
          searchText={searchText}
        />
      </div>
    );
  }, [selectedItems, handleItemSelection, searchText]);

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
            <IonToolbar >
              <IonSearchbar
                mode='ios'
                class='search-bar'
                value={searchText}
                onIonInput={handleSearch}
                placeholder="제목 / 상신자"
                showClearButton="focus"
                debounce={50}
                style={{ textAlign: 'start' }}
              />
            </IonToolbar>
            {/* 날짜 선택 섹션 */}
            <IonToolbar >
              <div className='date-toolbar-wrapper'>
                <IonItem
                  button
                  mode='md'
                  className='date-toolbar-button-wrapper'
                  id="start-date-trigger"
                  style={{ flex: 1 }}
                  onClick={() => setIsStartDateOpen(true)}
                >
                  <div className='date-toolbar-button'>
                    <IonIcon icon={calendarClear} />
                    <span>{formatDate(startDate)}</span>
                  </div>
                </IonItem>
                <span>~</span>
                <IonItem
                  button
                  mode='md'
                  className='date-toolbar-button-wrapper'
                  id="end-date-trigger"
                  style={{ flex: 1 }}
                  onClick={() => setIsEndDateOpen(true)}
                >
                  <div className='date-toolbar-button'>
                    <IonIcon icon={calendarClear} />
                    <span>{formatDate(endDate)}</span>
                  </div>
                </IonItem>

                <IonItem
                  button
                  style={{ width: '36px' }}
                  mode='md'
                  className='date-toolbar-button-wrapper'
                  onClick={resetDates}
                  disabled={startDate === defaultStartDate && endDate === defaultEndDate}
                >
                  <div className='date-toolbar-button'>
                    <IonIcon icon={refresh} style={{ width: '18px', color: 'var(--ion-color-secondary)' }} />
                  </div>
                </IonItem>
              </div>
            </IonToolbar>
            <IonToolbar>
              <div className='buttons-wrapper'>
                <IonItem button onTouchStart={handleSelectAll} mode='md' className='select-all-button'>
                  <IonCheckbox
                    mode='md'
                    checked={isAllSelected}
                    style={{ pointerEvents: 'none' }}
                  />
                  <span>전체 선택 <span style={{ color: 'var(--ion-color-primary)' }}>({selectedItems.size})</span></span>
                </IonItem>
                <div className='approve-buttons'>
                  <IonButton mode='md' color='light' disabled={selectedItems.size === 0}>
                    <IonIcon src={close} />
                    <span>반려하기</span>
                  </IonButton>
                  <IonButton mode='md' color='primary' disabled={selectedItems.size === 0}>
                    <IonIcon src={checkmark} />
                    <span>승인하기</span>
                  </IonButton>
                </div>
              </div>
            </IonToolbar>

            {/* 시작일 선택 팝오버 */}
            <IonPopover
              side="bottom" alignment="center"
              trigger="start-date-trigger"
              isOpen={isStartDateOpen}
              onDidDismiss={() => setIsStartDateOpen(false)}
              showBackdrop={true}
            >
              <IonDatetime
                class='date-picker-pop-up'
                value={startDate}
                onIonChange={(e) => {
                  if (typeof e.detail.value === 'string') {
                    setStartDate(e.detail.value);
                  }
                }}
                onClick={(e) => {
                  const path = (e.nativeEvent as any).composedPath?.() as EventTarget[];
                  const isDayButtonClicked = path?.some((el) =>
                    el instanceof HTMLElement &&
                    el.classList.contains('calendar-day-wrapper')
                  );

                  if (isDayButtonClicked) {
                    setIsStartDateOpen(false);
                  }
                }}
                presentation="date"
                locale="ko-KR"
                max={endDate || defaultEndDate}
              />
            </IonPopover>

            {/* 종료일 선택 팝오버 */}
            <IonPopover
              side="bottom" alignment="center"
              trigger="end-date-trigger"
              isOpen={isEndDateOpen}
              onDidDismiss={() => setIsEndDateOpen(false)}
              showBackdrop={true}
            >
              <IonDatetime
                class='date-picker-pop-up'
                value={endDate}
                onIonChange={(e) => {
                  if (typeof e.detail.value === 'string') {
                    setEndDate(e.detail.value);
                  }
                }}
                onClick={(e) => {
                  const path = (e.nativeEvent as any).composedPath?.() as EventTarget[];
                  const isDayButtonClicked = path?.some((el) =>
                    el instanceof HTMLElement &&
                    el.classList.contains('calendar-day-wrapper')
                  );

                  if (isDayButtonClicked) {
                    setIsEndDateOpen(false);
                  }
                }}
                presentation="date"
                locale="ko-KR"
                min={startDate || undefined}
                max={defaultEndDate}
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
            className='virtuso'
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
      <IonButton onTouchStart={onScrollToTop} className='scroll-top-button'>
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
  searchText: string;
}

// 텍스트 하이라이트 헬퍼 함수
const highlightText = (text: string, searchText: string) => {
  if (!searchText.trim()) return text;
  
  const regex = new RegExp(`(${searchText})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, i) =>
    regex.test(part) ? <strong key={i} style={{ color: 'var(--ion-color-primary)', fontWeight: 600 }}>{part}</strong> : part
  );
};

// Optimized ApprovalItem with swipe actions
const ApprovalItem: React.FC<ApprovalProps> = ({ approval, index, isSelected, onSelectionChange, searchText }) => {
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

  const titleElement = useMemo(() =>
    <div className='approval-item-title'>
      <span>{highlightText(approval.apprTitle, searchText)}</span>
      <div className='approval-item-sub-title'>
        <IonIcon src={person} />
        <span>{highlightText(approval.creatorName, searchText)} ・ </span>
        <span>{approval.createDate}</span>
      </div>
    </div>
    , [approval.apprTitle, approval.creatorName, approval.createDate, searchText]);
  // const subElement = useMemo(() => <div style={{ height: '40px' }}> hello</div>, []);

  return (
    // <SwipeableItem
    //   isOpen={isOpen}
    //   setIsOpen={setIsOpen}
    //   actions={[
    //     { label: '승인', color: '#4CAF50', onClick: handleApprove },
    //     { label: '반려', color: '#F44336', onClick: handleReject }
    //   ]}
    // >
    <CustomItem
      selectable={true}
      checked={isSelected}
      title={titleElement}
      onClick={() => { }}
      onCheckboxChange={handleCheckboxChange}
    // sub={subElement}
    />
    // {/* </SwipeableItem> */}
  );
};


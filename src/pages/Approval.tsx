import { IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, IonToolbar, RefresherCustomEvent, useIonRouter, useIonViewWillEnter, IonButton, IonDatetime, IonPopover, IonItem, IonCheckbox, IonFab, IonImg } from '@ionic/react';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { chevronForwardOutline, refreshOutline, refresh, calendarClear, close, checkmark, person, closeOutline, checkmarkOutline } from 'ionicons/icons';
import { ApprovalModel } from '../stores/types';
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

  // 아이템 선택 상태 관리
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
      const filteredFlowNos = new Set(filteredApprovals.map(approval => approval.flowNo));
      const newSelectedItems = new Set<string>();

      selectedItems.forEach((flowNo) => {
        if (filteredFlowNos.has(flowNo)) {
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
      const newSet = new Set<string>();
      filteredApprovals.forEach(approval => {
        newSet.add(approval.flowNo);
      });
      setSelectedItems(newSet);
    }
  }, [filteredApprovals, isAllSelected]);

  const renderItem = useCallback((index: number, approval: ApprovalModel) => {
    if (!approval || !approval.flowNo) {
      return <div className="approval-item-wrapper">Error: Invalid item</div>;
    }

    const isSelected = selectedItems.has(approval.flowNo);
    const isLastItem = filteredApprovals && index === filteredApprovals.length - 1;
    return (
      <div className={`approval-item-wrapper ${isSelected ? 'selected' : ''} ${index === 0 ? 'first-item' : ''} ${isLastItem ? 'last-item' : ''}`}>
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
  }, [selectedItems, handleItemSelection, searchText, filteredApprovals]);

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
                    <IonIcon src={closeOutline} />
                    <span>반려하기</span>
                  </IonButton>
                  <IonButton mode='md' color='primary' disabled={selectedItems.size === 0}>
                    <IonIcon src={checkmarkOutline} />
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
            ref={virtuosoRef}
            data={filteredApprovals}
            overscan={10}
            initialItemCount={10}
            initialTopMostItemIndex={0}
            increaseViewportBy={{ top: 200, bottom: 200 }}
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

// 독립적인 ScrollToTop FAB 컴포넌트
interface ScrollToTopFabProps {
  isTop: boolean;
  onScrollToTop: () => void;
  scrollCallbackRef: React.RefObject<(() => void) | null>;
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
        marginBottom: 'calc(var(--ion-safe-area-bottom) + 12px)',
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

// 텍스트 하이라이트 헬퍼 함수 (컴포넌트 외부에서 정의하여 매번 재생성 방지)
const highlightText = (text: string, searchText: string) => {
  if (!searchText.trim()) return text;

  const regex = new RegExp(`(${searchText})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, i) =>
    regex.test(part) ? <strong key={i} style={{ color: 'var(--ion-color-primary)', fontWeight: 600 }}>{part}</strong> : part
  );
};

// ApprovalItem with swipe actions
const ApprovalItem: React.FC<ApprovalProps> = React.memo(({ approval, index, isSelected, onSelectionChange, searchText }) => {
  const handleCheckboxChange = useCallback((checked: boolean) => {
    onSelectionChange(approval.flowNo, checked);
  }, [approval.flowNo, onSelectionChange]);

  const titleElement = useMemo(() =>
    <div className='custom-item-title'>
      <span>{highlightText(approval.apprTitle, searchText)}</span>
      <div className='custom-item-sub-title'>
        <IonIcon src={person} />
        <span>{highlightText(approval.creatorName, searchText)} ・ </span>
        <span>{approval.createDate}</span>
      </div>
    </div>
    , [approval.apprTitle, approval.creatorName, approval.createDate, searchText]);

  console.log('rebuild' + index);

  const bodyElement = useMemo(() =>
    <div className='custom-item-body'>
      <div className='custom-item-body-line'>
        <span>구분</span>
        <span>임시전표</span>
      </div>
      <div className='custom-item-body-line'>
        <span>전표 번호</span>
        <span>1900000165</span>
      </div>
      <div className='custom-item-body-line'>
        <span>거래처</span>
        <span>현대 법인카드_7430820</span>
      </div>
      <div className='custom-item-body-line'>
        <span>기본적요</span>
        <span>소모품비</span>
      </div>
      <div className='custom-item-body-line'>
        <span>계정명</span>
        <span>소모품비-기타</span>
      </div>
    </div>
    , []);

  return (
    <CustomItem
      selectable={true}
      checked={isSelected}
      title={titleElement}
      body={bodyElement}
      onClick={() => { }}
      onCheckboxChange={handleCheckboxChange}
    />
  );
});


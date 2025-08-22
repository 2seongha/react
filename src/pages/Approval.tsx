import { IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent, IonSearchbar,  RefresherCustomEvent, useIonRouter, useIonViewWillEnter, IonButton, IonDatetime, IonPopover, IonItem, IonCheckbox, IonFab, IonImg, useIonViewWillLeave, useIonViewDidLeave, createGesture } from '@ionic/react';
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { chevronForwardOutline, refreshOutline, refresh, calendarClear, person, closeOutline, checkmarkOutline, headset } from 'ionicons/icons';
import { ApprovalModel } from '../stores/types';
import CustomItem from '../components/CustomItem';
import CustomSkeleton from '../components/CustomSkeleton';
import './Approval.css';
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

  useEffect(() => {
    setApprovals(null);
    setSelectedItems(new Set());
    setSearchText('');
    fetchApprovals();

    return () => setApprovals(null);
  }, []);

  // useIonViewWillEnter(() => {
  // });

  // useIonViewDidLeave(() => {
  // });

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
  const contentRef = useRef<HTMLIonContentElement>(null);

  const scrollToTop = () => {
    contentRef.current?.scrollToTop(500);
  };

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      content.getScrollElement().then((scrollElement) => {
        if (scrollElement) {
          const scrollTop = scrollElement.scrollTop;
          setIsTop(scrollTop < 100);

          if (scrollCallbackRef.current) {
            scrollCallbackRef.current();
          }
        }
      });
    };

    content.getScrollElement().then((scrollElement) => {
      if (scrollElement) {
        scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      }
    });

    return () => {
      content.getScrollElement().then((scrollElement) => {
        if (scrollElement) {
          scrollElement.removeEventListener('scroll', handleScroll);
        }
      });
    };
  }, []);

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

  // 검색어와 날짜로 필터링된 결과
  const filteredApprovals = useMemo(() => {
    if (!approvals) return null;
    let filtered = approvals;

    // 날짜 필터링
    if (startDate || endDate) {
      filtered = filtered.filter(approval => {
        const createDate = new Date(approval.createDate);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // 시간을 00:00:00으로 설정하여 날짜만 비교
        if (start) start.setHours(0, 0, 0, 0);
        if (end) end.setHours(23, 59, 59, 999);
        createDate.setHours(0, 0, 0, 0);

        if (start && createDate < start) return false;
        if (end && createDate > end) return false;

        return true;
      });
    }

    // 검색어 필터링
    if (searchText.trim()) {
      filtered = filtered.filter(approval =>
        approval.apprTitle.toLowerCase().includes(searchText.toLowerCase()) ||
        approval.creatorName.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    return filtered;
  }, [approvals, searchText, startDate, endDate]);

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

  // renderItem 함수 제거하고 직접 렌더링

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
            {/* <IonToolbar > */}
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
            {/* </IonToolbar> */}
            {/* 날짜 선택 섹션 */}
            {/* <IonToolbar > */}
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
            {/* </IonToolbar> */}
            {/* <IonToolbar> */}
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
            {/* </IonToolbar> */}

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
                onClick={(e) => {
                  const path = (e.nativeEvent as any).composedPath?.() as EventTarget[];
                  const isDayButtonClicked = path?.some((el) =>
                    el instanceof HTMLElement &&
                    el.classList.contains('calendar-day-wrapper')
                  );

                  if (isDayButtonClicked) {
                    if (typeof (e.target as any).closest('ion-datetime')?.value === 'string') {
                      setStartDate((e.target as any).closest('ion-datetime').value);
                    }
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
                onClick={(e) => {
                  const path = (e.nativeEvent as any).composedPath?.() as EventTarget[];
                  const isDayButtonClicked = path?.some((el) =>
                    el instanceof HTMLElement &&
                    el.classList.contains('calendar-day-wrapper')
                  );
                  if (isDayButtonClicked) {
                    if (typeof (e.target as any).closest('ion-datetime')?.value === 'string') {
                      setEndDate((e.target as any).closest('ion-datetime').value);
                    }
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
        ref={contentRef}
        scrollEvents={false}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode={getPlatformMode()} disabled={!isTop}>
          {getPlatformMode() === 'md' ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>

        {!approvals ? (
          <div className='skeleton-container'>
            {Array.from({ length: 5 }, (_, index) => (
              <CustomSkeleton width='100%' height='200px' style={{ marginBottom: '12px', borderRadius: '12px' }} key={`skeleton-${index}`} />
            ))}
          </div>
        ) : filteredApprovals && filteredApprovals.length > 0 ? (
          approvals.map((approval, index) => (
            <ApprovalItem
              key={approval.flowNo}
              approval={approval}
              index={index}
              isSelected={selectedItems.has(approval.flowNo)}
              onSelectionChange={handleItemSelection}
              searchText={searchText}
              isFirstItem={index === 0}
              isLastItem={index === (filteredApprovals?.length ?? 0) - 1}
            />
          ))
          // <Virtuoso
          //   className='virtuoso'
          //   ref={virtuosoRef}
          //   data={filteredApprovals}
          //   overscan={30}
          //   initialItemCount={20}
          //   initialTopMostItemIndex={0}
          //   increaseViewportBy={{ top: 800, bottom: 800 }}
          //   atTopStateChange={(atTop) => setIsTop(atTop)}
          //   rangeChanged={() => {
          //     if (scrollCallbackRef.current) {
          //       scrollCallbackRef.current();
          //     }
          //   }}
          //   itemContent={renderItem}
          // />
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
  isFirstItem: boolean;
  isLastItem: boolean;
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

// ApprovalItem 컴포넌트 - wrapper div 포함
const ApprovalItem: React.FC<ApprovalProps> = React.memo(({ approval, index, isSelected, onSelectionChange, searchText, isFirstItem, isLastItem }) => {
  const router = useIonRouter();

  const handleCheckboxChange = useCallback((checked: boolean) => {
    onSelectionChange(approval.flowNo, checked);
  }, [approval.flowNo, onSelectionChange]);

  console.log('approval item rebuild : ' + index);

  const handleItemClick = useCallback(() => {
    console.log('아이템 클릭:', approval.flowNo);
    router.push(`/detail/${approval.flowNo}`, 'forward', 'push');
  }, [approval.flowNo]); // router 의존성 제거

  const handleLongPress = useCallback(() => {
    console.log('롱프레스:', approval.flowNo);
    // TODO: 롱프레스 로직 구현 (예: 컨텍스트 메뉴, 다중 선택 모드 등)
  }, [approval.flowNo]);

  // title 엘리먼트 메모이제이션 - 검색어가 변경될 때만 재생성
  const titleElement = useMemo(() => (
    <div className='custom-item-title'>
      <span>{highlightText(approval.apprTitle, searchText)}</span>
      <div className='custom-item-sub-title'>
        <IonIcon src={person} />
        <span>{highlightText(approval.creatorName, searchText)} ・ </span>
        <span>{approval.createDate}</span>
      </div>
    </div>
  ), [approval.apprTitle, approval.creatorName, approval.createDate, searchText]);

  // body 엘리먼트 메모이제이션 - 실제 데이터로 교체 필요
  const bodyElement = useMemo(() => (
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
      {/* <IonImg src='https://cdn.gamey.kr/news/photo/202304/3004960_109898_511.jpg' style={{height:'400px', width:'100%', objectFit:'fill'}}></IonImg> */}
    </div>
  ), []); // 하드코딩된 데이터이므로 빈 의존성 배열

  // CustomItem props 메모이제이션 - state 대신 ref 사용으로 최적화
  const customItemProps = useMemo(() => ({
    selectable: true,
    checked: isSelected,
    title: titleElement,
    body: bodyElement,
    onClick: handleItemClick,
    onLongPress: handleLongPress,
    onCheckboxChange: handleCheckboxChange,
  }), [isSelected, titleElement, bodyElement, handleItemClick, handleLongPress, handleCheckboxChange]);


  return (
    <div className={`approval-item-wrapper ${isFirstItem ? 'first-item' : ''} ${isLastItem ? 'last-item' : ''}`}>
      <CustomItem {...customItemProps} />
    </div>
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수로 불필요한 리렌더링 방지
  return (
    prevProps.approval.flowNo === nextProps.approval.flowNo &&
    prevProps.approval.apprTitle === nextProps.approval.apprTitle &&
    prevProps.approval.creatorName === nextProps.approval.creatorName &&
    prevProps.approval.createDate === nextProps.approval.createDate &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.searchText === nextProps.searchText &&
    prevProps.index === nextProps.index &&
    prevProps.isFirstItem === nextProps.isFirstItem &&
    prevProps.isLastItem === nextProps.isLastItem
  );
});



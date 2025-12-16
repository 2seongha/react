import { IonContent, IonIcon, IonPage, IonRefresher, IonRefresherContent, IonSearchbar, RefresherCustomEvent, useIonRouter, IonButton, IonDatetime, IonPopover, IonItem, IonCheckbox, isPlatform, IonHeader, useIonViewWillLeave } from '@ionic/react';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { chevronForwardOutline, refreshOutline, refresh, calendarClear, person, closeOutline, clipboard, clipboardSharp, attachOutline } from 'ionicons/icons';
import CustomItem from '../components/CustomItem';
import ScrollToTopFab, { useVirtuosoScrollToTop } from '../components/ScrollToTopFab';
import CustomSkeleton from '../components/CustomSkeleton';
import './Approval.css';
import { useParams } from 'react-router-dom';
import NoData from '../components/NoData';
import _ from 'lodash';
import { webviewHaptic } from '../webview';
import ApprovalModal from '../components/ApprovalModal';
import { Virtuoso } from 'react-virtuoso';

const Approval: React.FC = () => {
  let { P_AREA_CODE, AREA_CODE, P_AREA_CODE_TXT, AREA_CODE_TXT } = useParams<{ P_AREA_CODE: string, AREA_CODE: string, P_AREA_CODE_TXT: string, AREA_CODE_TXT: string }>();
  P_AREA_CODE_TXT = decodeURIComponent(P_AREA_CODE_TXT);
  AREA_CODE_TXT = decodeURIComponent(AREA_CODE_TXT);
  const setApprovals = useAppStore(state => state.setApprovals);
  const getApprovals = useAppStore(state => state.getApprovals);

  const approvals = useAppStore(state => state.approvals);
  const [refreshEnable, setRefreshEnable] = useState(true);
  const router = useIonRouter();

  // 캐싱된 타이틀들
  const { isTop, scrollToTop, scrollCallbackRef, contentRef, scrollerRef } = useVirtuosoScrollToTop();
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState<string>('');

  useEffect(() => {
    setSelectedItems(new Set());
    setSearchText('');
    setApprovals(null);
    getApprovals(P_AREA_CODE, AREA_CODE, '', '');

    return () => {
      setApprovals(null);
    }
  }, []);

  // useIonViewWillEnter(() => {
  // });

  // useIonViewWillLeave(() => {
  //   setApprovals(null);
  // })

  // useIonViewDidLeave(() => {
  // });

  async function handleRefresh(event: RefresherCustomEvent) {
    setApprovals(null);
    setSelectedItems(new Set());
    setSearchText('');
    webviewHaptic("mediumImpact");
    await Promise.allSettled(([getApprovals(P_AREA_CODE, AREA_CODE, '', '')]));
    event.detail.complete();
  }

  const totalCount = useMemo(() => {
    return approvals?.LIST?.length ? Number(approvals?.LIST?.length) : 0;
  }, [approvals]);

  //* 날짜 관련
  const { defaultStartDate, defaultEndDate } = useMemo(() => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setMonth(today.getMonth() - 12);

    return {
      defaultStartDate: oneYearAgo.toISOString().split('T')[0], // YYYY-MM-DD 형식
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


  // 네비게이션 핸들러 - useCallback으로 최적화
  const handleBackNavigation = useCallback(() => {
    router.goBack();
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
    if (!approvals || approvals instanceof Error) return null;
    let filtered = approvals.LIST;

    // 날짜 필터링
    if (startDate || endDate) {
      filtered = filtered.filter((approval: any) => {
        const createDate = new Date(approval.CREATE_DATE);
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
      filtered = filtered.filter((approval: any) =>
        approval.APPR_TITLE.toLowerCase().includes(searchText.toLowerCase()) ||
        approval.CREATOR_NAME.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return filtered;
  }, [approvals, searchText, startDate, endDate]);

  // 필터링된 결과가 변경될 때 선택된 아이템 중 필터에서 제외된 것들 제거
  useEffect(() => {
    if (filteredApprovals && selectedItems.size > 0) {
      const filteredFlowNos = new Set(filteredApprovals.map((approval: any) => approval.FLOWNO));
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
    filteredApprovals?.map((approval: any) => approval.FLOWNO) ?? [],
    [filteredApprovals]
  );

  // 전체 선택 상태 계산
  const isAllSelected = useMemo(() => {
    if (filteredFlowNos.length === 0) return false;
    return filteredFlowNos.every((flowNo: any) => selectedItems.has(flowNo));
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
      filteredApprovals.forEach((approval: any) => {
        newSet.add(approval.FLOWNO);
      });
      setSelectedItems(newSet);
    }
  }, [filteredApprovals, isAllSelected]);

  const handleItemClick = useCallback((approval: any) => {
    router.push(`/detail/${approval.FLOWNO || '-'}/${P_AREA_CODE}/${AREA_CODE}/${encodeURIComponent(P_AREA_CODE_TXT)}/${encodeURIComponent(AREA_CODE_TXT)}`, 'forward', 'push');
  }, []); // router 의존성 제거

  return (
    <IonPage className='approval'>
      <AppBar
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className='app-bar-sub-title' onClick={handleBackNavigation}>{approvals?.P_AREA_CODE_TXT || P_AREA_CODE_TXT}</span>
            <IonIcon src={chevronForwardOutline} style={{ width: 16, color: 'var(--ion-color-secondary)' }} />
            <span>{approvals?.AREA_CODE_TXT ?? AREA_CODE_TXT}</span>
          </div>
        }
        showBackButton={true}
        showCount={true}
        count={totalCount} />
      <IonHeader mode='ios'>
        <div style={{
          backgroundColor: 'var(--ion-background-color)',
          borderBottom: '0.55px solid var(--custom-border-color-50)'
        }}>
          <IonSearchbar
            mode='ios'
            class='search-bar'
            value={searchText}
            onIonInput={handleSearch}
            placeholder="제목 / 상신자"
            showClearButton="focus"
            clearIcon={closeOutline}
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
          {P_AREA_CODE === 'TODO' && <div className='buttons-wrapper'>
            <IonItem button onTouchStart={handleSelectAll} mode='md' className='select-all-button'>
              <IonCheckbox
                mode='md'
                checked={isAllSelected}
                style={{ pointerEvents: 'none' }}
              />
              <span>전체 선택 <span style={{ color: 'var(--ion-color-primary)' }}>({selectedItems.size})</span></span>
            </IonItem>
            <div className='approve-buttons'>
              <IonButton id="approval-reject-modal" mode='md' color='light' disabled={selectedItems.size === 0} style={{ '--border-radius': '8px' }}>
                <span style={{ padding: '0 4px' }}>반려하기</span>
              </IonButton>
              <IonButton id="approval-approve-modal" mode='md' color='primary' disabled={selectedItems.size === 0} style={{ '--border-radius': '8px' }}>
                <span style={{ padding: '0 4px' }}>승인하기</span>
              </IonButton>
            </div>
          </div>
          }
          {/* </IonToolbar> */}

          {/* 시작일 선택 팝오버 */}
          <IonPopover
            mode='ios'
            side="bottom" alignment="center"
            trigger="start-date-trigger"
            isOpen={isStartDateOpen}
            onDidDismiss={() => setIsStartDateOpen(false)}
            showBackdrop={true}
          >
            <IonDatetime
              mode='md'
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
            mode='ios'
            side="bottom" alignment="center"
            trigger="end-date-trigger"
            isOpen={isEndDateOpen}
            onDidDismiss={() => setIsEndDateOpen(false)}
            showBackdrop={true}
          >
            <IonDatetime
              mode='md'
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
        </div>
      </IonHeader >
      <IonContent
        scrollEvents={false}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} disabled={!refreshEnable}>
          {isPlatform('android') ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>
        {
          approvals instanceof Error ?
            <NoData message="예상치 못한 오류가 발생했습니다." />
            :
            !approvals?.LIST ? (
              <div className='skeleton-container'>
                {Array.from({ length: 5 }, (_, index) => (
                  <CustomSkeleton width='100%' height='160px' style={{ marginBottom: '12px', borderRadius: '12px' }} key={`skeleton-${index}`} />
                ))}
              </div>
            ) : filteredApprovals && filteredApprovals.length > 0 ? (
              // filteredApprovals.map((approval: any, index: number) =>
              //   <ApprovalItem
              //     key={`approval-${approval.FLOWNO}-${index}`}
              //     selectable={P_AREA_CODE === 'TODO'}
              //     approval={approval}
              //     index={index}
              //     isSelected={selectedItems.has(approval.FLOWNO)}
              //     onSelectionChange={handleItemSelection}
              //     searchText={searchText}
              //     isFirstItem={index === 0}
              //     isLastItem={index === (filteredApprovals?.length ?? 0) - 1}
              //     handleItemClick={handleItemClick}
              //   />
              // )

              <Virtuoso
                ref={contentRef}
                scrollerRef={scrollerRef}
                data={filteredApprovals}
                overscan={15}
                initialItemCount={15}
                initialTopMostItemIndex={0}
                increaseViewportBy={{ top: 200, bottom: 200 }}
                atTopStateChange={atTop => setRefreshEnable(atTop)}
                itemContent={(index, approval) => {
                  if (!approval) return <div style={{ minHeight: 50 }} />;

                  return (
                    <ApprovalItem
                      key={`approval-${approval.FLOWNO}-${index}`}
                      selectable={P_AREA_CODE === "TODO"}
                      approval={approval}
                      index={index}
                      isSelected={selectedItems.has(approval.FLOWNO)}
                      onSelectionChange={handleItemSelection}
                      searchText={searchText}
                      isFirstItem={index === 0}
                      isLastItem={index === (filteredApprovals?.length ?? 0) - 1}
                      handleItemClick={handleItemClick}
                    />
                  );
                }}
              />
            ) : <NoData message="해당 항목에 대한 데이터가 없습니다." />}
        <ScrollToTopFab
          isTop={isTop}
          onScrollToTop={scrollToTop}
          scrollCallbackRef={scrollCallbackRef}
        />
        {/* 승인 Modal */}
        {P_AREA_CODE === 'TODO' && <ApprovalModal
          activity='APPROVE'
          apprTitle={AREA_CODE_TXT}
          required={false}
          trigger="approval-approve-modal"
          selectedApprovals={filteredApprovals?.filter((sub: any) => selectedItems.has(sub.FLOWNO))}
        />}
        {/* 반려 Modal */}
        {P_AREA_CODE === 'TODO' && <ApprovalModal
          activity='REJECT'
          apprTitle={AREA_CODE_TXT}
          required={true}
          trigger="approval-reject-modal"
          selectedApprovals={filteredApprovals?.filter((sub: any) => selectedItems.has(sub.FLOWNO))}
        />}
      </IonContent>
    </IonPage >
  );
};

export default Approval;


interface ApprovalProps {
  index: number;
  approval: any;
  selectable: boolean;
  isSelected: boolean;
  onSelectionChange: (id: string, isSelected: boolean) => void;
  searchText: string;
  isFirstItem: boolean;
  isLastItem: boolean;
  handleItemClick: (approval: any) => void;
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
const ApprovalItem: React.FC<ApprovalProps> = React.memo(({ index, approval, selectable, isSelected, onSelectionChange, searchText, isFirstItem, isLastItem, handleItemClick }) => {
  const titles = useAppStore(state => state.approvals?.TITLE.TITLE_H);
  const flds = _(approval)
    .pickBy((_, key) => /^FLD\d+$/.test(key))
    .toPairs()
    .sortBy(([key]) => parseInt(key.replace('FLD', ''), 10))
    .map(([_, value]) => value)
    .value();

  const handleCheckboxChange = useCallback((checked: boolean) => {
    onSelectionChange(approval.FLOWNO, checked);
  }, [approval.FLOWNO, onSelectionChange]);

  console.log('approval item rebuild : ' + index);

  // title 엘리먼트 메모이제이션 - 검색어가 변경될 때만 재생성
  const titleElement = useMemo(() => (
    <div className='custom-item-title'>
      <span className={!_.isEmpty(approval.ATTACH) ? 'attach-title' : ''}>{highlightText(approval.APPR_TITLE, searchText)}</span>
      {!_.isEmpty(approval.ATTACH) && <IonIcon src={attachOutline} style={{
        position: 'absolute',
        width: '17px',
        height: '17px',
        color: 'var(--ion-color-secondary)'
      }} />
      }
      <div className='custom-item-sub-title'>
        <IonIcon src={person} />
        <span>{highlightText(approval.CREATOR_NAME, searchText)} ・ </span>
        <span>{approval.CREATE_DATE}</span>
      </div>
    </div>
  ), [approval.APPR_TITLE, approval.CREATOR_NAME, approval.CREATE_DATE, searchText]);

  const bodyElement = useMemo(() => (
    <div className='custom-item-body'>
      {titles?.map((title, index) => {
        return <div className='custom-item-body-line' key={approval.FLOWNO + index}>
          <span>{title}</span>
          <span>{flds[index] || '-'}</span>
        </div>;
      })}
    </div>
  ), [titles]);

  // CustomItem props 메모이제이션 - state 대신 ref 사용으로 최적화
  const customItemProps = useMemo(() => ({
    selectable: selectable,
    checked: isSelected,
    title: titleElement,
    body: bodyElement,
    onClick: () => handleItemClick(approval),
    onCheckboxChange: handleCheckboxChange,
    checkboxCenter: false,
  }), [isSelected, titleElement, bodyElement, handleItemClick, handleCheckboxChange]);


  return (
    <div className={`approval-item-wrapper ${isFirstItem ? 'first-item' : ''} ${isLastItem ? 'last-item' : ''}`}>
      <CustomItem {...customItemProps} />
    </div>
  );
});



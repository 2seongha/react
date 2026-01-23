import React, { forwardRef, RefObject, useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonContent,
  IonDatetime,
  IonFooter,
  IonHeader,
  IonIcon,
  IonItem,
  IonPage,
  IonPopover,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonToolbar,
  useIonRouter,
  useIonViewWillEnter,
} from '@ionic/react';
import AppBar from '../components/AppBar';
import "./CreditCard.css";
import { add, addOutline, calendarClear } from 'ionicons/icons';
import CachedImage from '../components/CachedImage';
import { banknotesGlassIcon, creditcardGlassIcon } from '../assets/images';
import SearchHelpModal from '../components/SearchHelpModal';
import { deleteAttach, getCardList, getCardNo, getSearchHelp, getStart, postAttach, postExtraFieldUse, postStart } from '../stores/service';
import { webviewHaptic, webviewToast } from '../webview';
import _ from 'lodash';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import LoadingIndicator from '../components/LoadingIndicator';
import DatePickerModal from '../components/DatePicker';
import { FormRef } from '../stores/types';
import CustomInput from '../components/CustomInput';
import dayjs from 'dayjs';
import { getTopModalId, popModal } from '../App';
import Notify from 'simple-notify';
import { getFileTypeIcon } from '../utils';
import AnimatedIcon from '../components/AnimatedIcon';
import { FlipWords } from '../components/FlipWords';
import useAppStore from '../stores/appStore';
import CustomDialog from '../components/Dialog';
import NoData from '../components/NoData';

const CreditCard: React.FC = () => {
  const router = useIonRouter();
  //* ==========상태 관련===========
  const [step, setStep] = useState(0);
  const [enabledStep3, setEnabledStep3] = useState(true);
  const [approval, setApproval] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [animationFinished, setAnimationFinished] = useState<any>(null); // 결과 애니메이션 종료
  const ignorePopRef = useRef(false);
  const interactPopRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastScrollRef = useRef<number | null>(null);
  const prevStepRef = useRef(0);
  const currStepRef = useRef(0);
  const animationRef = useRef(false); // 애니메이션 중 뒤로가기 막음
  const isCloseButtonRef = useRef(false); // 닫기 버튼을 누른건지 판별용
  const successRef = useRef(false); // 성공시 뒤로가기하면 홈으로
  const fileNoRef = useRef(0); // 첨부 파일 넘버는 상태 유지
  const itemRef = useRef<AddItemHandle>(null);
  const shouldAnimateEdge = (step === 0) || (prevStepRef.current === 99 && step === 0);

  const [isSearching, setIsSearching] = useState(false); // 조회 중인지 버튼 제어
  const [cardList, setCardList] = useState(null); // 카드 사용 내역

  //* 날짜 관련
  const { defaultStartDate, defaultEndDate } = useMemo(() => {
    return {
      defaultStartDate: dayjs().subtract(3, 'month').startOf('month').format('YYYYMMDD'),
      defaultEndDate: dayjs().format('YYYYMMDD')
    };
  }, []); // 빈 배열로 컴포넌트 마운트 시에만 실행

  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  // 날짜 포맷팅 함수 - useCallback으로 최적화
  const formatDate = useCallback((dateString: string) => {
    if (!dateString) return '날짜 선택';
    return dayjs(dateString).format('YYYY-MM-DD');
  }, []);

  //* 검색 관련
  const [searchData, setSearchData] = useState<any>({
    companyCode: [],
    cardNo: [],
  }); // 바인딩 데이터
  const [searchFilter, setSearchFilter] = useState<any>({
    companyCode: '',
    cardNo: '',
    startDate: defaultStartDate,
    endDate: defaultEndDate
  }); // 검색 조건

  //* ==========레이아웃 관련===========
  const title = useMemo(() => {
    let title;
    switch (step) {
      case 0:
        title = '법인카드';
        break;
      case 1:
        title = '전표 헤더';
        break;
      case 2:
        title = '첨부 파일';
        break;
      case 3:
        title = '결재 정보';
        break;
      case 99:
        title = '항목 추가';
        break;
    }
    return <span
    >
      {title}
    </span>
  }, [step]);

  // const setScrollRef = (node: HTMLDivElement) => {
  //   if (isSearching) {
  //     return;
  //   }
  //   if (node) {
  //     scrollRef.current = node;
  //     requestAnimationFrame(() => {
  //       if (lastScrollRef.current) node.scrollTop = lastScrollRef.current;
  //     });
  //   }
  // }

  const goStep = useCallback((newStep: number) => {
    prevStepRef.current = currStepRef.current;
    currStepRef.current = newStep;
    setStep(newStep);
  }, []);

  const variants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 10 : -10,
    }),
    center: { x: 0, opacity: 1, transition: { type: "tween", duration: 0.25 } },
    exit: (dir: number) => ({
      opacity: [1, 0],
      transition: { duration: currStepRef.current === 4 ? 0.25 : 0 }
    }),
  };

  const safeAreaBottom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ion-safe-area-bottom')) || 0;
  const buttonMotion = {
    initial: { y: 82 + safeAreaBottom },
    animate: { y: 0 },
    exit: { y: 82 + safeAreaBottom },
    transition: { duration: 0.25 },
  };
  const textAreaMotion = {
    initial: { y: 83, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 83, opacity: 0 },
    transition: { duration: 0.25 },
  };

  //* ==========이벤트===========
  useIonViewWillEnter(() => {
    const initApproval = async () => {

      const [approval, companyCode] = await Promise.all([
        getStart('IA102'),
        getSearchHelp('BUK'),
      ]);
      if (approval instanceof Error || companyCode instanceof Error) {
        webviewToast('예상치 못한 오류가 발생했습니다. 잠시 후 시도해주세요.');
        return router.goBack();
      }
      oriItem.current = approval.FLOWHD_DOCITEM[0];
      approval.FLOWHD_DOCITEM = [];
      setApproval(approval);

      const defaultCompanyCode = companyCode[0].Key;
      const cardNo = await getCardNo('IA102', defaultCompanyCode, searchFilter.endDate, searchFilter.startDate);

      setSearchData({
        companyCode,
        cardNo
      });

      setSearchFilter((prev: any) => {
        return {
          ...prev,
          companyCode: defaultCompanyCode,
          cardNo: cardNo[0].Cardno
        }
      });
    }
    initApproval();
  });

  useEffect(() => {
    if (step > prevStepRef.current) {
      window.history.pushState({ step }, '', window.location.href);
    } else if ((step < prevStepRef.current)) {
      if (!interactPopRef.current) {
        ignorePopRef.current = true;
        window.history.back();
      } else {
        interactPopRef.current = false;
      }
    }
  }, [step]);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (currStepRef.current === 4 && animationRef.current) {
        // history를 한 번 더 밀어서 실제 뒤로 안 가게 함
        window.history.pushState(
          { step: 4 },
          '',
          window.location.href
        );
        return;
      }

      if (['dialog', 'searchHelp', 'datePicker'].includes(getTopModalId() ?? '')) {
        return popModal();
      }

      if (ignorePopRef.current) {
        ignorePopRef.current = false;
        return;
      }

      if (currStepRef.current > 0 && !isCloseButtonRef.current && !successRef.current) {
        interactPopRef.current = true;
        setAnimationFinished(false);
        return goStep((currStepRef.current === 99 ? 0 : currStepRef.current - 1));
      }

      window.removeEventListener('popstate', handlePopState);
      window.history.go(-4);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  //* ==========메소드===========
  //* 회사코드 변경
  const handleChangeFilter = useCallback(async (e: any, type: string) => {
    var value = e?.target?.value;
    setSearchFilter((prev: any) => {
      return {
        ...prev,
        [type]: value,
      }
    });

    if (type === 'companyCode') {
      const cardNo = await getCardNo('IA102', value, searchFilter.endDate, searchFilter.startDate);

      setSearchData((prev: any) => {
        return {
          ...prev,
          cardNo,
        }
      });

      setSearchFilter((prev: any) => {
        return {
          ...prev,
          cardNo: cardNo[0].Cardno
        }
      });
    }
  }, []);

  //* 검색 버튼
  const handleSearch = useCallback(async () => {
    try {
      setIsSearching(true);
      const cardList = await getCardList('IA102', searchFilter.companyCode, searchFilter.cardNo, searchFilter.startDate, searchFilter.endDate);
      setCardList(cardList);
    } catch (e) {
      new Notify({
        status: 'error',
        title: '예상치 못한 오류가 발생했습니다.',
        position: 'x-center bottom',
        autotimeout: 2000,
      });
    } finally {
      setIsSearching(false);
      // lastScrollRef.current = scrollRef.current?.scrollTop ?? 0;
    }
  }, [searchFilter]);

  //* 항목 추가
  const oriItem = useRef(null); // 항목 템플릿
  const [docItem, setDocItem] = useState(null); // 항목 추가 바인딩
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

  // 항목 추가
  const handleAddItem = useCallback(() => {
    const cloneItem = _.cloneDeep<any>(oriItem.current);
    if (cloneItem) {
      cloneItem.BUZEI = ''; // 공란
      cloneItem.SEQNR = '1'; // 임직원개인경비 - 1고정
      cloneItem.WRBTR = '';
      cloneItem.DMBTR = '';
    }

    goStep(99);
    setDocItem(cloneItem);
    setIsSaveEnabled(false);
  }, [approval]);

  const reOrderItemNo = useCallback((list: any) => {
    return list.map((itm: any, i: number) => {
      itm.DOCITEM_ATTENDEELIST.forEach((attendee: any, idx: number) => {
        attendee.ITEMNO = String(i + 1);
        attendee.KEY_CNT = String(idx + 1);
      });
      return {
        ...itm,
        CNT: String(i + 1),
        ITEMNO: String(i + 1),
      };
    });
  }, []);

  // 항목 저장
  const handleSaveItem = useCallback((item: any) => {
    const newItem = { ...item };
    let isEdit = false;

    const validate = itemRef.current?.validate();
    if (!validate?.result) {
      return new Notify({
        status: 'error',
        title: validate.message,
        position: 'x-center bottom',
        autotimeout: 2000,
      });
    }

    const attendeeList = newItem.DOCITEM_ATTENDEELIST;
    if (!_.isEmpty(attendeeList)) {
      const { hasA, hasB } = attendeeList.reduce((acc: any, item: any) => {
        if (item.GUBUN === 'A') acc.hasA = true;
        if (item.GUBUN === 'B') acc.hasB = true;
        return acc;
      }, { hasA: false, hasB: false });

      if (!hasA || !hasB) {
        return new Notify({
          status: 'error',
          title: '접대자와 접대 받는 자를 모두 입력해야 합니다.',
          position: 'x-center bottom',
          autotimeout: 2000,
        });
      }
    }

    setApproval((prev: any) => {
      if (!prev || !prev.FLOWHD_DOCITEM) {
        return { ...prev, FLOWHD_DOCITEM: [{ ...newItem, CNT: '1', ITEMNO: '1' }] };
      }

      const list = [...prev.FLOWHD_DOCITEM];
      const index = list.findIndex(
        (itm) => String(itm.CNT) === String(newItem.CNT)
      );

      let newList;
      if (index > -1) {
        isEdit = true;
        newList = list.map((itm, i) =>
          i === index ? { ...itm, ...newItem } : itm
        );
      } else {
        newList = [...list, newItem];
      }

      // CNT, ITEMNO 재할당
      newList = reOrderItemNo(newList);

      return {
        ...prev,
        FLOWHD_DOCITEM: newList,
      };
    });
    new Notify({
      title: isEdit ? '수정되었습니다.' : '추가되었습니다.',
      position: 'x-center bottom',
      autotimeout: 2000,
    });

    goStep(0);
  }, [step]);

  // 항목 삭제
  const handleDeleteItem = useCallback((deleteIndex: number) => {
    setApproval((prev: any) => {
      if (!prev || !prev.FLOWHD_DOCITEM) return { FLOWHD_DOCITEM: [] };
      new Notify({
        status: 'error',
        title: '삭제되었습니다.',
        position: 'x-center bottom',
        autotimeout: 2000
      });
      // deleteIndex 기준으로 필터링 + 재정렬
      let newList = prev.FLOWHD_DOCITEM
        .filter((_: any, i: number) => i !== deleteIndex);

      // CNT, ITEMNO 재할당
      newList = reOrderItemNo(newList);

      return {
        ...prev,
        FLOWHD_DOCITEM: newList,
      };
    });

  }, []);


  return (
    <IonPage className='personal-expense'>
      <AppBar title={title} customStartButtons={
        <>
          {step === 0 && (
            <IonBackButton
              defaultHref="/app/home"
              mode="md"
              color="primary"
            />
          )}

          {step !== 0 && step !== 99 && step !== 4 && (
            <IonButton
              mode="md"
              fill="clear"
              onClick={() => goStep(step - 1)}
              style={{
                '--border-radius': '24px',
                marginLeft: '8px',
                width: '64px',
                height: '48px',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: '600' }}>이전</span>
            </IonButton>
          )}

          {step === 4 && animationFinished && result.Type !== 'S' && (
            <p></p>
          )}

          {step === 99 && (
            <IonButton
              mode='md'
              fill="clear"
              onClick={() => goStep(0)}
              style={{
                '--border-radius': '24px',
                marginLeft: '8px',
                width: '64px',
                height: '48px',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: '600' }}>취소</span>
            </IonButton>
          )}
        </>
      }
        customEndButtons={step === 4 && animationFinished && result.Type !== 'S' && (
          <IonButton
            mode="md"
            fill="clear"
            color='medium'
            onClick={() => {
              isCloseButtonRef.current = true;
              router.goBack();
            }}
            style={{
              '--border-radius': '24px',
              marginLeft: '8px',
              width: '64px',
              height: '48px',
            }}
          >
            <span style={{ fontSize: '16px', fontWeight: '600' }}>닫기</span>
          </IonButton>
        )}
      />
      {step === 0 && <>
        <IonHeader mode='ios'>
          <div style={{ padding: '0 21px' }}>
            <IonSelect
              mode='md'
              className='custom-ion-select'
              label='회사코드'
              interface="popover"
              placeholder="회사코드"
              style={{ marginBottom: '4px' }}
              interfaceOptions={{ cssClass: 'full-width-popover' }}
              justify='start'
              value={searchFilter.companyCode}
              onIonChange={e => handleChangeFilter(e, 'companyCode')}>
              {
                searchData.companyCode?.map((companyCode: any) =>
                  <IonSelectOption key={companyCode.Key} value={companyCode.Key}>
                    {`${companyCode.Key} (${companyCode.Name})`}
                  </IonSelectOption>)
              }
            </IonSelect>
            <IonSelect
              mode='md'
              className='custom-ion-select'
              label='카드번호'
              interface="popover"
              placeholder="카드번호"
              style={{ marginBottom: '12px' }}
              interfaceOptions={{ cssClass: 'full-width-popover' }}
              justify='start'
              value={searchFilter.cardNo}
              onIonChange={e => handleChangeFilter(e, 'cardNo')}>
              {
                searchData.cardNo?.map((cardNo: any) =>
                  <IonSelectOption key={cardNo.Cardno} value={cardNo.Cardno}>
                    {`${cardNo.Cardno.replace(/.{4}(?=.+)/g, '$&-')} ${cardNo.GubunTx ? `(${cardNo.GubunTx.slice(0, 2)} ${cardNo.OwnerName})` : ''}`}
                  </IonSelectOption>)
              }
            </IonSelect>
            <div className='date-toolbar-wrapper' style={{ padding: '0' }}>
              <IonItem
                button
                mode='md'
                className='date-toolbar-button-wrapper'
                id="start-date-trigger"
                style={{ flex: 1, '--min-height': '38px', '--height': '38px', border: 'none', '--background': 'var(--custom-border-color-0)' }}
                onClick={() => setIsStartDateOpen(true)}
              >
                <div className='date-toolbar-button'>
                  <IonIcon icon={calendarClear} />
                  <span>{formatDate(searchFilter.startDate)}</span>
                </div>
              </IonItem>
              <span>~</span>
              <IonItem
                button
                mode='md'
                className='date-toolbar-button-wrapper'
                id="end-date-trigger"
                style={{ flex: 1, '--min-height': '38px', '--height': '38px', border: 'none', '--background': 'var(--custom-border-color-0)' }}
                onClick={() => setIsEndDateOpen(true)}
              >
                <div className='date-toolbar-button'>
                  <IonIcon icon={calendarClear} />
                  <span>{formatDate(searchFilter.endDate)}</span>
                </div>
              </IonItem>
              <IonButton
                style={{
                  height: '38px',
                  width: '72px',
                  '--border-radius': '10px'
                }}
                onClick={handleSearch}
                disabled={isSearching}>
                {isSearching ? <LoadingIndicator color='#fff' style={{ width: 24 }} /> : '조회'}
              </IonButton>
            </div>
          </div>
        </IonHeader>
        < IonPopover
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
            value={dayjs(searchFilter.startDate).format('YYYY-MM-DD')}
            onClick={(e) => {
              const path = (e.nativeEvent as any).composedPath?.() as EventTarget[];
              const isDayButtonClicked = path?.some((el) =>
                el instanceof HTMLElement &&
                el.classList.contains('calendar-day-wrapper')
              );

              if (isDayButtonClicked) {
                if (typeof (e.target as any).closest('ion-datetime')?.value === 'string') {
                  setSearchFilter((prev: any) => {
                    return {
                      ...prev,
                      startDate: dayjs((e.target as any).closest('ion-datetime').value).format('YYYYMMDD')
                    }
                  })
                }
                setIsStartDateOpen(false);
              }
            }}
            presentation="date"
            locale="ko-KR"
          />
        </IonPopover>
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
            value={dayjs(searchFilter.endDate).format('YYYY-MM-DD')}
            onClick={(e) => {
              const path = (e.nativeEvent as any).composedPath?.() as EventTarget[];
              const isDayButtonClicked = path?.some((el) =>
                el instanceof HTMLElement &&
                el.classList.contains('calendar-day-wrapper')
              );
              if (isDayButtonClicked) {
                if (typeof (e.target as any).closest('ion-datetime')?.value === 'string') {
                  setSearchFilter((prev: any) => {
                    return {
                      ...prev,
                      endDate: dayjs((e.target as any).closest('ion-datetime').value).format('YYYYMMDD')
                    }
                  })
                }
                setIsEndDateOpen(false);
              }
            }}
            presentation="date"
            locale="ko-KR"
          />
        </IonPopover>
      </>
      }
      < IonContent
        fullscreen
        scrollX={false}
        scrollY={false}
        scrollEvents={false}
        forceOverscroll={false}
      >
        {approval === null && <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <LoadingIndicator />
        </div>}
        <AnimatePresence mode="wait" initial={false}>
          {/* 항목 페이지 */}
          {step === 0 && <motion.div
            key="step0"
            custom={step - prevStepRef.current}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{ height: '100%', padding: '12px 0px calc(82px + var(--ion-safe-area-bottom)) 0px' }}
          >
            <Item
              // setScrollRef={setScrollRef}
              cardList={cardList}
              onDeleteItem={handleDeleteItem}
              onItemClick={(item) => {
                if (scrollRef.current) {
                  lastScrollRef.current = scrollRef.current.scrollTop;
                }

                const cloneItem = _.cloneDeep<any>(item);
                setDocItem(cloneItem);
                setIsSaveEnabled(true);
                goStep(99);
              }} />
          </motion.div>}

          {/* 항목 추가 페이지 */}
          {step === 99 && <AddItem
            ref={itemRef}
            approval={approval}
            docItem={docItem}
            onSaveEnabledChange={enabled => {
              setIsSaveEnabled(enabled);
            }}
          />}

          {/* 헤더 페이지 */}
          {step === 1 &&
            <motion.div
              key="step1"
              custom={step - prevStepRef.current}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{ height: '100%', padding: '0px 0px calc(82px + var(--ion-safe-area-bottom)) 0px' }}
            >
              <Header docHeader={approval.FLOWHD_DOCHD} />
            </motion.div>
          }

          {/* 첨부 파일 페이지 */}
          {step === 2 && <motion.div
            key="step2"
            custom={step - prevStepRef.current}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              width: '100%',
              height: '100%',
              overflow: 'auto',
              overflowX: 'hidden',
              padding: '21px 21px calc(102px + max(var(--ion-safe-area-bottom))) 21px'
            }}
          >
            <Attach
              fileNo={fileNoRef}
              approval={approval}
            />
          </motion.div>}

          {/* 결재정보 페이지 */}
          {step === 3 && <motion.div
            key="step3"
            custom={step - prevStepRef.current}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            style={{
              width: '100%',
              height: '100%',
              padding: '42px 21px 0 21px',
            }}
          >
            <FlowHd
              approval={approval}
              onChangeTitle={(value) => {
                setEnabledStep3(!value);
              }}
            />
          </motion.div>}

          {/* ㅓ결과 페이지 */}
          {step === 4 && <motion.div
            key="step4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeIn' }}
            style={{
              position: 'fixed',
              width: '100%',
              height: '100vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: 'calc(150px + var(--ion-safe-area-bottom))',
              flexDirection: 'column'
            }}
          >
            <Result
              result={result}
              onAnimationFinished={(bool) => setTimeout(() => {
                setAnimationFinished(bool);
                animationRef.current = false;
              }, 1000)} />
          </motion.div>}
        </AnimatePresence>

        {/* 서치 헬프 모달 */}
        <SearchHelpModal />

        {/* DatePicker 모달 */}
        <DatePickerModal />

      </IonContent >
      <IonFooter style={{
        boxShadow: 'none',
      }}>
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: 'column',
            padding: "12px 21px",
            zIndex: '2',
            paddingTop: '32px',
            background:
              'linear-gradient(to top, var(--ion-background-color) 0%, var(--ion-background-color) calc(100% - 20px), transparent 100%)',
            paddingBottom:
              'calc(12px + max(var(--ion-safe-area-bottom), var(--keyboard-height)))',
            transform: 'translateZ(0)',
          }}
        >
          <AnimatePresence>
            {step === 3 &&
              <motion.div key="step3input" {...textAreaMotion} style={{ flex: 1 }}>
                <IonTextarea
                  mode="md"
                  style={{
                    marginBottom: "12px",
                    "--border-radius": "16px",
                  }}
                  rows={3}
                  value={approval?.LTEXT}
                  onInput={(e) => approval.LTEXT = (e.target as HTMLTextAreaElement).value}
                  labelPlacement="start"
                  fill="outline"
                  placeholder="결재 의견을 입력해 주세요."
                />
              </motion.div>
            }
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>

            {step !== 99 && step !== 4 && (
              <motion.div
                style={{ flex: 1 }}
                initial={shouldAnimateEdge ? { y: 82 + safeAreaBottom } : undefined}
                animate={shouldAnimateEdge ? { y: 0 } : undefined}
                // exit={shouldAnimateEdge ? { y: 82 + safeAreaBottom } : undefined}
                // exit={shouldAnimateEdge ? { y: 0 } : undefined}
                transition={{ duration: shouldAnimateEdge ? 0.25 : 0 }}
              >
                <IonButton
                  mode="md"
                  color="primary"
                  disabled={
                    step === 0 ? !approval?.FLOWHD_DOCITEM?.length :
                      step === 3 ? enabledStep3 :
                        false}
                  style={{
                    width: "100%",
                    height: "58px",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                  onClick={step === 3
                    ? async () => {
                      webviewHaptic('mediumImpact');
                      goStep(step + 1);
                      animationRef.current = true;
                      let result = await postStart(approval);
                      if (result instanceof Error) {
                        result = {
                          Type: 'E',
                          Message: '예상치 못한 오류가 발생했습니다.'
                        }
                      }
                      setResult(result);
                      if (result?.Type === 'S') successRef.current = true;
                    }
                    : () => {
                      webviewHaptic('mediumImpact');
                      let totalWRBTR = 0;
                      // let totalDMBTR = 0;
                      approval.FLOWHD_DOCITEM.forEach((item: any) => {
                        totalWRBTR += Number(item.WRBTR);
                        // totalDMBTR += Number(item.DMBTR);
                      });

                      approval.FLOWHD_DOCHD.SUM_WRBTR = totalWRBTR.toString();
                      approval.FLOWHD_DOCHD.SUM_DMBTR = totalWRBTR.toString();
                      goStep(step + 1);
                    }}
                >
                  {step === 3 ? '결재 상신' : '다음 단계'}
                </IonButton>
              </motion.div>
            )}

            {step === 99 && (
              <motion.div key="step99" {...buttonMotion} style={{ flex: 1 }}>
                <IonButton
                  mode="md"
                  color="primary"
                  disabled={!isSaveEnabled}
                  style={{
                    width: "100%",
                    height: "58px",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                  onClick={() => {
                    webviewHaptic('mediumImpact');
                    handleSaveItem(docItem);
                  }}
                >
                  입력 완료
                </IonButton>
              </motion.div>
            )}

            {step === 4 && animationFinished && (
              <motion.div
                key="step4"
                style={{ flex: 1 }}
                initial={{ y: 82 + safeAreaBottom }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}>
                <IonButton
                  mode="md"
                  color="primary"
                  style={{
                    width: "100%",
                    height: "58px",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                  onClick={result.Type === 'S'
                    ? () => {
                      webviewHaptic('mediumImpact');
                      isCloseButtonRef.current = true;
                      router.goBack();
                    }
                    : () => {
                      webviewHaptic('mediumImpact');
                      goStep(step - 1);
                      setResult(null);
                      setAnimationFinished(false);
                    }
                  }
                >
                  {result.Type === 'S' ? '닫기' : '이전 단계'}
                </IonButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </IonFooter>
    </IonPage >
  );
};

export default CreditCard;



//* ========== Step 0. 항목 ==========
interface ItemProps {
  cardList: any;
  onItemClick: (item: any) => void;
  onDeleteItem: (index: any) => void;
  // setScrollRef: any;
}

const Item: React.FC<ItemProps> = ({
  cardList,
  onItemClick,
  onDeleteItem,
  // setScrollRef
}) => {
  const themeMode = useAppStore(state => state.themeMode);

  return (
    // <div style={{ overflow: 'auto', height: '100%', padding: '12px 21px 0 21px' }} ref={setScrollRef}>
    <div style={{ overflow: 'auto', height: '100%', padding: '12px 21px 0 21px' }} >
      {cardList === null
        ?
        <div style={{
          paddingTop: '26px',
          marginBottom: '21px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
        }}>
          <div style={{ height: '130px' }}>
            <CachedImage src={creditcardGlassIcon} width={130} height={130}></CachedImage>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '24px 0'
          }}>
            <span style={{ fontSize: '18px', fontWeight: '500', marginBottom: '2px' }}>법인카드 사용 내역을</span>
            <span style={{ fontSize: '18px', fontWeight: '500' }}>조회해 보세요</span>
          </div>
        </div>
        :
        _.isEmpty(cardList)
          ?
          <NoData />
          :
          cardList.map((item: any, index: number) => {
            return <div
              className='ion-activatable'
              key={'card-list-item-' + item.Seq}
              onClick={() => onItemClick(item)}
              style={{
                marginBottom: '12px',
                boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px',
                borderRadius: '12px',
                width: '100%',
                padding: '21px',
                position: 'relative',
                border: themeMode === 'light' ? 'none' : '1px solid var(--custom-border-color-100)'
              }}>
              <span style={{
                display: 'flex',
                color: 'var(--ion-color-step-500)',
                fontSize: '13px',
                marginBottom: '15px',
                width: '100%',
                justifyContent: 'space-between'
              }}>No.{item.Seq}{Number(item.SubSeq) > 0 && `-${Number(item.SubSeq)}`}<span style={{
                display: 'inline',
                color: 'var(--ion-color-step-500)',
                fontSize: '13px',
              }}>{dayjs(item.Usedat).format('YYYY-MM-DD')}</span></span>
              <span style={{
                display: 'block',
                marginBottom: '4px',
                fontSize: '14px',
                fontWeight: '500'
              }}>{item.PUsage}</span>
              <span style={{
                fontSize: '17px',
                fontWeight: '700'
              }}>{Number(item.LocalAmt).toLocaleString("ko-KR")} <span style={{ fontSize: '16px', fontWeight: '700' }}>원</span></span>
              <span style={{
                height: '1px',
                backgroundColor: 'var(--custom-border-color-50)',
                margin: '12px 0',
                display: 'block'
              }}></span>
              <div className="custom-item-body-line" style={{ marginBottom: '4px' }}>
                <span>공급업체명</span>
                <span>{item.LifnrTx || '-'}</span>
              </div>
              <div className="custom-item-body-line" style={{ marginBottom: '4px' }}>
                <span>계정그룹명</span>
                <span>{item.Sgtxt || '-'}</span>
              </div>
              <div className="custom-item-body-line" style={{ marginBottom: '4px' }}>
                <span>사업장</span>
                <span>{item.Bupla || '-'}</span>
              </div>
              <div className="custom-item-body-line">
                <span>세금코드</span>
                <span>{item.Mwskz || '-'}</span>
              </div>
            </div>
          })
      }
    </div>
  );
};



//* ========== Step 99. 항목 추가 ==========
interface AddItemHandle {
  validate: () => any;
}

interface AddItemProps {
  approval?: any;
  docItem?: any;
  onSaveEnabledChange: (enabled: boolean) => void;
}

const AddItem = forwardRef<AddItemHandle, AddItemProps>(({
  approval,
  docItem,
  onSaveEnabledChange,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<FormRef>({});
  const attendeeFormRef = useRef<FormRef>({});
  const [, forceRender] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // 수익성 리프레시 키
  const [attendeeType, setAttendeeType] = useState('A'); // 참석자 구분
  const [errorList, setErrorList] = useState<any>(null); // 에러 목록
  const [extraFieldUse, setExtraFieldUse] = useState<any>(null);

  // 참석자, 수익성 사용여부 체크
  const checkExtraFieldUse = useCallback(async (clear = true) => {
    const cloneApproval = _.cloneDeep(approval);
    const cloneDocItem = _.cloneDeep(docItem);
    cloneDocItem.WRBTR = '0';
    cloneApproval.FLOWHD_DOCITEM = [cloneDocItem];
    cloneApproval.ACTIVITY = 'ENTER';
    cloneApproval.FIELD = 'ACCOUNT_CODE_T';
    cloneApproval.GUBUN = 'I';
    const res = await postExtraFieldUse(cloneApproval);

    if (clear) {
      if (!res.ATTENDEE_EDIT) {
        docItem.DOCITEM_ATTENDEELIST = [];
      }
      if (!res.PAOBJNR_EDIT) {
        docItem.RKE_KNDNR = '';
        docItem.RKE_KNDNR_T = '';
        docItem.RKE_VKORG = '';
        docItem.RKE_VKORG_T = '';
        docItem.RKE_VTWEG = '';
        docItem.RKE_VTWEG_T = '';
        docItem.RKE_SPART = '';
        docItem.RKE_SPART_T = '';
        docItem.RKE_WERKS = '';
        docItem.RKE_WERKS_T = '';
        docItem.RKE_ARTNR = '';
        docItem.RKE_ARTNR_T = '';
      }
    }

    setExtraFieldUse(res);
  }, []);

  // 참석자 추가 팝업 오픈
  const openAddAttendee = useCallback(() => {
    setErrorList(null);
    setAttendeeType('A');
    const cloneItem = {
      "FLOWCODE": "",
      "FLOWNO": "",
      "FLOWCNT": "",
      "KEY_NUM": "",
      "KEY_CNT": "",
      "GUBUN": "",
      "GUBUN_TX": "",
      "ATTENDEE": "",
      "LOGIN_ID": "",
      "ORGEH": "",
      "ORGTX": "",
      "PURPOSE": "",
      "BUKRS": "",
      "BELNR": "",
      "GJAHR": "",
      "SEQNR": "1",
      "ITEMNO": "1"
    }
    cloneItem.GUBUN = 'A';
    cloneItem.GUBUN_TX = '내부';
    attendeeFormRef.current = cloneItem;
  }, []);

  // 참석자 추가
  const handleAddAttendee = useCallback(() => {
    if (attendeeFormRef.current.GUBUN === 'A' && (!attendeeFormRef.current.ATTENDEE /*|| !attendeeFormRef.current.ORGTX*/)) {
      setErrorList({
        ATTENDEE: !attendeeFormRef.current.ATTENDEE,
        ORGTX: !attendeeFormRef.current.ORGTX,
        PURPOSE: false,
      });
      return false;
    } else if (attendeeFormRef.current.GUBUN === 'B' && (!attendeeFormRef.current.ATTENDEE || !attendeeFormRef.current.PURPOSE)) {
      setErrorList({
        ATTENDEE: !attendeeFormRef.current.ATTENDEE,
        ORGTX: false,
        PURPOSE: !attendeeFormRef.current.PURPOSE,
      });
      return false;
    }

    docItem.DOCITEM_ATTENDEELIST.push(attendeeFormRef.current);
    forceRender(prev => prev + 1);
    return true;
  }, [attendeeFormRef]);

  // 참석자 삭제
  const handleDeleteAttendee = useCallback((index: number) => {
    docItem.DOCITEM_ATTENDEELIST.splice(index, 1);
    forceRender(prev => prev + 1);
  }, [docItem]);

  const handleAttendeeInputChange = useCallback((values: Record<string, any>) => {
    attendeeFormRef.current = {
      ...attendeeFormRef.current,
      ...values
    }
  }, []);

  // docItem 변경 시 form 재할당
  useEffect(() => {
    if (docItem.ACCOUNT_CODE) {
      checkExtraFieldUse(false);
    } else {
      docItem.DOCITEM_ATTENDEELIST = [];
    }
    formRef.current = docItem || {};
    checkRequired();
    forceRender(prev => prev + 1);
  }, [docItem]);

  const checkRequired = useCallback(() => {
    if (formRef.current.ACCOUNT_CODE_T
      && formRef.current.WRBTR
      && formRef.current.SGTXT
      && (!extraFieldUse?.ATTENDEE_EDIT || !_.isEmpty(docItem.DOCITEM_ATTENDEELIST))) {
      onSaveEnabledChange(true);
    } else {
      onSaveEnabledChange(false);
    }
  }, []);

  const handleFocus = (e: any) => {
    document.querySelectorAll('.has-focus').forEach((el) => {
      el.classList.remove('has-focus');
    });

    const container = containerRef.current;
    const el = e.target;
    if (!container || !el) return;

    setTimeout(() => {
      const offset = 60; // 위에서 50px 밑으로
      const containerTop = container.getBoundingClientRect().top;
      const elTop = e.target.getBoundingClientRect().top;
      const scrollTop = container.scrollTop + (elTop - containerTop) - offset;
      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }, 150)
  };

  // 유효성 체크
  useImperativeHandle(ref, () => ({
    validate() {
      if (extraFieldUse?.ATTENDEE_EDIT && _.isEmpty(docItem.DOCITEM_ATTENDEELIST)) return {
        result: false,
        message: '참석자를 추가해주세요.'
      };
      return {
        result: true,
        message: ''
      };
    }
  }));

  const variants = {
    enter: { y: "5%", opacity: 0.5 },   // 화면 밑에서 시작
    center: { y: 0, opacity: 1 },       // 원래 위치
    exit: { y: "5%", opacity: 0.5 }     // 다시 밑으로
  };

  return (
    <motion.div
      key={docItem + 'item'}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.2 }}
      style={{ height: '100%' }}
    >
      <div
        ref={containerRef}
        style={{
          height: '100%',
          overflow: 'auto',
          overflowX: 'hidden',
          padding: '12px 0px calc(102px + max(var(--ion-safe-area-bottom))) 0px'
          // padding: '12px 21px calc(102px + max(var(--ion-safe-area-bottom), var(--keyboard-height))) 21px'
        }}>
        <div style={{ padding: '0 21px' }}>
          <CustomInput
            formRef={formRef}
            valueTemplate="$ACCOUNT_CODE_T"
            helperTextTemplate="GL계정 : $SAKNR | GL계정명 : $SAKNR_T"
            label="계정그룹명"
            required
            onFocus={handleFocus}
            onValueHelp={() => getSearchHelp('ACCOUNT_CODE_T', 'IA103')}
            onChange={(value) => {
              formRef.current.ACCOUNT_CODE_T = value;
              if (!value) {
                formRef.current.ACCOUNT_CODE = '';
                formRef.current.SAKNR = '';
                formRef.current.SAKNR_T = '';
              }
              checkRequired();
            }}
            onChangeValueHelp={(value) => {
              formRef.current.ACCOUNT_CODE = value.Key;
              formRef.current.ACCOUNT_CODE_T = value.Name;
              formRef.current.SAKNR = value.Add1;
              formRef.current.SAKNR_T = value.KeyName;
              checkRequired();
              checkExtraFieldUse();
            }}
            readOnly
            clearInput
            style={{ marginBottom: '28px' }}
          />
          <CustomInput
            formRef={formRef}
            valueTemplate="$KOSTL"
            helperTextTemplate="코스트센터명 : $KOSTL_T"
            label="코스트센터"
            onFocus={handleFocus}
            onValueHelp={() => getSearchHelp('KOSTL', 'IA103')}
            onChange={(value) => {
              formRef.current.KOSTL = value;
              if (!value) {
                formRef.current.KOSTL_T = '';
              }
            }}
            onChangeValueHelp={(value) => {
              formRef.current.KOSTL = value.Key;
              formRef.current.KOSTL_T = value.Name;
            }}
            style={{ marginBottom: '28px' }}
            clearInput
          />
          <CustomInput
            formRef={formRef}
            valueTemplate="$AUFNR"
            helperTextTemplate="오더명 : $AUFNR_T"
            label="오더번호"
            onFocus={handleFocus}
            onValueHelp={() => getSearchHelp('AUFNR', 'IA103')}
            onChange={(value) => {
              formRef.current.AUFNR = value;
              if (!value) {
                formRef.current.AUFNR_T = '';
              }
            }}
            onChangeValueHelp={(value) => {
              formRef.current.AUFNR = value.Key;
              formRef.current.AUFNR_T = value.Name;
            }}
            style={{ marginBottom: '28px' }}
            clearInput
          />
          <CustomInput
            formRef={formRef}
            valueTemplate="$PROJK"
            helperTextTemplate="WBS요소명 : $PROJK_T"
            label="WBS요소"
            onFocus={handleFocus}
            onValueHelp={() => getSearchHelp('PROJK', 'IA103')}
            onChange={(value) => {
              formRef.current.PROJK = value;
              if (!value) {
                formRef.current.PROJK_T = '';
              }
            }}
            onChangeValueHelp={(value) => {
              formRef.current.PROJK = value.Key;
              formRef.current.PROJK_T = value.Name;
            }}
            style={{ marginBottom: '28px' }}
            clearInput
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CustomInput
              currency
              formRef={formRef}
              valueTemplate="$WRBTR"
              label="전표통화금액"
              required
              formatter={(value) => {
                if (!value) return "";
                const raw = value
                  .replace(/[^0-9\-]/g, "") // 숫자와 - 만 허용
                  .replace(/(?!^)-/g, "");  // -는 맨 앞만 허용

                if (raw === "" || raw === "-") return raw;

                try {
                  // Number 대신 BigInt를 사용하여 정밀도 유지
                  return BigInt(raw).toLocaleString("ko-KR");
                } catch (e) {
                  // 숫자가 너무 커서 BigInt 변환도 실패하는 경우 등에 대한 예외 처리
                  return raw;
                }
              }}
              onFocus={handleFocus}
              onChange={(value) => {
                formRef.current.WRBTR = value.replace(/[^0-9.-]/g, '');
                checkRequired();
              }}
              style={{ marginBottom: '28px', textAlign: 'right' }}
              inputMode='numeric'
            />
            <span style={{ paddingBottom: '10px', color: 'var(--ion-color-step-600)' }}>{docItem?.WAERS}</span>
          </div>

          <CustomInput
            formRef={formRef}
            valueTemplate="$SGTXT"
            label="항목텍스트"
            required
            onFocus={handleFocus}
            onChange={(value) => {
              formRef.current.SGTXT = value;
              checkRequired();
            }}
            style={{ marginBottom: '28px' }}
            clearInput
          />
          <CustomInput
            formRef={formRef}
            valueTemplate="$ZUONR"
            label="지정"
            onFocus={handleFocus}
            onChange={(value) => {
              formRef.current.ZUONR = value;
            }}
            style={{ marginBottom: '28px' }}
            clearInput
          />
          <CustomInput
            formRef={formRef}
            valueTemplate="$VALUT"
            label="기준일자"
            readOnly
            date
            formatter={(value) => {
              return dayjs(value).format('YYYY-MM-DD');
            }}
            onFocus={handleFocus}
            onChange={(value) => {
              formRef.current.VALUT = value;
            }}
            style={{ marginBottom: '28px' }}
          />
          <CustomInput
            formRef={formRef}
            valueTemplate="$ZFBDT"
            label="만기계산일"
            readOnly
            date
            formatter={(value) => {
              return dayjs(value).format('YYYY-MM-DD');
            }}
            onFocus={handleFocus}
            onChange={(value) => {
              formRef.current.ZFBDT = value;
            }}
            style={{ marginBottom: '28px' }}
          />
        </div>
        <IonButton id='attendee-dialog-trigger' style={{ display: 'none' }} onClick={openAddAttendee} />

        {docItem.ACCOUNT_CODE && extraFieldUse === null && <div>
          <LoadingIndicator style={{ margin: '0 auto', marginTop: '50px', marginBottom: '50px' }} />
        </div>}

        {/* 참석자 */}
        {extraFieldUse?.ATTENDEE_EDIT &&
          <div style={{
            borderTop: '21px solid var(--custom-border-color-50)',
          }}>
            <div style={{
              padding: '32px 21px',
              position: 'relative'
            }}>
              <span style={{ fontSize: '16px', fontWeight: '500', display: 'block', marginBottom: '36px' }}>참석자 <span style={{ color: 'var(--red)' }}> (필수)</span></span>
              <IonButton mode='md' fill='solid' style={{ top: 24, right: 16, position: 'absolute' }} onClick={() => {
                document.getElementById("attendee-dialog-trigger")?.click();
              }}>
                <IonIcon src={add} />추가
              </IonButton>
              {_.isEmpty(docItem.DOCITEM_ATTENDEELIST)
                ? <span style={{ color: 'var(--ion-color-secondary)' }}>참석자를 추가해주세요.</span>
                : docItem.DOCITEM_ATTENDEELIST.map((attendee: any, index: number) => <div key={`attendee${index}`}>
                  <div
                    style={{
                      display: "flex",
                      gap: "4px",
                      marginBottom: index === docItem.DOCITEM_ATTENDEELIST.length - 1 ? "" : "32px",
                      alignItems: "center",
                      justifyContent: "space-between"
                    }}
                  >
                    <div>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "6px",
                          backgroundColor:
                            attendee.GUBUN === "A"
                              ? "#ecd7ffff"
                              : "#d2f3ffff",
                          color: "var(--ion-color-warning-contrast)",
                          fontSize: "12px",
                        }}
                      >
                        {attendee.GUBUN === "A" ? "내부" : "외부"}
                      </span>
                      <span style={{ fontSize: "14px", fontWeight: "500", marginLeft: '12px' }}>
                        {attendee.ATTENDEE} ({attendee.ORGTX || '-'})
                      </span>
                      <span style={{ color: "var(--ion-color-secondary)", fontSize: '14px', marginLeft: '12px' }}>
                        {attendee.PURPOSE || "-"}
                      </span>
                    </div>
                    <IonButton mode='md' fill='clear' color={'medium'} style={{ position: 'absolute', right: 8 }} onClick={() => handleDeleteAttendee(index)}>
                      삭제
                    </IonButton>
                  </div>
                </div>
                )}
            </div>
          </div>
        }

        <CustomDialog
          trigger="attendee-dialog-trigger"
          dialogStyle={{
            width: '100%'
          }}
          onDidDismiss={() => {
          }}
          title="참석자 추가"
          body={
            <div style={{ padding: '0 8px 8px 8px' }}>
              <IonSelect
                label='구분'
                interface="popover"
                mode='ios'
                style={{ marginBottom: '12px', height: 49 }}
                value={attendeeType}
                onIonChange={(e) => {
                  setErrorList(null);
                  handleAttendeeInputChange({
                    'ATTENDEE': '',
                    'ORGTX': '',
                    'PURPOSE': '',
                    'GUBUN': e.target.value,
                    'GUBUN_TX': e.target.value === 'A' ? '내부' : '외부'
                  });
                  setAttendeeType(e.target.value);
                }}>
                <IonSelectOption value="A">내부</IonSelectOption>
                <IonSelectOption value="B">외부</IonSelectOption>
              </IonSelect>
              <CustomInput
                formRef={attendeeFormRef}
                valueTemplate='$ATTENDEE'
                error={errorList?.ATTENDEE}
                errorText='참석자를 입력하세요.'
                label={'이름'}
                labelPlacement='fixed'
                style={{ marginBottom: '12px', height: 49 }}
                onChange={(value) => handleAttendeeInputChange({ 'ATTENDEE': value })} />
              <CustomInput
                formRef={attendeeFormRef}
                valueTemplate='$ORGTX'
                error={errorList?.ORGTX}
                label={'조직'}
                labelPlacement='fixed'
                disabled={attendeeType === 'A'}
                style={{ marginBottom: '12px', height: 49 }}
                onChange={(value) => handleAttendeeInputChange({ 'ORGTX': value })} />
              <CustomInput
                formRef={attendeeFormRef}
                valueTemplate='$PURPOSE'
                error={errorList?.PURPOSE}
                errorText='접대 목적을 입력하세요.'
                disabled={attendeeType === 'A'}
                label={'목적'}
                labelPlacement='fixed'
                style={{ marginBottom: '12px', height: 49 }}
                onChange={(value) => handleAttendeeInputChange({ 'PURPOSE': value })} />
            </div>
          }
          onSecondButtonClick={handleAddAttendee}
          firstButtonText="닫기"
          secondButtonText='추가'
        />

        {/* 수익성 */}
        {extraFieldUse?.PAOBJNR_EDIT && <div style={{
          borderTop: '21px solid var(--custom-border-color-50)',
        }}>
          <div style={{
            padding: '32px 21px',
          }}>
            <span style={{ fontSize: '16px', fontWeight: '500', display: 'block', marginBottom: '24px' }}>수익성 세그먼트</span>
            <CustomInput
              formRef={formRef}
              valueTemplate="$RKE_KNDNR"
              helperTextTemplate='$RKE_KNDNR_T'
              label="고객"
              // labelPlacement='fixed'
              onFocus={handleFocus}
              onValueHelp={() => getSearchHelp('KUNNR', 'IA103')}
              onChange={(value) => {
                formRef.current.RKE_KNDNR = value;
                if (!value) {
                  formRef.current.RKE_KNDNR_T = '';
                }
              }}
              onChangeValueHelp={(value) => {
                formRef.current.RKE_KNDNR = value.Key;
                formRef.current.RKE_KNDNR_T = value.Name;
              }}
              style={{ marginBottom: '28px' }}
              clearInput
            />
            <CustomInput
              formRef={formRef}
              valueTemplate="$RKE_VKORG"
              helperTextTemplate='$RKE_VKORG_T'
              label="영업조직"
              // labelPlacement='fixed'
              onFocus={handleFocus}
              onValueHelp={() => getSearchHelp('VKORG', 'IA103')}
              onChange={(value) => {
                formRef.current.RKE_VKORG = value;
                if (!value) {
                  formRef.current.RKE_VKORG_T = '';
                  formRef.current.RKE_VTWEG = '';
                  formRef.current.RKE_VTWEG_T = '';
                  formRef.current.RKE_SPART = '';
                  formRef.current.RKE_SPART_T = '';
                  setRefreshKey(prev => prev + 1);
                }
              }}
              onChangeValueHelp={(value) => {
                formRef.current.RKE_VKORG = value.Key;
                formRef.current.RKE_VKORG_T = value.Name;
                formRef.current.RKE_VTWEG = value.Add1;
                formRef.current.RKE_VTWEG_T = value.Add2;
                formRef.current.RKE_SPART = value.Add3;
                formRef.current.RKE_SPART_T = value.Add4;
                setRefreshKey(prev => prev + 1);
              }}
              style={{ marginBottom: '28px' }}
              clearInput
            />
            <CustomInput
              formRef={formRef}
              key={`vt-${refreshKey}`}
              valueTemplate="$RKE_VTWEG"
              helperTextTemplate='$RKE_VTWEG_T'
              label="유통경로"
              disabled
              style={{ marginBottom: '28px' }}
            />
            <CustomInput
              formRef={formRef}
              key={`sp-${refreshKey}`}
              valueTemplate="$RKE_SPART"
              helperTextTemplate='$RKE_SPART_T'
              label="제품군"
              disabled
              style={{ marginBottom: '28px' }}
            />
            <CustomInput
              formRef={formRef}
              valueTemplate="$RKE_WERKS"
              helperTextTemplate='$RKE_WERKS_T'
              label="플랜트"
              onFocus={handleFocus}
              onValueHelp={() => getSearchHelp('WERKS', 'IA103')}
              onChange={(value) => {
                formRef.current.RKE_WERKS = value;
                if (!value) {
                  formRef.current.RKE_WERKS_T = '';
                }
              }}
              onChangeValueHelp={(value) => {
                formRef.current.RKE_WERKS = value.Key;
                formRef.current.RKE_WERKS_T = value.Name;
              }}
              style={{ marginBottom: '28px' }}
              clearInput
            />
            <CustomInput
              formRef={formRef}
              valueTemplate="$RKE_ARTNR"
              helperTextTemplate='$RKE_ARTNR_T'
              label="자재"
              onFocus={handleFocus}
              clearInput
              beforeOpenValueHelp={() => {
                if (!formRef.current.RKE_WERKS) {
                  new Notify({
                    status: 'error',
                    title: '플랜트를 입력하세요.',
                    position: 'x-center bottom',
                    autotimeout: 2000
                  });
                  return false;
                }
                return true;
              }}
              onValueHelp={() => getSearchHelp('ARTNR', 'IA103', formRef.current.RKE_WERKS)}
              onChange={(value) => {
                formRef.current.RKE_ARTNR = value;
                if (!value) {
                  formRef.current.RKE_ARTNR_T = '';
                }
              }}
              onChangeValueHelp={(value) => {
                formRef.current.RKE_ARTNR = value.Key;
                formRef.current.RKE_ARTNR_T = value.Name;
              }}
            />
          </div>
        </div>
        }
      </div>
    </motion.div>
  );
});



//* ========== Step 1. 전표 헤더 ==========
interface HeaderProps {
  docHeader?: any;
  onSave?: (item: any) => void;
}

const Header: React.FC<HeaderProps> = ({
  docHeader,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<FormRef>({});
  const [, forceRender] = useState(0);

  // docItem 변경 시 form 재할당
  useEffect(() => {
    formRef.current = docHeader || {};
    forceRender(prev => prev + 1);
  }, [docHeader]);

  const handleFocus = (e: any) => {
    document.querySelectorAll('.has-focus').forEach((el) => {
      el.classList.remove('has-focus');
    });

    const container = containerRef.current;
    const el = e.target;
    if (!container || !el) return;

    setTimeout(() => {
      const offset = 60; // 위에서 50px 밑으로
      const containerTop = container.getBoundingClientRect().top;
      const elTop = e.target.getBoundingClientRect().top;
      const scrollTop = container.scrollTop + (elTop - containerTop) - offset;
      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }, 150)
  };

  return (
    <>
      <div
        className='personal-expense-header'
        ref={containerRef}
        style={{
          height: '100%',
          overflow: 'auto',
          overflowX: 'hidden',
          padding: '12px 21px calc(102px + max(var(--ion-safe-area-bottom), var(--keyboard-height))) 21px'
        }}>
        <CustomInput
          disabled
          formRef={formRef}
          valueTemplate="$BUKRS_T($BUKRS)"
          label="회사코드"
          labelPlacement='fixed'
          style={{ marginBottom: '28px' }}
        />
        <CustomInput
          disabled
          formRef={formRef}
          valueTemplate="$BLART_T($BLART)"
          label="전표유형"
          labelPlacement='fixed'
          style={{ marginBottom: '28px' }}
        />
        <CustomInput
          disabled
          formRef={formRef}
          valueTemplate="$CREATOR_LOGIN_ID | $CREATOR_NAME | $CREATOR_ORGTX"
          label="생성인"
          labelPlacement='fixed'
          style={{ marginBottom: '28px' }}
        />
        <CustomInput
          required
          formRef={formRef}
          valueTemplate="$BLDAT"
          label="증빙일자"
          labelPlacement='fixed'
          readOnly
          date
          datePickerFixed={false}
          formatter={(value) => {
            return dayjs(value).format('YYYY-MM-DD');
          }}
          onFocus={handleFocus}
          onChange={(value) => {
            formRef.current.BLDAT = value;
          }}
          style={{ marginBottom: '28px' }}
        />
        <CustomInput
          required
          disabled
          formRef={formRef}
          valueTemplate="$BUDAT"
          label="전기일자"
          labelPlacement='fixed'
          formatter={(value) => {
            return dayjs(value).format('YYYY-MM-DD');
          }}
          style={{ marginBottom: '28px' }}
        />
        <CustomInput
          required
          disabled
          formRef={formRef}
          valueTemplate="$WAERS"
          label="전표통화"
          labelPlacement='fixed'
          style={{ marginBottom: '28px' }}
        />
        <CustomInput
          disabled
          formRef={formRef}
          valueTemplate="$SUM_WRBTR"
          label="전표통화 계"
          labelPlacement='fixed'
          formatter={(value) => {
            if (!value) return "";
            const raw = value
              .replace(/[^0-9\-]/g, "") // 숫자, - 만 허용
              .replace(/(?!^)-/g, "");  // - 는 맨 앞만

            if (raw === "" || raw === "-") return raw;

            return Number(raw).toLocaleString("ko-KR") + ' KRW';
          }}
          style={{ marginBottom: '28px' }}
        />
      </div>
    </>
  );
};



//* ========== Step 2. 첨부 파일 ==========
interface AttachProps {
  approval: any;
  fileNo: RefObject<number>;
}

const Attach: React.FC<AttachProps> = ({
  approval,
  fileNo
}) => {
  const [files, setFiles] = useState(approval.FILES ?? []);
  const [isLoading, setIsLoading] = useState<string[]>([]);
  const fileTypeRef = useRef('');

  useEffect(() => {
    if (!approval.FILES) {
      approval.FILES = [];
    } else {
      setFiles(approval.FILES);
    }
  }, []);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleButtonClick = (fileType: string) => {
    fileTypeRef.current = fileType;
    fileInputRef.current?.click();
  };

  const handleDeleteAttach = (fileNo: string) => {
    const index = approval.FILES.findIndex(
      (file: any) => file.FILE_NO === fileNo
    );

    let removedFiles: any[] = [];

    if (index !== -1) {
      removedFiles = approval.FILES.splice(index, 1);
    }

    const removedFile = removedFiles[0];

    deleteAttach(approval.GUID, removedFile.FILE_NO, removedFile.FILE_TYPE);
    setFiles(approval.FILES);
    new Notify({
      status: 'error',
      title: '삭제되었습니다.',
      position: 'x-center bottom',
      autotimeout: 2000
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const payloads = [];
    setIsLoading([...isLoading, fileTypeRef.current]);

    if (files) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const FILE_NO = String(fileNo.current).padStart(5, '0');

        const fileObject = {
          ATTACH_ERDAT: dayjs().format('YYYY.MM.DD'),
          ATTACH_NAME: approval.FLOWHD_DOCHD.CREATOR_NAME,
          FILE_DESCRIPTION: file.name,
          FILE_EXTENTION: file.name.split('.').pop(),
          FILE_LEN: file.size,
          FILE_NAME: file.name,
          FILE_NO: FILE_NO,
          FILE_TYPE: fileTypeRef.current
        };

        const formData = new FormData();
        formData.append('Content-type', file.type);
        formData.append('file', file);
        formData.append('slug', encodeURIComponent(file.name));
        formData.append('fileno', FILE_NO);
        formData.append('filetype', fileTypeRef.current);
        formData.append('loginid', approval.LOGIN_ID);
        formData.append('guid', approval.GUID);

        approval.FILES.push(fileObject);
        payloads.push(formData);
        fileNo.current += 1;
      }

      await Promise.all(payloads.map(payload => postAttach(payload)));
      const nextFiles = [...approval.FILES];
      setFiles(nextFiles);
      setIsLoading(isLoading.filter((load: string) => load != fileTypeRef.current));

      new Notify({
        status: 'success',
        title: '업로드되었습니다.',
        position: 'x-center bottom',
        autotimeout: 2000,
      });
    }
  };

  return (
    <>
      {
        approval.FLOWHD_ATTACH.map((attach: any, index: number) => <div
          key={'attach' + index}
          style={{
            border: '1px solid var(--custom-border-color-100)',
            marginBottom: '21px',
            borderRadius: '12px'
          }}>
          <div style={{ padding: '21px 12px 21px 21px' }}>
            <span style={{ fontSize: '16px', fontWeight: '500' }}>{attach.FILE_TYPE_TEXT}</span>
            {
              files.filter((file: any) => file.FILE_TYPE === attach.FILE_TYPE).map((file: any, index: number) => <div
                key={'attach-file' + index}
                style={{
                  paddingTop: '21px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                <CachedImage src={getFileTypeIcon(file.FILE_EXTENTION).image} width={28} height={28}></CachedImage>
                <span
                  style={{
                    flex: 1,
                    marginLeft: '12px',
                    fontSize: '14px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {file.FILE_DESCRIPTION}
                </span>
                <IonButton
                  mode='md'
                  fill='clear'
                  color='danger'
                  style={{ fontSize: '14px' }}
                  onClick={() => handleDeleteAttach(file.FILE_NO)}>
                  삭제
                </IonButton>
              </div>
              )
            }
          </div>
          <IonButton
            className='upload-button'
            type='button'
            mode='md'
            onClick={() => handleButtonClick(attach.FILE_TYPE)}
            disabled={isLoading.includes(attach.FILE_TYPE)}
            // disabled={true}
            style={{
              width: '100%',
              height: '58px',
              '--background': 'transparent',
              '--color': 'var(--ion-color-step-900)',
              borderRadius: '0px',
              borderTop: '1px solid var(--custom-border-color-50)',
              fontSize: '16px',
            }}>
            {<IonIcon src={addOutline} style={{ marginRight: '2px' }} />}<span>파일 업로드</span>
            {isLoading.includes(attach.FILE_TYPE) && <LoadingIndicator style={{ width: '24px', position: 'absolute' }} />}
          </IonButton>
        </div>)
      }
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }} // 숨김
        multiple // 여러 파일 선택 가능
        accept="*/*"
        onChange={handleFileChange}
      />
    </>
  );
};



//* ========== Step 3. 결재 정보 ==========
interface FlowHdProps {
  approval: any;
  onChangeTitle: (value: string) => void;
}

const FlowHd: React.FC<FlowHdProps> = ({
  approval,
  onChangeTitle,
}) => {
  const formRef = useRef<FormRef>({});
  const [, forceRender] = useState(0);
  let titleRef = useRef<HTMLIonInputElement>(null);

  useEffect(() => {
    formRef.current = approval || {};
    forceRender(prev => prev + 1);
    // 화면 진입 시
    // if (!formRef.current?.TITLE) {
    //   setTimeout(() => {
    //     titleRef.current?.setFocus();
    //   }, 10);
    // }
  }, [approval]);

  return (
    <>
      <span style={{ fontSize: '18px', fontWeight: '500' }}>결재 제목을 입력해 주세요.</span>
      <CustomInput
        ref={(ref: any) => titleRef = ref}
        label={''}
        formRef={formRef}
        style={{ height: '48px', minHeight: '48px', marginTop: '8px', marginBottom: '48px' }}
        placeholder='결재 제목 (필수)'
        valueTemplate='$TITLE'
        clearInput
        onChange={(value) => {
          formRef.current.TITLE = value;
          onChangeTitle(value);
        }}
      />
      <span style={{ fontSize: '18px', fontWeight: '500' }}>결재선</span>
      <div style={{ marginTop: '24px', marginBottom: '42px' }}>
        {
          approval?.FLOWHD_APPRLINE.map((apprLine: any, index: number) => <div
            key={'apprline' + index}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', width: '52px' }}>
                <span
                  style={{
                    fontSize: "12px",
                    backgroundColor: '#0abbecd6',
                    padding: "1px 8px",
                    borderRadius: "4px",
                    fontWeight: "500",
                    color: '#fff',
                  }}
                >
                  {apprLine.APPR_CNT} {apprLine.WFIT_TYPE_TEXT}
                </span>
              </div>
              <div style={{
                display: 'flex',
                flexDirection: 'column'
              }}>
                <span style={{
                  fontSize: '14px'
                }}>{apprLine.NAME + ' '}
                  <span
                    style={{ color: 'var(--ion-color-secondary)' }}>
                    ({apprLine.ORGTX} {apprLine.POSITION_NAME})
                  </span>
                </span>
                <span></span>
              </div>
            </div>
            <span
              style={{
                fontSize: "12px",
                backgroundColor: "var(--custom-border-color-50)",
                border: "1px solid var(--custom-border-color-100)",
                padding: "1px 8px",
                borderRadius: "8px",
                fontWeight: "400",
              }}
            >
              {apprLine.WFIT_SUB_TEXT}
            </span>
          </div>
          )
        }
      </div>
    </>
  );
};

//* ========== Step 4. 결과 ==========
interface ResultProps {
  result: any;
  onAnimationFinished: (bool: boolean) => void;
}

const Result: React.FC<ResultProps> = ({
  result,
  onAnimationFinished
}) => {
  const [res, setRes] = useState<any | null>(null);
  const [textAnimation, setTextAnimation] = useState<boolean>(false);
  const [translate, setTranslate] = useState<number>(0);

  useEffect(() => {
    if (!result) return;
    setRes(result);
  }, [result]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        transform: `translateY(${translate}px)`,
        transition: 'transform 0.3s ease-out',
        position: 'relative'
      }}
    >
      <AnimatedIcon
        status={res?.Type}
        onAnimationComplete={() => {
          webviewHaptic("mediumImpact");
          onAnimationFinished?.(true);
          setTextAnimation(true);
          setTimeout(() => setTranslate(-82), 1000);
        }}
      />

      <span style={{ fontSize: '19px', fontWeight: '600' }}>
        {'임직원개인경비 상신을'}
      </span>

      <span style={{ fontSize: '19px', fontWeight: '600' }}>
        <FlipWords
          style={{
            color:
              textAnimation && res
                ? res?.Type === 'E'
                  ? 'var(--red)'
                  : 'var(--ion-color-primary)'
                : 'inherit'
          }}
          animation={textAnimation}
          words={[
            textAnimation && res
              ? res?.Type === 'E'
                ? '실패'
                : '성공'
              : '진행'
          ]}
        />
        {" "}
        <span>{textAnimation && res ? '했어요' : '할게요'}</span>
      </span>

      <AnimatePresence>
        {translate !== 0 && res && (
          <motion.div
            layout
            initial={{ opacity: 0, }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: "tween", duration: 1 }}
            style={{
              position: 'absolute',
              translateY: '146px',
              padding: '12px 21px',
              width: '90%',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                content: '""',
                width: '100%',
                left: 0,
                right: 0,
                bottom: 0,
                height: '2px', // 최대 border 두께
                background: `linear-gradient(to right, transparent,
                 ${res?.Type === 'E' ? '#af53f641' : '#00bc5b41'} 25%,
                 ${res?.Type === 'E' ? 'var(--red)' : 'var(--ion-color-primary)'} 50%,
                 ${res?.Type === 'E' ? '#af53f641' : '#00bc5b41'} 75%,
                  transparent)`,
                pointerEvents: 'none',
                marginBottom: '12px'
              }}
            />
            <span style={{ fontSize: '14px', fontWeight: '500' }}>{res?.Message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
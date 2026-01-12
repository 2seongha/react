import React, { RefObject, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  useIonRouter,
  useIonViewWillEnter,
} from '@ionic/react';
import AppBar from '../components/AppBar';
import "./PersonalExpense.css";
import { add, addOutline, mailUnreadSharp, person, removeOutline } from 'ionicons/icons';
import CachedImage from '../components/CachedImage';
import { banknotesGlassIcon } from '../assets/images';
import SearchHelpModal from '../components/SearchHelpModal';
import { deleteAttach, getSearchHelp, getStart, postAttach, postExtraFieldUse, postStart } from '../stores/service';
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

const PersonalExpense: React.FC = () => {
  const router = useIonRouter();
  //* 전체
  const [step, setStep] = useState(0);
  const [enabledStep3, setEnabledStep3] = useState(true);
  const [approval, setApproval] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [animationFinished, setAnimationFinished] = useState<any>(null); // 결과 애니메이션 종료
  const ignorePopRef = useRef(false);
  const interactPopRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(0);
  const currStepRef = useRef(0);
  const animationRef = useRef(false); // 애니메이션 중 뒤로가기 막음
  const isCloseButtonRef = useRef(false); // 닫기 버튼을 누른건지 판별용
  const successRef = useRef(false); // 성공시 뒤로가기하면 홈으로
  const fileNoRef = useRef(0); // 첨부 파일 넘버는 상태 유지
  const shouldAnimateEdge = (step === 0) || (prevStepRef.current === 99 && step === 0);
  const title = useMemo(() => {
    let title;
    switch (step) {
      case 0:
        title = '임직원 개인경비';
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

  const setScrollRef = (node: HTMLDivElement) => {
    if (node) {
      scrollRef.current = node;
      requestAnimationFrame(() => {
        node.scrollTop = node.scrollHeight;
      });
    }
  }

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

  useIonViewWillEnter(() => {
    const initApproval = async () => {
      const approval = await getStart('IA103');
      if (approval instanceof Error) {
        webviewToast('예상치 못한 오류가 발생했습니다. 잠시 후 시도해주세요.');
        return router.goBack(); //TODO 임시 주석
      }
      oriItem.current = approval.FLOWHD_DOCITEM[0];
      approval.FLOWHD_DOCITEM = [];
      setApproval(approval);
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
        attendee.KEY_CNT = idx + 1;
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

    goStep(0);

    new Notify({
      title: isEdit ? '수정되었습니다.' : '추가되었습니다.',
      position: 'x-center bottom',
      autotimeout: 2000,
    });
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
              setScrollRef={setScrollRef}
              docItems={approval?.FLOWHD_DOCITEM}
              onAddItem={handleAddItem}
              onDeleteItem={handleDeleteItem}
              onItemClick={(item) => {
                const cloneItem = _.cloneDeep<any>(item);
                setDocItem(cloneItem);
                setIsSaveEnabled(true);
                goStep(99);
              }} />
          </motion.div>}

          {/* 항목 추가 페이지 */}
          {step === 99 && <AddItem
            approval={approval}
            docItem={docItem}
            onSaveEnabledChange={enabled => {
              // if (isSaveEnabled !== enabled) {
              setIsSaveEnabled(enabled);
              // }
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

export default PersonalExpense;



//* ========== Step 0. 항목 ==========
interface ItemProps {
  docItems: any;
  onItemClick: (item: any) => void;
  onDeleteItem: (index: any) => void;
  onAddItem: () => void;
  setScrollRef: any;
}

const Item: React.FC<ItemProps> = ({
  docItems,
  onItemClick,
  onDeleteItem,
  onAddItem,
  setScrollRef
}) => {
  const themeMode = useAppStore(state => state.themeMode);

  return (
    <div style={{ overflow: 'auto', height: '100%', padding: '12px 21px 0 21px' }} ref={setScrollRef}>
      {docItems?.length > 0
        ?
        docItems.map((item: any, index: number) => {
          return <div
            className='ion-activatable'
            key={'doc-item-' + item.CNT}
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
            <IonButton
              mode='md'
              color='danger'
              fill='clear'
              style={{ position: 'absolute', right: 8, top: 14, '--ripple-color': 'transparent' }}
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem(index);
              }}>삭제</IonButton>
            <span style={{
              display: 'block',
              color: 'var(--ion-color-step-500)',
              fontSize: '13px',
              marginBottom: '15px'
            }}>{dayjs(item.VALUT).format('YYYY-MM-DD')}</span>
            <span style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '14px',
              fontWeight: '600'
            }}>{item.ACCOUNT_CODE_T}</span>
            <span style={{
              fontSize: '17px',
              fontWeight: '700'
            }}>{Number(item.WRBTR).toLocaleString("ko-KR")} <span style={{ fontSize: '16px', fontWeight: '700' }}>원</span></span>
            <span style={{
              height: '1px',
              backgroundColor: 'var(--custom-border-color-50)',
              margin: '12px 0',
              display: 'block'
            }}></span>
            <div className="custom-item-body-line" style={{ marginBottom: '4px' }}>
              <span>GL계정</span>
              <span>{item.SAKNR || '-'}</span>
            </div>
            <div className="custom-item-body-line" style={{ marginBottom: '4px' }}>
              <span>GL계정명</span>
              <span>{item.SAKNR_T || '-'}</span>
            </div>
            <div className="custom-item-body-line" style={{ marginBottom: '4px' }}>
              <span>코스트센터</span>
              <span>{item.KOSTL || '-'}</span>
            </div>
            <div className="custom-item-body-line" style={{ marginBottom: '4px' }}>
              <span>코스트센터명</span>
              <span>{item.KOSTL_T || '-'}</span>
            </div>
            <div className="custom-item-body-line">
              <span>항목텍스트</span>
              <span>{item.SGTXT || '-'}</span>
            </div>
          </div>
        })
        :
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
            <CachedImage src={banknotesGlassIcon} width={130} height={130}></CachedImage>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '24px 0'
          }}>
            <span style={{ fontSize: '18px', fontWeight: '500', marginBottom: '2px' }}>임직원 개인경비 상신을 위해</span>
            <span style={{ fontSize: '18px', fontWeight: '500' }}>항목을 추가해주세요</span>
          </div>
        </div>
      }
      <IonButton
        type='button'
        mode='md'
        onClick={onAddItem}
        style={{
          width: '100%',
          height: '58px',
          '--background': 'transparent',
          '--color': 'var(--ion-color-step-900)',
          borderRadius: '17px',
          border: '1px dashed var(--custom-border-color-100)',
          fontSize: '16px',
          marginBottom: '20px'
        }}>
        {<IonIcon src={addOutline} style={{ marginRight: '2px' }} />}항목 추가
      </IonButton>
    </div>
  );
};



//* ========== Step 99. 항목 추가 ==========
interface AddItemProps {
  approval?: any;
  docItem?: any;
  onSaveEnabledChange: (enabled: boolean) => void;
}

const AddItem: React.FC<AddItemProps> = ({
  approval,
  docItem,
  onSaveEnabledChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<FormRef>({});
  const [, forceRender] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0); // 수익성 리프레시 키
  const [attendeeType, setAttendeeType] = useState('A'); // 참석자 구분
  const oriAttendee = useRef(null); // 참석자 템플릿
  const attendee = useRef<any>(null); // 참석자
  const [extraFieldUse, setExtraFieldUse] = useState<any>(null);

  // 참석자, 수익성 사용여부 체크
  const checkExtraFieldUse = useCallback(async () => {
    const cloneApproval = _.cloneDeep(approval);
    const cloneDocItem = _.cloneDeep(docItem);
    cloneDocItem.WRBTR = '0';
    cloneApproval.FLOWHD_DOCITEM = [cloneDocItem];
    cloneApproval.ACTIVITY = 'ENTER';
    cloneApproval.FIELD = 'ACCOUNT_CODE_T';
    cloneApproval.GUBUN = 'I';
    const res = await postExtraFieldUse(cloneApproval);
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
    setExtraFieldUse(res);
  }, []);

  // 참석자 추가 팝업 오픈
  const openAddAttendee = useCallback(() => {
    setAttendeeType('A');
    const cloneItem = _.cloneDeep<any>(oriAttendee.current);
    cloneItem.GUBUN = 'A';
    cloneItem.GUBUN_TX = '내부';
    attendee.current = cloneItem;
  }, []);

  // 참석자 추가
  const handleAddAttendee = useCallback(() => {
    docItem.DOCITEM_ATTENDEELIST.push(attendee.current);
    forceRender(prev => prev + 1);
  }, [attendee]);

  // 참석자 삭제
  const handleDeleteAttendee = useCallback((index: number) => {
    docItem.DOCITEM_ATTENDEELIST.splice(index, 1);
    forceRender(prev => prev + 1);
  }, [docItem]);

  const handleAttendeeInputChange = useCallback((values: Record<string, any>) => {
    attendee.current = {
      ...attendee.current,
      ...values
    }
  }, []);

  // docItem 변경 시 form 재할당
  useEffect(() => {
    if (oriAttendee.current) return;

    oriAttendee.current = docItem.DOCITEM_ATTENDEELIST[0];
    docItem.DOCITEM_ATTENDEELIST = [];
    formRef.current = docItem || {};
    checkRequired();
    forceRender(prev => prev + 1);
  }, [docItem]);

  const checkRequired = useCallback(() => {
    if (formRef.current.ACCOUNT_CODE_T
      && formRef.current.WRBTR
      && formRef.current.SGTXT) {
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
                  .replace(/[^0-9\-]/g, "") // 숫자, - 만 허용
                  .replace(/(?!^)-/g, "");  // - 는 맨 앞만

                if (raw === "" || raw === "-") return raw;

                return Number(raw).toLocaleString("ko-KR");
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

        {/* 참석자 */}
        {extraFieldUse?.ATTENDEE_EDIT &&
          <div style={{
            borderTop: '21px solid var(--custom-border-color-50)',
          }}>
            <div style={{
              padding: '32px 21px',
              position: 'relative'
            }}>
              <span style={{ fontSize: '16px', fontWeight: '500', display: 'block', marginBottom: '36px' }}>참석자</span>
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
                      marginBottom: index === docItem.DOCITEM_ATTENDEELIST.length - 1 ? "" : "28px",
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
                style={{ marginBottom: '12px' }}
                value={attendeeType}
                onIonChange={(e) => {
                  handleAttendeeInputChange({
                    'GUBUN': e.target.value,
                    'GUBUN_TX': e.target.value === 'A' ? '내부' : '외부'
                  });
                }}>
                <IonSelectOption value="A">내부</IonSelectOption>
                <IonSelectOption value="B">외부</IonSelectOption>
              </IonSelect>
              <CustomInput
                label={'이름'}
                // value={attendee?.ATTENDEE}
                labelPlacement='fixed'
                style={{ marginBottom: '12px' }}
                onChange={(value) => handleAttendeeInputChange({ 'ATTENDEE': value })} />
              <CustomInput
                label={'조직'}
                // value={attendee?.ORGTX}
                labelPlacement='fixed'
                disabled
                style={{ marginBottom: '12px' }}
                onChange={(value) => handleAttendeeInputChange({ 'ORGTX': value })} />
              <CustomInput
                // value={attendee?.PURPOSE}
                label={'목적'}
                labelPlacement='fixed'
                style={{ marginBottom: '12px' }}
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
};



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
        value='$TITLE'
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
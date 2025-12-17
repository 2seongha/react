import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonItem,
  IonPage,
  IonRippleEffect,
  useIonRouter,
  useIonViewWillEnter,
} from '@ionic/react';
import AppBar from '../components/AppBar';
import "./PersonalExpense.css";
import { addOutline } from 'ionicons/icons';
import CachedImage from '../components/CachedImage';
import { banknotesGlassIcon } from '../assets/images';
import SearchHelpModal from '../components/SearchHelpModal';
import { getSearchHelp, getStart } from '../stores/service';
import { webviewHaptic, webviewToast } from '../webview';
import _ from 'lodash';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingIndicator from '../components/LoadingIndicator';
import DatePickerModal from '../components/DatePicker';
import { FormRef } from '../stores/types';
import CustomInput from '../components/CustomInput';
import dayjs from 'dayjs';
import { getTopModalId, popModal } from '../App';
import Notify from 'simple-notify';

const PersonalExpense: React.FC = () => {
  const router = useIonRouter();
  //* 전체
  const [step, setStep] = useState(0);
  const [approval, setApproval] = useState<any>(null);
  const ignorePopRef = useRef(false);
  const interactPopRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevStepRef = useRef(0);
  const currStepRef = useRef(0);

  //* 항목 추가
  const oriItem = useRef(null); // 항목 템플릿
  const [docItem, setDocItem] = useState(null); // 항목 추가 바인딩
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);

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

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: [0.5, 1],
    }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({
      // x: dir > 0 ? 400 : -400,
      opacity: [1, 0],
    }),
  };

  const safeAreaBottom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ion-safe-area-bottom')) || 0;
  const buttonMotion = {
    initial: { y: 82 + safeAreaBottom },
    animate: { y: 0 },
    exit: { y: 82 + safeAreaBottom },
    transition: { duration: 0.3 },
  };

  useIonViewWillEnter(() => {
    const initApproval = async () => {
      const approval = await getStart('IA103');
      if (approval instanceof Error) {
        router.goBack();
        webviewToast('예상치 못한 오류가 발생했습니다. 잠시 후 시도해주세요.');
      }
      console.log(approval);
      oriItem.current = approval.FLOWHD_DOCITEM[0];
      approval.FLOW_DOCITEM = [];
      setApproval(approval);
    }
    initApproval();
  });

  // 항목 추가
  const handleAddItem = useCallback(() => {
    const cloneItem = _.cloneDeep<any>(oriItem.current);
    if (cloneItem) {
      cloneItem.BUZEI = ''; // 공란
      cloneItem.SEQNR = '1'; // 임직원개인경비 - 1고정
      cloneItem.WRBTR = '';
      cloneItem.DMBTR = '';
    }

    setDocItem(cloneItem);
    setIsSaveEnabled(false);
    goStep(99);
  }, [approval]);

  // 항목 저장
  const handleSaveItem = useCallback((item: any) => {
    const newItem = { ...item };
    let isEdit = false; // ✅ 수정 여부 플래그

    setApproval((prev: any) => {
      if (!prev || !prev.FLOW_DOCITEM) {
        return { ...prev, FLOW_DOCITEM: [{ ...newItem, CNT: '1', ITEMNO: '1' }] };
      }

      const list = [...prev.FLOW_DOCITEM];
      const index = list.findIndex(
        (itm) => String(itm.CNT) === String(newItem.CNT)
      );

      let newList;
      if (index > -1) {
        isEdit = true; // ✅ 수정
        newList = list.map((itm, i) =>
          i === index ? { ...itm, ...newItem } : itm
        );
      } else {
        newList = [...list, newItem]; // ✅ 신규 추가
      }

      newList = newList.map((itm, i) => ({
        ...itm,
        CNT: String(i + 1),
        ITEMNO: String(i + 1),
      }));

      return { ...prev, FLOW_DOCITEM: newList };
    });

    goStep(0);

    new Notify({
      title: isEdit ? '수정되었습니다.' : '저장되었습니다.',
      text: `${newItem.ACCOUNT_CODE_T} ${Number(newItem.WRBTR).toLocaleString('ko-KR')}원`,
      position: 'x-center bottom',
      autotimeout: 2000,
    });
  }, [step]);

  // 항목 삭제
  const handleDeleteItem = useCallback((deleteIndex: number) => {
    setApproval((prev: any) => {
      if (!prev || !prev.FLOW_DOCITEM) return { FLOW_DOCITEM: [] };
      new Notify({
        status: 'error',
        title: '삭제되었습니다.',
        text: `${prev.FLOW_DOCITEM[deleteIndex].ACCOUNT_CODE_T} ${Number(prev.FLOW_DOCITEM[deleteIndex].WRBTR).toLocaleString("ko-KR")}원`,
        position: 'x-center bottom',
        autotimeout: 2000
      });
      // deleteIndex 기준으로 필터링 + 재정렬
      const newList = prev.FLOW_DOCITEM
        .filter((_: any, i: number) => i !== deleteIndex)
        .map((item: any, i: number) => ({ ...item, CNT: i + 1, ITEMNO: i + 1 }));

      return {
        ...prev,
        FLOW_DOCITEM: newList,
      };
    });

  }, []);

  const title = useMemo(() => {
    let title;
    switch (step) {
      case 0:
        title = '임직원 개인경비';
        break;
      case 1:
        title = '헤더 설정';
        break;
      case 2:
        title = '첨부 파일';
        break;
      case 99:
        title = '항목 추가';
        break;
      default:
        title = 'test';
    }
    return <AnimatePresence mode='sync'>
      <motion.span
        key={title}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          duration: 0.2,
          ease: 'easeOut',
        }}
        style={{ display: "inline-block", position: 'absolute' }}
      >
        {title}
      </motion.span>
    </AnimatePresence>;
  }, [step]);

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
      if (['searchHelp', 'datePicker'].includes(getTopModalId() ?? '')) {
        return popModal();
      }

      if (ignorePopRef.current) {
        ignorePopRef.current = false;
        return;
      }

      if (currStepRef.current > 0) {
        interactPopRef.current = true;
        goStep((currStepRef.current === 99 ? 0 : currStepRef.current - 1));
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

          {step !== 0 && step !== 99 && (
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
      } />
      < IonContent
        fullscreen
        scrollX={false}
        scrollY={false}
        scrollEvents={false}
        forceOverscroll={false}
      >
        {approval === null && <div style={{
          // background: 'rgba(var(--ion-background-color-rgb), .95)',
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
          {/* 항목 추가 페이지 */}
          {step === 0 && <motion.div
            key="step0"
            custom={step - prevStepRef.current}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            style={{ height: '100%', padding: '0px 0px calc(82px + var(--ion-safe-area-bottom)) 0px' }}
          >
            <div style={{ overflow: 'auto', height: '100%', padding: '12px 21px 0 21px' }} ref={setScrollRef}>
              {approval?.FLOW_DOCITEM?.length > 0
                ?
                approval?.FLOW_DOCITEM.map((item: any, index: number) => {
                  return <div
                    className='ion-activatable'
                    key={'doc-item-' + item.CNT}
                    onClick={() => {
                      const cloneItem = _.cloneDeep<any>(item);
                      setDocItem(cloneItem);
                      setIsSaveEnabled(true);
                      goStep(99);
                    }}
                    style={{
                      marginBottom: '12px',
                      boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px',
                      borderRadius: '12px',
                      width: '100%',
                      padding: '21px',
                      position: 'relative',
                    }}>
                    <IonButton
                      mode='md'
                      color='danger'
                      fill='clear'
                      style={{ position: 'absolute', right: 8, top: 21, '--ripple-color': 'transparent' }}
                      onClick={(e) => {
                        e.stopPropagation();   // ⭐ 핵심
                        handleDeleteItem(index);
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
                onClick={handleAddItem}
                style={{
                  width: '100%',
                  height: '58px',
                  '--background': 'transparent',
                  '--color': 'var(--ion-color-step-900)',
                  borderRadius: '17px',
                  border: '1px dashed var(--custom-border-color-100)',
                  fontSize: '16px'
                }}>
                {<IonIcon src={addOutline} style={{ marginRight: '2px' }} />}항목 추가
              </IonButton>
            </div>
            {/* <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                height: "auto",
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 21px",
                paddingBottom: 'calc( var(--ion-safe-area-bottom) + 12px )',
                backgroundColor: 'var(--ion-background-color)'
              }}
            >
              <IonButton
                mode="md"
                color="primary"
                disabled={!approval?.FLOW_DOCITEM?.length}
                style={{
                  flex: 1.5,
                  height: "58px",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
                onClick={() => {
                  let totalWRBTR = 0;
                  let totalDMBTR = 0;
                  approval.FLOW_DOCITEM.forEach((item: any) => {
                    totalWRBTR += Number(item.WRBTR);
                    totalDMBTR += Number(item.DMBTR);
                  });

                  approval.FLOWHD_DOCHD.SUM_WRBTR = totalWRBTR.toString();
                  approval.FLOWHD_DOCHD.SUM_DMBTR = totalDMBTR.toString();
                  goStep(1);
                }}
              >
                <span>다음 단계</span>
              </IonButton>
            </div> */}
          </motion.div>}

          {/* 항목 추가 페이지 */}
          {step === 99 && <AddItem
            docItem={docItem}
            onSaveEnabledChange={enabled => {
              if (isSaveEnabled !== enabled) {
                setIsSaveEnabled(enabled);
              }
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
              transition={{ duration: 0.2 }}
              style={{ height: '100%', padding: '0px 0px calc(82px + var(--ion-safe-area-bottom)) 0px' }}
            >
              <Header docHeader={approval.FLOWHD_DOCHD} />
            </motion.div>
          }

          {/* 헤더 페이지 */}
          {step === 2 && <motion.div
            key="step2"
            custom={step - prevStepRef.current}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'green'
            }}
          >
            <>ㅁㄴㅇㄹ</>
          </motion.div>}
        </AnimatePresence>

        {/* 항목 추가 모달 */}
        {/* <PersonalExpenseAddModal
          modalRef={addItemModalRef}
          docItem={docItem}
        /> */}
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
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" {...buttonMotion} style={{ flex: 1 }}>
                <IonButton
                  mode="md"
                  color="primary"
                  disabled={!approval?.FLOW_DOCITEM?.length}
                  style={{
                    width: "100%",
                    height: "58px",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                  onClick={() => {
                    let totalWRBTR = 0;
                    let totalDMBTR = 0;
                    approval.FLOW_DOCITEM.forEach((item: any) => {
                      totalWRBTR += Number(item.WRBTR);
                      totalDMBTR += Number(item.DMBTR);
                    });

                    approval.FLOWHD_DOCHD.SUM_WRBTR = totalWRBTR.toString();
                    approval.FLOWHD_DOCHD.SUM_DMBTR = totalDMBTR.toString();
                    webviewHaptic('mediumImpact');
                    goStep(1);
                  }}
                >
                  다음 단계
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
                  저장
                </IonButton>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" {...buttonMotion} style={{ flex: 1 }}>
                <IonButton
                  mode="md"
                  color="primary"
                  style={{
                    width: "100%",
                    height: "58px",
                    fontSize: "18px",
                    fontWeight: "600",
                  }}
                  onClick={() => {
                    webviewHaptic('mediumImpact');
                    goStep(2);
                  }}
                >
                  다음 단계
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

interface AddItemProps {
  docItem?: any;
  onSaveEnabledChange: (enabled: boolean) => void;
}

const AddItem: React.FC<AddItemProps> = ({
  docItem,
  onSaveEnabledChange
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  // const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const formRef = useRef<FormRef>({});
  const [, forceRender] = useState(0);

  // docItem 변경 시 form 재할당
  useEffect(() => {
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
          padding: '12px 21px calc(102px + max(var(--ion-safe-area-bottom), var(--keyboard-height))) 21px'
        }}>
        <CustomInput
          formRef={formRef}
          value="$ACCOUNT_CODE_T"
          helperText="GL계정 : $SAKNR | GL계정명 : $SAKNR_T"
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
          }}
          readOnly
          clearInput
          style={{ marginBottom: '28px' }}
        />
        <CustomInput
          formRef={formRef}
          value="$KOSTL"
          helperText="코스트센터명 : $KOSTL_T"
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
          value="$AUFNR"
          helperText="오더명 : $AUFNR_T"
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
          value="$PROJK"
          helperText="WBS요소명 : $PROJK_T"
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ion-color-step-600)' }}>
          <CustomInput
            currency
            formRef={formRef}
            value="$WRBTR"
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
          <span style={{ paddingBottom: '10px' }}>{docItem?.WAERS}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ion-color-step-600)' }}>
          <CustomInput
            currency
            formRef={formRef}
            value="$DMBTR"
            label="현지통화금액"
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
              formRef.current.DMBTR = value.replace(/[^0-9.-]/g, '');
            }}
            style={{ marginBottom: '28px', textAlign: 'right' }}
            inputMode='numeric'
          />
          <span style={{ paddingBottom: '10px' }}>{docItem?.HWAER}</span>
        </div>

        <CustomInput
          formRef={formRef}
          value="$SGTXT"
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
          value="$ZUONR"
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
          value="$VALUT"
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
          value="$ZFBDT"
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
      {/* <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: "100%",
          display: "flex",
          padding: "12px 21px",
          zIndex: '2',
          paddingTop: '32px',
          background: 'linear-gradient(to top, var(--ion-background-color) 0%, var(--ion-background-color) calc(100% - 20px), transparent 100%)',
          paddingBottom: 'calc(12px + max(var(--ion-safe-area-bottom), var(--keyboard-height)))',
          transform: 'translateZ(0)'
        }}
      >
        <IonButton
          mode="md"
          color="primary"
          style={{
            flex: 1,
            height: "58px",
            fontSize: "18px",
            fontWeight: "600",
          }}
          disabled={!isSaveEnabled}
          onClick={() => {
            onSave?.(docItem);
            // dismiss();
          }}
        >
          <span>저장</span>
        </IonButton>
      </div> */}
    </motion.div>
  );
};

interface HeaderProps {
  docHeader?: any;
  onSave?: (item: any) => void;
}

const Header: React.FC<HeaderProps> = ({
  docHeader,
  onSave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const formRef = useRef<FormRef>({});
  const [, forceRender] = useState(0);

  // docItem 변경 시 form 재할당
  useEffect(() => {
    formRef.current = docHeader || {};
    forceRender(prev => prev + 1);
  }, [docHeader]);

  const checkRequired = useCallback(() => {
    if (formRef.current.BLDAT) {
      setIsSaveEnabled(true);
    } else {
      setIsSaveEnabled(false);
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
          value="$BUKRS_T($BUKRS)"
          label="회사코드"
          labelPlacement='fixed'
          style={{ marginBottom: '28px' }}
        />
        <CustomInput
          disabled
          formRef={formRef}
          value="$BLART_T($BLART)"
          label="전표유형"
          labelPlacement='fixed'
          style={{ marginBottom: '28px' }}
        />
        <CustomInput
          disabled
          formRef={formRef}
          value="$CREATOR_LOGIN_ID | $CREATOR_NAME | $CREATOR_ORGTX"
          label="생성인"
          labelPlacement='fixed'
          style={{ marginBottom: '28px' }}
        />
        <CustomInput
          required
          formRef={formRef}
          value="$BLDAT"
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
          value="$BUDAT"
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
          value="$WAERS"
          label="전표통화"
          labelPlacement='fixed'
          style={{ marginBottom: '28px' }}
        />
        {/* <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ion-color-step-600)' }}> */}
        <CustomInput
          disabled
          formRef={formRef}
          value="$SUM_WRBTR"
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
        {/* <span style={{ paddingBottom: '10px' }}>{docHeader?.WAERS}</span>
        </div> */}
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          bottom: 0,
          width: "100%",
          display: "flex",
          padding: "12px 21px",
          zIndex: '2',
          paddingTop: '32px',
          background: 'linear-gradient(to top, var(--ion-background-color) 0%, var(--ion-background-color) calc(100% - 20px), transparent 100%)',
          paddingBottom: 'calc(12px + max(var(--ion-safe-area-bottom), var(--keyboard-height)))',
          transform: 'translateZ(0)'
        }}
      >
        <IonButton
          mode="md"
          color="primary"
          style={{
            flex: 1,
            height: "58px",
            fontSize: "18px",
            fontWeight: "600",
          }}
          onClick={() => {
            onSave?.(docHeader);
          }}
        >
          <span>다음 단계</span>
        </IonButton>
      </div>
    </>
  );
};
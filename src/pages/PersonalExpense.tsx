import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  IonBackButton,
  IonButton,
  IonContent,
  IonFooter,
  IonIcon,
  IonPage,
  useIonRouter,
  useIonViewWillEnter,
} from '@ionic/react';
import useAppStore from '../stores/appStore';
import AppBar from '../components/AppBar';
import "./PersonalExpense.css";
import { addOutline, close, remove, removeCircleOutline, trashBin } from 'ionicons/icons';
import PersonalExpenseAddModal from '../components/PersonalExpenseAddModal';
import CachedImage from '../components/CachedImage';
import { banknotesGlassIcon } from '../assets/images';
import SearchHelpModal from '../components/SearchHelpModal';
import { getSearchHelp, getStart } from '../stores/service';
import { webviewToast } from '../webview';
import _ from 'lodash';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingIndicator from '../components/LoadingIndicator';
import DatePickerModal from '../components/DatePicker';
import { FormRef } from '../stores/types';
import CustomInput from '../components/CustomInput';
import dayjs from 'dayjs';

const PersonalExpense: React.FC = () => {
  const router = useIonRouter();
  const [step, setStep] = useState(0);
  const [approval, setApproval] = useState<any>(null); // 상신 템플릿
  const [docItem, setDocItem] = useState(null); // 항목 추가 바인딩
  const oriItem = useRef(null); // 항목 템플릿
  const prevStepRef = useRef(step);
  const direction = step > prevStepRef.current ? 1 : -1; // 자동 판단

  // step이 바뀔 때마다 prev 업데이트
  useEffect(() => {
    prevStepRef.current = step;
  }, [step]);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: [0, 1],          // keyframes
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction > 0 ? 40 : -40,
      opacity: [1, 0],          // 나갈 때도 중간에 머물게 가능
    })
  };

  const titleVariants = {
    enter: { opacity: 0, y: 10 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
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
    setStep(99);
  }, [approval]);

  // 항목 저장
  const handleSaveItem = useCallback((item: any) => {
    // 안전하게 새 객체 생성
    const newItem = { ...item };

    setApproval((prev: any) => {
      if (!prev || !prev.FLOW_DOCITEM) return { FLOW_DOCITEM: [newItem] };

      const newList = [...prev.FLOW_DOCITEM, newItem].map((itm, i) => ({
        ...itm,
        CNT: i + 1,
        ITEMNO: i + 1,
      }));

      return { ...prev, FLOW_DOCITEM: newList };
    });

    setStep(0);
  }, []);

  // 항목 삭제
  const handleDeleteItem = useCallback((deleteIndex: number) => {
    setApproval((prev: any) => {
      if (!prev || !prev.FLOW_DOCITEM) return { FLOW_DOCITEM: [] };

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
      case 99:
        title = '항목 추가';
        break;
    }
    return <AnimatePresence mode="wait">
      <motion.span
        key={title} // key가 바뀌면 AnimatePresence가 새 요소로 인식
        variants={titleVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.2 }}
        style={{ display: "inline-block" }}
      >
        {title}
      </motion.span>
    </AnimatePresence>;
  }, [step]);

  return (
    <IonPage className='personal-expense'>
      <AppBar title={title} customStartButtons={<AnimatePresence mode="wait">
        <motion.div
          key={'start-button' + step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{ display: 'flex', alignItems: 'center' }}
        >
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
              onClick={() => setStep(step - 1)}
              style={{
                '--border-radius': '24px',
                marginLeft: '8px',
                width: '64px',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: '600' }}>이전</span>
            </IonButton>
          )}

          {step === 99 && (
            <IonButton
              mode='md'
              fill="clear"
              onClick={() => setStep(0)}
              style={{
                '--border-radius': '24px',
                marginLeft: '8px',
                width: '64px',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: '600' }}>취소</span>
            </IonButton>
          )}
        </motion.div>
      </AnimatePresence>} />
      <IonContent
        fullscreen
        scrollX={false}
        scrollY={false}
        scrollEvents={false}
        style={{
          '--padding-top': '12px',
        }}>
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
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            style={{ height: '100%', padding: '12px 21px 82px 21px', overflow: 'auto' }}
          >
            {approval?.FLOW_DOCITEM?.length > 0
              ?
              approval?.FLOW_DOCITEM.map((item: any, index: number) => {
                return <div style={{
                  padding: '21px',
                  borderRadius: '12px',
                  position: 'relative',
                  boxShadow: 'rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px',
                  marginBottom: '12px'
                }}>
                  <IonButton mode='md' color='danger' fill='clear' style={{ position: 'absolute', right: 6, top: 12 }} onClick={() => handleDeleteItem(index)}>삭제</IonButton>
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
                    <span>항목텍스트</span>
                    <span>{item.SGTXT || '-'}</span>
                  </div>
                  <div className="custom-item-body-line" style={{ marginBottom: '4px' }}>
                    <span>코스트센터</span>
                    <span>{item.KOSTL || '-'}</span>
                  </div>
                  <div className="custom-item-body-line" style={{ marginBottom: '4px' }}>
                    <span>코스트센터명</span>
                    <span>{item.KOSTL_T || '-'}</span>
                  </div>
                  <div className="custom-item-body-line" style={{ marginBottom: '4px' }}>
                    <span>오더번호</span>
                    <span>{item.AUFNR || '-'}</span>
                  </div>
                  <div className="custom-item-body-line">
                    <span>오더명</span>
                    <span>{item.AUFNR_T || '-'}</span>
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
                width: '100%'
              }}>
                <CachedImage src={banknotesGlassIcon} width={130} height={130}></CachedImage>
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
              id='personal-expense-add-modal-trigger'
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
            <div
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
                id="approve-modal"
                onClick={() => {
                  setStep(step + 1);
                }}
              >
                <span>다음 단계</span>
              </IonButton>
            </div>
          </motion.div>}

          {/* 항목 추가 페이지 */}
          {step === 99 && <AddItem
            docItem={docItem}
            onSave={handleSaveItem}
          />}

          {/* 헤더 페이지 */}
          {step === 1 && <motion.div
            key="step1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2 }}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'red'
            }}
          >
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

      </IonContent>
    </IonPage >
  );
};

export default PersonalExpense;

interface AddItemProps {
  docItem?: any;
  onSave?: (item: any) => void;
}

const AddItem: React.FC<AddItemProps> = ({
  docItem,
  onSave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const formRef = useRef<FormRef>({});
  const [, forceRender] = useState(0);

  // docItem 변경 시 form 재할당
  useEffect(() => {
    formRef.current = docItem || {};
    forceRender(prev => prev + 1);
  }, [docItem]);

  const checkRequired = useCallback(() => {
    if (formRef.current.ACCOUNT_CODE_T
      && formRef.current.WRBTR
      && formRef.current.SGTXT) {
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

    // setTimeout(() => {
    //   const offset = 60; // 위에서 50px 밑으로
    //   const containerTop = container.getBoundingClientRect().top;
    //   const elTop = e.target.getBoundingClientRect().top;
    //   const scrollTop = container.scrollTop + (elTop - containerTop) - offset;
    //   container.scrollTo({
    //     top: scrollTop,
    //     behavior: "smooth",
    //   });
    // }, 150)
  };
  const variants = {
    enter: { y: "5%", opacity: 0 },   // 화면 밑에서 시작
    center: { y: 0, opacity: 1 },       // 원래 위치
    exit: { y: "5%", opacity: 0 }     // 다시 밑으로
  };
  return (
    <motion.div
      key={docItem + 'item'}
      variants={variants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={{ duration: 0.2 }}
      ref={containerRef}
      style={{
        height: '100%',
        overflow: 'auto',
        padding: '0 21px',
        paddingBottom: 'calc(102px + max(var(--ion-safe-area-bottom), var(--keyboard-height)))'
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
      <div
        style={{
          position: 'fixed',
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
      </div>
    </motion.div>
  );
};
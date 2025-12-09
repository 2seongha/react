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
import { addOutline } from 'ionicons/icons';
import PersonalExpenseAddModal from '../components/PersonalExpenseAddModal';
import CachedImage from '../components/CachedImage';
import { banknotesGlassIcon } from '../assets/images';
import SearchHelpModal from '../components/SearchHelpModal';
import { getStart } from '../stores/service';
import { webviewToast } from '../webview';
import _ from 'lodash';
import { AnimatePresence, motion } from 'framer-motion';

const PersonalExpense: React.FC = () => {
  const router = useIonRouter();
  const [step, setStep] = useState(0);
  const [approval, setApproval] = useState(null); // 상신 템플릿
  const [docItem, setDocItem] = useState(null); // 항목 추가 바인딩
  const oriItem = useRef(null); // 항목 템플릿
  const prevStepRef = useRef(step);
  const addItemModalRef = useRef<HTMLIonModalElement>(null);
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
    setDocItem(_.cloneDeep(oriItem.current));
    addItemModalRef.current?.present();
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

          {step !== 0 && (
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
        </motion.div>
      </AnimatePresence>} />
      <IonContent
        fullscreen
        scrollX={false}
        scrollY={false}
        scrollEvents={false}
        style={{
          '--padding-top': '12px',
          '--padding-start': '21px',
          '--padding-end': '21px',
        }}>
        <AnimatePresence mode="wait" initial={false}>
          {/* 항목 추가 페이지 */}
          {step === 0 && <motion.div
            key="step0"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <div style={{
              paddingTop: '26px',
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
            <IonButton
              type='button'
              id='personal-expense-add-modal-trigger'
              mode='md'
              onClick={handleAddItem}
              style={{
                marginTop: '21px',
                width: '100%',
                height: '58px',
                '--background': 'transparent',
                '--color': 'var(--ion-color-step-900)',
                '--ripple-color': 'transparent',
                borderRadius: '17px',
                border: '1px dashed var(--custom-border-color-100)',
                fontSize: '16px'
              }}>
              {<IonIcon src={addOutline} style={{ marginRight: '2px' }} />}항목 추가
            </IonButton>
          </motion.div>}

          {/* 헤더 페이지 */}
          {step === 1 && <motion.div
            key="step1"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'red'
            }}
          >
          </motion.div>}
        </AnimatePresence>
        {/* 항목 추가 모달 */}
        <PersonalExpenseAddModal
          modalRef={addItemModalRef}
          // trigger='personal-expense-add-modal-trigger'
          docItem={docItem}
        />
        {/* 서치 헬프 모달 */}
        <SearchHelpModal />

      </IonContent>
      <IonFooter style={{
        boxShadow: 'none',
      }}>
        <div
          style={{
            height: "auto",
            width: "100%",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 21px",
            gap: "12px",
            paddingBottom: 'calc( var(--ion-safe-area-bottom) + 12px )',
            backgroundColor: 'var(--ion-background-color)'
          }}
        >
          <IonButton
            mode="md"
            color="primary"
            // disabled
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
      </IonFooter>
    </IonPage >
  );
};

export default PersonalExpense;
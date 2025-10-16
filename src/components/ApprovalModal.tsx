import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  IonContent,
  IonFooter,
  IonIcon,
  IonModal,
  IonTextarea,
  useIonRouter,
} from "@ionic/react";
import { IonButton } from "@ionic/react";
import AppBar from "./AppBar";
import { checkmarkCircle, checkmarkCircleOutline, close } from "ionicons/icons";
import "./ApprovalModal.css";
import AnimatedIcon from "./AnimatedIcon";
import { FlipWords } from "./FlipWords";
import { motion, AnimatePresence } from "framer-motion";
import { webviewHaptic } from "../webview";

interface ApprovalModalProps {
  trigger?: string;
  apprTitle?: string;
  title?: string;
  buttonText?: string;
  buttonColor?:
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success"
  | "danger";
  required?: boolean;
  selectedItems?: Array<object>;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  trigger,
  apprTitle,
  title,
  buttonText = "확인",
  buttonColor = "primary",
  required = false,
  selectedItems,
}) => {
  const router = useIonRouter();
  const modal = useRef<HTMLIonModalElement>(null);
  const textareaRef = useRef<HTMLIonTextareaElement>(null);
  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);

  const [textValue, setTextValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(0); // 0: 결재 전, 1: 결재 중, 2: 결재 후
  const [stepText, setStepText] = useState("하시겠습니까?");
  const [status, setStatus] = useState<string | null>(null);

  function dismiss() {
    modal.current?.dismiss();
  }

  const handleTextChange = (e: any) => {
    const value = (e.target as HTMLTextAreaElement).value;
    setTextValue(value);
  };

  const handleModalWillPresent = () => {
    setIsModalOpen(true);

    // 모달이 열릴 때 히스토리 추가
    const currentState = window.history.state;
    window.history.pushState({ ...currentState, modalOpen: true }, "");
    historyPushedRef.current = true;
    closedByBackButtonRef.current = false;
  };

  const handleModalDidDismiss = () => {
    setIsModalOpen(false);
    setTextValue("");
    setStep(0);
    setStepText("하시겠습니까?");
    setStatus(null);

    // 일반적인 닫기 (뒤로가기가 아닌)인 경우 히스토리에서 제거
    if (historyPushedRef.current && !closedByBackButtonRef.current) {
      if (window.history.state?.modalOpen) {
        window.history.back();
      }
    }
    historyPushedRef.current = false;
    closedByBackButtonRef.current = false;
  };

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    if (!isModalOpen) return;

    const handlePopState = (event: PopStateEvent) => {
      if (isModalOpen) {
        // 뒤로가기로 인한 모달 닫기
        closedByBackButtonRef.current = true;
        dismiss();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isModalOpen]);

  // 닫기 버튼 컴포넌트 - AppBar 버튼과 동일한 스타일
  const closeButton = useMemo(
    () => (
      <IonButton
        mode="md"
        shape="round"
        color={"medium"}
        className="app-bar-button"
        onClick={dismiss}
      >
        <IonIcon icon={close} />
      </IonButton>
    ),
    []
  );

  const handleApprove = () => {
    if (step === 0) {
      webviewHaptic("mediumImpact");
      setStep(1);
      setStepText("중입니다.");
      setTimeout(() => {
        const statuses = ["success", "error", "warning"];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        setStatus(randomStatus);
      }, 2400);
    } else if (step === 2) {
      dismiss();
    }
  };

  return (
    <IonModal
      onIonModalWillPresent={handleModalWillPresent}
      onIonModalDidDismiss={handleModalDidDismiss}
      className="approval-modal"
      mode="ios"
      ref={modal}
      trigger={trigger}
      canDismiss={step !== 1}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      style={{
        "--max-height": "calc(100% - 48px - var(--ion-safe-area-top))",
      }}
    >
      <AppBar title={<></>} customEndButtons={closeButton} />
      <IonContent className="approval-modal-ion-content">
        <div style={{
          background: 'linear-gradient(to bottom, var(--ion-background-color) 0%, var(--ion-background-color) 160px, transparent 180px)',
          width: '100%',
          height: '180px',
          position: 'fixed',
          zIndex: 2
        }} />
        <motion.div
          className="approval-modal-title-wrapper"
          animate={
            step === 1 ? {
              y: "calc(50vh - 100%)",
              scale: 0.9,
            } : step === 2 ? {
              y: "40px",
              scale: 0.8,
            } : {
              y: '0px',
              scale: 1,
            }}
          transition={{ duration: step === 2 ? 0.4 : 0.5, ease: "easeInOut" }}
        >
          {step !== 0 && <AnimatedIcon
            status={status}
            onAnimationComplete={() => {
              setStepText("했습니다.");
              webviewHaptic("mediumImpact");
              setTimeout(() => setStep(2), 1000);
            }}
            style={{
              position: 'absolute',
              top: '-70px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />}
          <span>
            {apprTitle}
            <span style={{ color: "var(--ion-color-primary)" }}> {selectedItems?.length}건</span>을
          </span>
          <span >
            <span style={{ color: "var(--ion-color-primary)" }}>{title}</span>{" "}
            <FlipWords animation={step !== 0} words={[stepText]} />
          </span>
        </motion.div>
        <AnimatePresence>
          {step !== 1 &&
            <motion.div
              initial={step === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                width: '100%',
                padding: '16px 21px 16px 21px',
                marginTop: '160px',
                marginBottom: '176px',
              }}>
              {selectedItems?.map((item: any, index: number) => (
                <div key={`approval-modal-item-${index}`}
                  className={`approval-modal-item ${status}`}
                  style={{
                    backgroundColor: 'var(--ion-background-color2)',
                    padding: '16px 21px',
                    borderRadius: step === 2? '4px 12px 12px 4px' : '12px',
                    marginBottom: '8px',
                    gap: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    position: 'relative'
                  }}>
                  {step === 2 && <IonIcon icon={checkmarkCircle} style={{ fontSize: '24px' }} color={status === 'error' ? 'danger' : `${status}`} />}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: step === 2 ? 'calc(100% - 36px)' : '100%'
                  }}>
                    <span style={{ color: 'var(--ion-color-secondary)', fontSize: '12px', marginBottom: '4px' }}>{item.APPR_TITLE ? item.FLOWNO : item.FLOWCNT}</span>
                    <span style={{
                      fontWeight: 500,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: '100%', // 말줄임표가 보일 수 있도록 너비 제한 필요
                    }}>
                      {item.APPR_TITLE ?? item.BKTXT}
                    </span>
                    <span
                      style={{
                        marginTop: '4px',
                        fontSize: '13px',
                        color: `var(--ion-color-${status === 'error' ? 'danger' : `${status}`})`
                      }}
                    >
                      오류 메시지 자리
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          }
        </AnimatePresence>
        <AnimatePresence>
          {step !== 1 && (
            <motion.div
              initial={step === 0 ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{
                padding: "28px 21px calc(12px + max(var(--ion-safe-area-bottom), var(--keyboard-height))) 21px",
                position: "fixed",
                bottom: 0,
                width: "100%",
                background: 'linear-gradient(to top, var(--ion-background-color) 0%, var(--ion-background-color) calc(100% - 20px), transparent 100%)',
              }}
            >
              <IonTextarea
                ref={textareaRef}
                mode="md"
                style={{
                  marginBottom: "12px",
                  "--border-radius": "16px",
                }}
                rows={4}
                value={textValue}
                onInput={handleTextChange}
                labelPlacement="start"
                fill="outline"
                disabled={step !== 0}
                placeholder="결재 의견을 입력해 주세요."
              ></IonTextarea>
              <IonButton
                mode="md"
                color={buttonColor}
                disabled={required && !textValue?.trim()}
                style={{
                  height: "58px",
                  width: "100%",
                  flex: 1,
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
                onClick={handleApprove}
              >
                <span>{step === 0 ? buttonText : '닫기'}</span>
              </IonButton>
            </motion.div>
          )}
        </AnimatePresence>
        {/* </div> */}
      </IonContent>
    </IonModal>
  );
};

export default ApprovalModal;

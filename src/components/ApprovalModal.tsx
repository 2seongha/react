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
import { close } from "ionicons/icons";
import "./ApprovalModal.css";
import AnimatedIcon from "./AnimatedIcon";
interface ApprovalModalProps {
  isOpen: boolean;
  trigger: string;
  onDidDismiss: () => void;
  title: string;
  subtitle?: string;
  message?: string;
  placeholder?: string;
  cancelText?: string;
  confirmText?: string;
  confirmColor?:
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success"
  | "danger";
  onCancel?: () => void;
  onConfirm?: (textValue: string) => void;
  maxLength?: number;
  required?: boolean;
  page?: any;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  trigger,
  onDidDismiss,
  title,
  subtitle,
  message,
  placeholder = "내용을 입력해주세요",
  cancelText = "취소",
  confirmText = "확인",
  confirmColor = "primary",
  onCancel,
  onConfirm,
  maxLength = 500,
  required = false,
  page = undefined,
}) => {
  const router = useIonRouter();
  const modal = useRef<HTMLIonModalElement>(null);
  const textareaRef = useRef<HTMLIonTextareaElement>(null);
  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);

  const [textValue, setTextValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(0); // 0: 결재 전, 1: 결재 중, 2: 결재 후
  const [status, setStatus] = useState<string | null>(null);

  function dismiss() {
    modal.current?.dismiss();
  }

  const handleTextChange = (e: any) => {
    const value = (e.target as HTMLTextAreaElement).value;
    setTextValue(value);
  };

  const handleModalWillPresent = () => {
    setTextValue("");
    setIsModalOpen(true);
    setStep(0);
    setStatus(null);

    // 모달이 열릴 때 히스토리 추가
    const currentState = window.history.state;
    window.history.pushState({ ...currentState, modalOpen: true }, "");
    historyPushedRef.current = true;
    closedByBackButtonRef.current = false;
  };

  const handleModalDidDismiss = () => {
    setIsModalOpen(false);
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
      setStep(1);
      setTimeout(() => {
        setStatus("success");
        setStep(2);
      }, 2400);
    } else if (step === 2) {
      router.goBack();
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
        <div className="approval-modal-title-wrapper">
          <AnimatedIcon status={status} style={{ "marginBottom": "12px", "display": step !== 0 ? 'block' : 'none' }} />
          <span>
            임직원 개인경비{" "}
            <span style={{ color: "var(--ion-color-primary)" }}>1건</span>을
          </span>
          <span key={step} className="card-flip-enter">
            <span style={{ color: "var(--ion-color-primary)" }}>{title}</span>{" "}
            {step === 0 ? "하시겠습니까?" : step === 1 ? "중입니다." : "했습니다."}
          </span>
        </div>
        <div
          style={{
            padding: "28px 21px 12px 21px",
            position: "fixed",
            bottom: 'max(var(--ion-safe-area-bottom), var(--keyboard-height))',
            width: "100%",
            background: 'linear-gradient(to top, var(--ion-background-color) 0%, var(--ion-background-color) calc(100% - 20px), transparent 100%)',
            zIndex: 2,
            pointerEvents: step === 1 ? 'none' : 'auto'
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
            color={confirmColor}
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
            <span>{step === 0 ? confirmText : '닫기'}</span>
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ApprovalModal;

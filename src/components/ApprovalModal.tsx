import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  IonContent,
  IonFooter,
  IonIcon,
  IonModal,
  IonTextarea,
} from "@ionic/react";
import { IonButton } from "@ionic/react";
import AppBar from "./AppBar";
import { close } from "ionicons/icons";
import "./ApprovalModal.css";
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
  const modal = useRef<HTMLIonModalElement>(null);
  const textareaRef = useRef<HTMLIonTextareaElement>(null);
  const [canDismiss, setCanDismiss] = useState(true);
  const [textValue, setTextValue] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);

  function dismiss() {
    modal.current?.dismiss();
  }

  const handleTextChange = (e: any) => {
    const value = (e.target as HTMLTextAreaElement).value;
    setTextValue(value);
  };

  const handelModalWillPresent = () => {
    setTextValue("");
    setIsModalOpen(true);
    // 모달이 열릴 때 히스토리 추가
    const currentState = window.history.state;
    window.history.pushState({ ...currentState, modalOpen: true }, "");
    historyPushedRef.current = true;
    closedByBackButtonRef.current = false;
  };

  const handelModalDidDismiss = () => {
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

  return (
    <IonModal
      onIonModalWillPresent={handelModalWillPresent}
      onIonModalDidDismiss={handelModalDidDismiss}
      className="approval-modal"
      mode="ios"
      ref={modal}
      trigger={trigger}
      canDismiss={canDismiss}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      style={{
        "--max-height": "calc(100% - 48px - var(--ion-safe-area-top))",
      }}
    >
      <AppBar title={<></>} customEndButtons={closeButton} />
      <IonContent className="approval-modal-ion-content">
        <div className="approval-modal-title-wrapper">
          <span>
            임직원 개인경비{" "}
            <span style={{ color: "var(--ion-color-primary)" }}>1건</span>을
          </span>
          <span>
            <span style={{ color: "var(--ion-color-primary)" }}>{title}</span>{" "}
            하시겠습니까?
          </span>
        </div>
        <div
          style={{
            padding: "28px 8px 8px 8px",
            position: "fixed",
            bottom: 'max(var(--ion-safe-area-bottom), var(--keyboard-height))',
            // bottom: 'var(--ion-safe-area-bottom)',
            width: "100%",
            background: "var(--ion-background-color-gradient)",
            zIndex: 2,
          }}
        >
          <IonTextarea
            ref={textareaRef}
            mode="md"
            style={{
              marginBottom: "8px",
              "--border-radius": "16px",
            }}
            rows={4}
            value={textValue}
            onInput={handleTextChange}
            labelPlacement="start"
            fill="outline"
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
          >
            <span>{confirmText}</span>
          </IonButton>
        </div>
      </IonContent>
      {/* <IonFooter style={{ '--padding-inset-bottom': 'var(--ion-safe-area-keyboard)' }}></IonFooter> */}
    </IonModal>
  );
};

export default ApprovalModal;

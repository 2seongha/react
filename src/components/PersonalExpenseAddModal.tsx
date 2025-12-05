import React, { useState, useRef, useEffect } from "react";
import {
  IonContent,
  IonFooter,
  IonInput,
  IonModal,
} from "@ionic/react";
import { IonButton } from "@ionic/react";
import AppBar from "./AppBar";
import useAppStore from "../stores/appStore";
import _ from "lodash";
interface NotificationPopupProps {
  trigger?: string;
}

const PersonalExpenseAddModal: React.FC<NotificationPopupProps> = ({
  trigger,
}) => {
  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);
  const modalRef = useRef<HTMLIonModalElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  function dismiss() {
    modalRef.current?.dismiss();
  }

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
        event.preventDefault();
        // 히스토리를 다시 앞으로 이동
        window.history.pushState({ modalOpen: true }, "");
        // // 뒤로가기로 인한 모달 닫기
        // closedByBackButtonRef.current = true;
        // dismiss();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isModalOpen]);

  return (
    <IonModal
      onIonModalWillPresent={handleModalWillPresent}
      onIonModalDidDismiss={handleModalDidDismiss}
      ref={modalRef}
      trigger={trigger}
    >
      <AppBar title={<span>행 추가</span>} customStartButtons={
        <IonButton
          mode='md'
          fill="clear"
          color='medium'
          onClick={dismiss}
          style={{
            width: '80px'
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: '600' }}>취소</span>
        </IonButton>
      }></AppBar>
      <IonContent scrollEvents={false} scrollY={false}>
        <div style={{
          height: '100%',
          overflow: 'auto',
          padding: '21px',
          paddingBottom: 'calc(102px + max(var(--ion-safe-area-bottom), var(--keyboard-height)))'
        }}>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">계정그룹명 <span style={{ color: 'var(--red)' }}>(필수)</span></span>
            <IonInput mode="md" fill="outline" placeholder="" />
          </div>
          {/* <div style={{ display: 'flex', gap: '21px' }}>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">G/L계정</span>
            <IonInput mode="md" fill="outline" placeholder="" readonly />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">G/L계정</span>
            <IonInput mode="md" fill="outline" placeholder="" readonly />
          </div>
        </div> */}
          <div style={{ marginBottom: '21px' }}>
            <span className="label">코스트센터</span>
            <IonInput mode="md" fill="outline" placeholder="" />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">오더번호</span>
            <IonInput mode="md" fill="outline" placeholder="" />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">WBS요소</span>
            <IonInput mode="md" fill="outline" placeholder="" />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">전표통화금액 <span style={{ color: 'var(--red)' }}>(필수)</span></span>
            <IonInput mode="md" fill="outline" placeholder="" />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">현지통화금액</span>
            <IonInput mode="md" fill="outline" placeholder="" />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">항목텍스트 <span style={{ color: 'var(--red)' }}>(필수)</span></span>
            <IonInput mode="md" fill="outline" placeholder="" />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">지정</span>
            <IonInput mode="md" fill="outline" placeholder="" />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">기준일자</span>
            <IonInput mode="md" fill="outline" placeholder="" />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">만기계산일</span>
            <IonInput mode="md" fill="outline" placeholder="" />
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              bottom: 0,
              height: "102px",
              alignItems: 'end',
              width: "100%",
              borderRadius: "16px 16px 0 0",
              display: "flex",
              padding: "12px 21px",
              zIndex: '2',
              background: 'linear-gradient(to top, var(--ion-background-color) 0%, var(--ion-background-color) calc(100% - 20px), transparent 100%)',
              paddingBottom: 'calc(12px + max(var(--ion-safe-area-bottom), var(--keyboard-height)))'
            }}
          >
            <IonButton
              mode="md"
              color="primary"
              style={{
                flex: 1.5,
                height: "58px",
                fontSize: "18px",
                fontWeight: "600",
              }}
              id="approve-modal"
              onClick={() => {
              }}
            >
              <span>저장</span>
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default PersonalExpenseAddModal;
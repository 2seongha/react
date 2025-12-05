import React, { useState, useRef, useEffect } from "react";
import {
  IonContent,
  IonFooter,
  IonIcon,
  IonInput,
  IonModal,
} from "@ionic/react";
import { IonButton } from "@ionic/react";
import AppBar from "./AppBar";
import useAppStore from "../stores/appStore";
import _ from "lodash";
import { color } from "framer-motion";
import { copy, copyOutline, person } from "ionicons/icons";
import { FilterNoneOutlined } from "@mui/icons-material";
interface NotificationPopupProps {
  trigger?: string;
}

const PersonalExpenseAddModal: React.FC<NotificationPopupProps> = ({
  trigger,
}) => {
  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);
  const modalRef = useRef<HTMLIonModalElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
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
        // event.preventDefault();
        // 히스토리를 다시 앞으로 이동
        window.history.pushState({ modalOpen: true }, "");
        // // 뒤로가기로 인한 모달 닫기
        closedByBackButtonRef.current = true;
        dismiss();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isModalOpen]);

  const handleFocus = (e: any) => {
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
    <IonModal
      onIonModalWillPresent={handleModalWillPresent}
      onIonModalDidDismiss={handleModalDidDismiss}
      ref={modalRef}
      trigger={trigger}
      mode="ios"
    >
      <AppBar title={<span>항목 추가</span>} customStartButtons={
        <IonButton
          mode='md'
          fill="clear"
          onClick={dismiss}
          style={{
            '--border-radius': '24px',
            width: '64px',
            '--color': 'var(--ion-color-step-700)'
          }}
        >
          <span style={{ fontSize: '16px', fontWeight: '600' }}>취소</span>
        </IonButton>
      }></AppBar>
      <IonContent scrollEvents={false} scrollY={false}>
        <div
          ref={containerRef}
          style={{
            height: '100%',
            overflow: 'auto',
            padding: '21px',
            paddingBottom: 'calc(102px + max(var(--ion-safe-area-bottom), var(--keyboard-height)))'
          }}>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">계정그룹명 <span style={{ color: 'var(--red)' }}>(필수)</span></span>
            <IonInput className="input" mode="md" fill="outline" placeholder="" onIonFocus={handleFocus} readonly >
              <IonButton
                fill="clear"
                slot="end"
                color='medium'
                style={{
                  width: '62px',
                  height: '48px',
                  transform: 'translateX(15px)',
                  // '--border-radius': '24px'
                }}
              >
                <FilterNoneOutlined
                  style={{
                    color: 'var(--custom-border-color-150)',
                  }}
                />
              </IonButton>
              {/* <IonIcon slot="end" src={FilterNoneOutlined} style={{ width: '24px', height: '24px', color: 'var(--ion-color-secondary)' }} /> */}
            </IonInput>
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">코스트센터</span>
            <IonInput className="input" mode="md" fill="outline" placeholder="" onIonFocus={handleFocus} />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">오더번호</span>
            <IonInput className="input" mode="md" fill="outline" placeholder="" onIonFocus={handleFocus} />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">WBS요소</span>
            <IonInput className="input" mode="md" fill="outline" placeholder="" onIonFocus={handleFocus} />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">전표통화금액 <span style={{ color: 'var(--red)' }}>(필수)</span></span>
            <IonInput className="input" mode="md" fill="outline" placeholder="" onIonFocus={handleFocus} />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">현지통화금액</span>
            <IonInput className="input" mode="md" fill="outline" placeholder="" onIonFocus={handleFocus} />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">항목텍스트 <span style={{ color: 'var(--red)' }}>(필수)</span></span>
            <IonInput className="input" mode="md" fill="outline" placeholder="" onIonFocus={handleFocus} />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">지정</span>
            <IonInput className="input" mode="md" fill="outline" placeholder="" onIonFocus={handleFocus} />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">기준일자</span>
            <IonInput className="input" mode="md" fill="outline" placeholder="" onIonFocus={handleFocus} />
          </div>
          <div style={{ marginBottom: '21px' }}>
            <span className="label">만기계산일</span>
            <IonInput className="input" mode="md" fill="outline" placeholder="" onIonFocus={handleFocus} />
          </div>
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
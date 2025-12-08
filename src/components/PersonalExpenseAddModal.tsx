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
import { ValueHelp } from "./CustomIcon";
import CustomInput, { FormRef } from "./CustomInput";
import SearchHelpModal from "./SearchHelpModal";
import { Button } from "@mui/material";

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
  const formRef = useRef<FormRef>({});

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
      style={{
        '--width': '100%',
        '--height': '100%',
        '--ion-safe-area-top': 'var(--root-safe-area-top)',
        '--ion-safe-area-bottom': 'var(--root-safe-area-bottom)',
      }}
    >
      <AppBar title={<span>항목 추가</span>} customStartButtons={
        <IonButton
          mode='md'
          fill="clear"
          onClick={dismiss}
          style={{
            '--border-radius': '24px',
            width: '64px',
            // '--color': 'var(--ion-color-step-700)'
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
          <CustomInput
            ref={formRef}
            path="1"
            label="계정그룹명"
            required
            onFocus={handleFocus}
            onValueHelp={() => console.log('ValueHelp clicked')}
            readOnly
            style={{ marginBottom: '21px' }}
          />
          <CustomInput
            ref={formRef}
            path="2"
            label="코스트센터"
            onFocus={handleFocus}
            onValueHelp={() => console.log('ValueHelp clicked')}
            style={{ marginBottom: '21px' }}

          />
          <CustomInput
            ref={formRef}
            path="2"
            label="오더번호"
            onFocus={handleFocus}
            onValueHelp={() => console.log('ValueHelp clicked')}
            style={{ marginBottom: '21px' }}

          />
          <CustomInput
            ref={formRef}
            path="2"
            label="WBS요소"
            onFocus={handleFocus}
            onValueHelp={() => console.log('ValueHelp clicked')}
            style={{ marginBottom: '21px' }}

          />
          <CustomInput
            ref={formRef}
            path="2"
            label="전표통화금액"
            onFocus={handleFocus}
            style={{ marginBottom: '21px' }}

          />
          <CustomInput
            ref={formRef}
            path="2"
            label="현지통화금액"
            onFocus={handleFocus}
            style={{ marginBottom: '21px' }}

          />
          <CustomInput
            ref={formRef}
            path="2"
            label="항목텍스트"
            onFocus={handleFocus}
            style={{ marginBottom: '21px' }}

          />
          <CustomInput
            ref={formRef}
            path="2"
            label="지정"
            onFocus={handleFocus}
            style={{ marginBottom: '21px' }}

          />
          <CustomInput
            ref={formRef}
            path="2"
            label="기준일자"
            onFocus={handleFocus}
            style={{ marginBottom: '21px' }}

          />
          <CustomInput
            ref={formRef}
            path="2"
            label="만기계산일"
            onFocus={handleFocus}
            style={{ marginBottom: '21px' }}

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
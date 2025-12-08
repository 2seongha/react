import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  IonContent,
  IonIcon,
  IonModal,
} from "@ionic/react";
import { IonButton } from "@ionic/react";
import AppBar from "./AppBar";
import { close } from "ionicons/icons";
import "./ApprovalModal.css";
import _ from "lodash";

interface SearchHelpModalProps {
  trigger?: string;
  title?: string;
  list?: any;
}

const SearchHelpModal: React.FC<SearchHelpModalProps> = ({
  trigger,
  title,
  list
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
      onIonModalWillPresent={handleModalWillPresent}
      onIonModalDidDismiss={handleModalDidDismiss}
      mode="ios"
      ref={modalRef}
      trigger={trigger}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      expandToScroll={false}
      // className="approval-modal"
      style={{
        '--max-height': '600px',
      }}
    >
      <AppBar title={<span>{title}</span>} customEndButtons={closeButton} />
      <IonContent
        forceOverscroll={false}
      >

      </IonContent>
    </IonModal>
  );
};

export default SearchHelpModal;
import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
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
import useAppStore from "../stores/appStore";
import { pushModal } from "../App";
interface SearchHelpModalProps {
}

const SearchHelpModal: React.FC<SearchHelpModalProps> = ({
}) => {
  const searchHelp = useAppStore(state => state.searchHelp);
  const setSearchHelp = useAppStore(state => state.setSearchHelp);

  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);
  const modalRef = useRef<HTMLIonModalElement>(null);
  const modalId = 'searchHelp';

  // 닫기
  const dismiss = useCallback(() => {
    modalRef.current?.dismiss();
  }, []);

  const handleModalWillPresent = () => {
    pushModal(modalId);
    // 모달이 열릴 때 히스토리 추가
    const currentState = window.history.state;
    window.history.pushState({ ...currentState, searchHelpOpen: true }, "");
    historyPushedRef.current = true;
    closedByBackButtonRef.current = false;
  };

  const handleModalDidDismiss = () => {
    setSearchHelp({ ...searchHelp, IS_OPEN: false });
    setTimeout(() => {
      const input = searchHelp?.INPUT.current;
      if (!input) return;

      // 기존 has-focus 제거
      document.querySelectorAll('.has-focus').forEach((el) => {
        if (el !== input) el.classList.remove('has-focus');
      });

      const wasReadonly = input.hasAttribute("readonly");

      input.setAttribute("readonly", "true");
      input.setFocus();

      // 현재 input에 has-focus 추가
      input.classList.add('has-focus');

      if (!wasReadonly) {
        setTimeout(() => {
          input.removeAttribute("readonly");
        });
      }
    }, 0);

    // 일반적인 닫기 (뒤로가기가 아닌)인 경우 히스토리에서 제거
    if (historyPushedRef.current && !closedByBackButtonRef.current) {
      if (window.history.state?.searchHelpOpen) {
        window.history.back();
      }
    }
    historyPushedRef.current = false;
    closedByBackButtonRef.current = false;
  };

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    if (!searchHelp?.IS_OPEN) return;

    const handlePopState = (event: PopStateEvent) => {
      closedByBackButtonRef.current = true;
      dismiss();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [searchHelp?.IS_OPEN]);

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
      isOpen={searchHelp?.IS_OPEN}
      onIonModalWillPresent={handleModalWillPresent}
      onIonModalDidDismiss={handleModalDidDismiss}
      mode="ios"
      ref={modalRef}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      className="approval-modal"
      expandToScroll={false}
      style={{
        '--max-height': '400px',
      }}
    >
      <AppBar title={<span>{searchHelp?.TITLE}</span>} customEndButtons={closeButton} />
      <IonContent
        forceOverscroll={false}
      >

      </IonContent>
    </IonModal>
  );
};

export default SearchHelpModal;
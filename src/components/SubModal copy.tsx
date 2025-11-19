import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  IonContent,
  IonIcon,
  IonModal,
  useIonRouter,
} from "@ionic/react";
import { IonButton } from "@ionic/react";
import AppBar from "./AppBar";
import { close } from "ionicons/icons";
import "./ApprovalModal.css";
import useAppStore from "../stores/appStore";
import _ from "lodash";
import { webviewHaptic } from "../webview";

interface SubModalProps {
  trigger?: string;
  subs?: any;
  initialIndex?: number;
}

const SubModal: React.FC<SubModalProps> = ({
  trigger,
  subs,
  initialIndex
}) => {
  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);
  const modalRef = useRef<HTMLIonModalElement>(null);
  const router = useIonRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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

  const handleClose = () => {
    router.goBack();
  }

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

  useEffect(() => {
    setCurrentIndex(initialIndex ?? 0);
  }, [initialIndex]);

  const titles = useAppStore((state) => state.approvals?.TITLE.TITLE_S);
  const flds = _(subs[currentIndex])
    .pickBy((_, key) => /^FLD\d+$/.test(key))
    .toPairs()
    .sortBy(([key]) => parseInt(key.replace("FLD", ""), 10))
    .map(([_, value]) => value)
    .value();

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
      className="approval-modal"
      mode="ios"
      ref={modalRef}
      trigger={trigger}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      style={{
        "--max-height": "600px",
      }}
    >
      <AppBar title={<span style={{ marginLeft: '21px' }}>{(currentIndex ?? 0) + 1}/{subs.length}</span>} titleCenter={false} customEndButtons={closeButton} />
      <IonContent>
        {<div
          onPointerUp={(e) => {
            if (subs.length === 1) return;
            const x = e.clientX;
            const half = window.innerWidth / 2;
            webviewHaptic('mediumImpact');

            if (x < half) {
              // 왼쪽 터치 → 이전 (첫 번째면 마지막으로)
              setCurrentIndex((prev) => (prev === 0 ? subs.length - 1 : prev - 1));
            } else {
              // 오른쪽 터치 → 다음 (마지막이면 처음으로)
              setCurrentIndex((prev) => (prev === subs.length - 1 ? 0 : prev + 1));
            }
          }}
          style={{ padding: '0 21px', paddingBottom: 'calc(var(--ion-safe-area-bottom) + 12px)', overscrollBehavior: 'none' }}>
          {
            titles?.map((title: string, index: number) => (
              <div
                key={'sub-line' + index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 0',
                  borderBottom: '.5px solid var(--ion-color-step-100)',
                  alignItems: 'start',
                  fontWeight: 500
                }}>
                <span style={{ color: 'var(--ion-color-secondary)' }}>{title}</span>
                <span style={{ maxWidth: '60%', textAlign: 'end' }}>{flds[index]}</span>
              </div>
            ))
          }
        </div>}
      </IonContent>
    </IonModal >
  );
};

export default SubModal;

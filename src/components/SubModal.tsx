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
import { checkmarkCircle, close } from "ionicons/icons";
import "./ApprovalModal.css";
import { Swiper, SwiperSlide } from "swiper/react";
import useAppStore from "../stores/appStore";
import _ from "lodash";

interface SubModalProps {
  trigger?: string;
  modalTitle?: string;
  subs?: any;
  initialIndex?: number;
}

const SubModal: React.FC<SubModalProps> = ({
  trigger,
  modalTitle,
  subs,
  initialIndex
}) => {
  const router = useIonRouter();
  const modal = useRef<HTMLIonModalElement>(null);
  const textareaRef = useRef<HTMLIonTextareaElement>(null);
  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  function dismiss() {
    modal.current?.dismiss();
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

  const titles = useAppStore((state) => state.approvals?.TITLE.TITLE_S);

  return (
    <IonModal
      onIonModalWillPresent={handleModalWillPresent}
      onIonModalDidDismiss={handleModalDidDismiss}
      className="approval-modal auto-height"
      mode="ios"
      ref={modal}
      trigger={trigger}
      initialBreakpoint={0.6}
      breakpoints={[0.6, 1]}
      expandToScroll={true}
      // initialBreakpoint={1}
      // breakpoints={[0, 1]}
      style={{
        '--height': "calc(100% - 48px - var(--ion-safe-area-top))",
        // "--max-height": "calc(100% - 48px - var(--ion-safe-area-top))",
      }}
    >
      <AppBar title={<span style={{ marginLeft: '21px' }}>{modalTitle}</span>} customEndButtons={closeButton} titleCenter={false} />
      {/* <div className="inner-content"> */}
      {/* <IonContent className="approval-modal-ion-content" scrollY={false} scrollEvents={false}> */}
      <Swiper >
        {subs?.map((sub: any) => {
          const flds = _(sub)
            .pickBy((_, key) => /^FLD\d+$/.test(key))
            .toPairs()
            .sortBy(([key]) => parseInt(key.replace("FLD", ""), 10))
            .map(([_, value]) => value)
            .value();

          return <SwiperSlide
            style={{
              overflow: "auto",
              padding: "0px 21px 0 21px",
            }}
          >
            {/* {titles?.map((title: string, index: number) => (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{title}</span>
                  <span>{flds[index]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{title}</span>
                  <span>{flds[index]}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{title}</span>
                  <span>{flds[index]}</span>
                </div>
              </>
            ))} */}
            {Array.from({ length: 1000, }).map((_, index) => <span style={{padding:'12px', display:'block'}}>asdfasdfasdfasdf{index}</span>)}
          </SwiperSlide>
        }
        )}
      </Swiper>
      {/* </IonContent> */}
      {/* </div> */}
    </IonModal>
  );
};

export default SubModal;

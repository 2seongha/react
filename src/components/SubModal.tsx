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
      // className="approval-modal auto-height"
      mode="ios"
      ref={modal}
      trigger={trigger}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      expandToScroll={false}
      style={{
        '--height': "auto",
        // "--max-height": "600px",
      }}
    >
      <AppBar title={<span style={{ marginLeft: '14px' }}>{subs?.[initialIndex ?? 0]?.TITLE}</span>} customEndButtons={closeButton} titleCenter={false} />
      {/* <IonContent> */}
      <Swiper style={{ width: '100%' }}>
        <SwiperSlide
          style={{
            overflow: "auto",
            padding: "0px 21px 0 21px",
            maxHeight: '600px'
          }}
        >
          {titles?.map((title: string, index: number) => (
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '48px' }}>
              <span>{title}</span>
              <span>sd</span>
            </div>
          ))}
        </SwiperSlide>
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
              maxHeight: '600px',
            }}
          >
            {titles?.map((title: string, index: number) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '48px' }}>
                <span>{title}</span>
                <span>{flds[index]}</span>
              </div>
            ))}
            {titles?.map((title: string, index: number) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '48px' }}>
                <span>{title}</span>
                <span>{flds[index]}</span>
              </div>
            ))}
            {titles?.map((title: string, index: number) => (
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', height: '48px' }}>
                <span>{title}</span>
                <span>{flds[index]}</span>
              </div>
            ))}
          </SwiperSlide>
        }
        )}
      </Swiper>
      {/* </IonContent> */}
    </IonModal>
  );
};

export default SubModal;

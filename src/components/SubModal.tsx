import React, { useState, useRef, useMemo, useEffect, useLayoutEffect } from "react";
import {
  IonContent,
  IonFooter,
  IonIcon,
  IonModal,
  useIonRouter,
} from "@ionic/react";
import { IonButton } from "@ionic/react";
import AppBar from "./AppBar";
import { close } from "ionicons/icons";
import "./ApprovalModal.css";
import { Swiper, SwiperSlide } from "swiper/react";
import useAppStore from "../stores/appStore";
import _ from "lodash";

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
  const swiperRef = useRef<any>(null); // Swiper 인스턴스
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(swiperRef.current?.activeIndex ?? 0);
  }, [swiperRef.current]);

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

  const titles = useAppStore((state) => state.approvals?.TITLE.TITLE_S);
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
      className="approval-modal"
      style={{
        '--max-height': '600px',
      }}
    >
      <AppBar title={<></>} titleCenter={false} customEndButtons={closeButton} />
      <IonContent
        style={{
          overscrollBehavior: 'none',           // 스크롤 끝에서의 bounce 비활성화
          WebkitOverflowScrolling: 'auto',       // iOS에서의 스크롤 탄력 제거
        }}
      >
        <div style={{
          height: '88px',
          paddingBottom: 'var(--ion-safe-area-bottom)',
          position: 'fixed',
          zIndex: 1,
          top: '512px',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--ion-background-color)',
          gap: '8px'
        }}>
          {
            subs?.map((sub: any, index: number) => <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '12px',
              backgroundColor: currentIndex === index ? 'var(--ion-color-primary)' : 'var(--ion-color-step-400)'
            }}></span>)
          }
        </div>
        <Swiper
          style={{
            zIndex: 0,
            background: 'var(--ion-background-color)',
            marginBottom: '42px'
          }}
          initialSlide={initialIndex}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => {
            setCurrentIndex(swiper.activeIndex);
          }}
        >
          {subs?.map((sub: any) => {
            const flds = _(sub)
              .pickBy((_, key) => /^FLD\d+$/.test(key))
              .toPairs()
              .sortBy(([key]) => parseInt(key.replace("FLD", ""), 10))
              .map(([_, value]) => value)
              .value();

            return <SwiperSlide
              style={{
                // height:'100%',
                overflow: "auto",
                padding: "0px 24px calc(var(--ion-safe-area-bottom) + 12px) 24px",
              }}
            >
              {titles?.map((title: string, index: number) => (
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
              ))}
            </SwiperSlide>
          }
          )}
        </Swiper>
      </IonContent>
    </IonModal>
  );
};

export default SubModal;
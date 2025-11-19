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
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

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
  const router = useIonRouter();

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
    const modalEl = modalRef.current;
    if (!modalEl) return;

    const gesture = (modalEl as any)?.gesture;
    if (gesture) gesture.enable(false);
    
  }, [isModalOpen]);

  const titles = useAppStore((state) => state.approvals?.TITLE.TITLE_S);

  return (
    <IonModal
      onIonModalWillPresent={handleModalWillPresent}
      onIonModalDidDismiss={handleModalDidDismiss}
      mode="ios"
      ref={modalRef}
      trigger={trigger}
      initialBreakpoint={1}
      breakpoints={[0, 1]}
      expandToScroll={true}
      className="approval-modal fixed"
      style={{
        '--max-height': '600px',
        '--border-radius': '20px'
      }}
    >
      <IonContent
        scrollEvents={false}
        scrollY={false}
        scrollX={false}
      >
        <div className="grab-indicator no-shadow" style={{
          position: 'fixed',
          width: '100%',
          top: 0,
          backgroundColor: 'var(--ion-background-color2)',
          zIndex: 2,
          boxShadow: 'none',
        }}>
          <span></span>
        </div>
        <Swiper
          style={{
            height: '100%',
            paddingTop: '28px',
            paddingBottom: '32px',
            background: 'var(--ion-background-color)',
          }}
          initialSlide={initialIndex}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            requestAnimationFrame(() => {
              const maxHeight = Math.min(swiper.el.scrollHeight + 110, 600); // 헤더 28 + 푸터 82
              modalRef.current?.style.setProperty("--max-height", `${maxHeight}px`);
            });
          }}
          pagination={{
            dynamicBullets: true,
          }}
          modules={[Pagination]}
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
                height: '100%',
                overflow: "auto",
                padding: "0px 24px var(--ion-safe-area-bottom) 24px",
              }}
              onScrollEnd={(e) => {
                const modalEl = modalRef.current;
                if (!modalEl) return;

                const gesture = (modalEl as any)?.gesture;
                if (gesture) gesture.enable(e.currentTarget.scrollTop <= 0);
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
      <IonFooter style={{
        boxShadow: 'none',
      }}>
        <div
          style={{
            height: "auto",
            width: "100%",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "12px 21px",
            gap: "12px",
            paddingBottom: 'calc( var(--ion-safe-area-bottom) + 12px )',
            backgroundColor: 'var(--ion-background-color)'
          }}
        >
          <IonButton
            mode="md"
            color="light"
            style={{
              flex: 1,
              height: "58px",
              fontSize: "18px",
              fontWeight: "600",
            }}
            onClick={handleClose}
          >
            <span>닫기</span>
          </IonButton>
        </div>
      </IonFooter>
    </IonModal >
  );
};

export default SubModal;

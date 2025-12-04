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
import useAppStore from "../stores/appStore";
import _ from "lodash";
import CachedImage from "./CachedImage";
import { emailIcon } from "../assets/images";
interface NotificationPopupProps {
  trigger?: string;
}

const NotificationPopupModal: React.FC<NotificationPopupProps> = ({
  trigger,
}) => {
  const notifications = useAppStore((state) => state.notifications?.filter(notification => notification.READ_YN === 'N'));
  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);
  const modalRef = useRef<HTMLIonModalElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useIonRouter();
  const setSelectedTab = useAppStore(state => state.setSelectedTab);

  function dismiss() {
    modalRef.current?.dismiss();
  }

  const typeCounts = useMemo(() => {
    return notifications?.reduce((acc, cur) => {
      if (!cur.TYPE) return acc;
      acc[cur.TYPE] = (acc[cur.TYPE] || 0) + 1;
      return acc;
    }, { START: 0, APPROVE: 0, REJECT: 0 }) ?? { START: 0, APPROVE: 0, REJECT: 0 };
  }, [notifications]);

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

  return (
    <IonModal
      onIonModalWillPresent={handleModalWillPresent}
      onIonModalDidDismiss={handleModalDidDismiss}
      className='custom-dialog'
      mode="ios"
      ref={modalRef}
      trigger={trigger}
      backdropDismiss={false}
      style={{
        alignItems: 'end',
        '--width': 'calc(100% - 22px)',
        '--height': 'calc(100% - 22px)',
        '--background': 'transparent',
        paddingBottom: 'calc(11px + var(--ion-safe-area-bottom))',
        '--border-radius': '21px',
      }}
    >
      {/* <AppBar title={<></>} titleCenter={false} customEndButtons={closeButton} />  */}
      <IonContent
        scrollY={false}
        scrollX={false}
        scrollEvents={false}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}>
          <div style={{ height: '48px', display: 'flex', width: '100%', justifyContent: 'end', alignItems: 'center', paddingRight: '4px', position: 'absolute', top: 0 }}>
            {/* <span style={{ fontSize: '16px', fontWeight: '600', paddingLeft:'21px' }}>새로운 알림이 있습니다</span> */}
            <IonButton
              mode="md"
              shape="round"
              // color={"medium"}
              className="app-bar-button"
              onClick={dismiss}
              style={{
                backgroundColor: 'transparent',
                '--background': 'transparent'
              }}
            >
              <IonIcon icon={close} style={{ width: '24px', height: '24px' }} />
            </IonButton>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'start',
            alignItems: 'center',
            paddingTop: '36px',
            width: '100%',
            gap: '12px',
            paddingLeft: '21px'
          }}>
            <div style={{ backgroundColor: 'rgba(var(--ion-color-primary-rgb), .04)', padding: '4px', borderRadius: '50px' }}>
              <CachedImage src={emailIcon} width='48px'></CachedImage>
            </div>
            <span style={{ fontSize: '16px', fontWeight: '600' }}>새로운 알림이 도착했습니다.</span>
          </div>
          <div style={{
            flex: 1,
            width: '100%',
            padding: '28px 21px 28px 21px'
          }}>
            <div style={{
              backgroundColor: 'var(--ion-background-color2)',
              height: '100%',
              padding: '21px 0',
              display: 'flex',
              borderRadius: '18px'
            }}>
              <div style={{
                width: '33.33%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', position: 'relative' }}>상신{typeCounts.START > 0 && <span
                  style={{
                    position: 'absolute',
                    width: '6px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: 'var(--ion-color-primary)',
                    top: '-4px',
                    right: '-16px'
                  }}></span>}</span>
                <span style={{ color: 'var(--ion-color-secondary)', fontSize: '14px', fontWeight: '500' }}>{typeCounts.START}건</span>
              </div>
              <div style={{
                width: '33.33%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                borderLeft: '3px dotted var(--ion-color-step-200)',
                borderRight: '3px dotted var(--ion-color-step-200)',
                gap: '4px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', position: 'relative' }}>승인{typeCounts.APPROVE > 0 && <span
                  style={{
                    position: 'absolute',
                    width: '6px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: 'var(--ion-color-success)',
                    top: '-4px',
                    right: '-16px'
                  }}></span>}</span>
                <span style={{ color: 'var(--ion-color-secondary)', fontSize: '14px', fontWeight: '500' }}>{typeCounts.APPROVE}건</span>
              </div>
              <div style={{
                width: '33.33%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <span style={{ fontSize: '14px', fontWeight: '500', position: 'relative' }}>반려{typeCounts.REJECT > 0 && <span
                  style={{
                    position: 'absolute',
                    width: '6px',
                    height: '6px',
                    borderRadius: '3px',
                    backgroundColor: 'var(--ion-color-danger)',
                    top: '-4px',
                    right: '-16px'
                  }}></span>}</span>
                <span style={{ color: 'var(--ion-color-secondary)', fontSize: '14px', fontWeight: '500' }}>{typeCounts.REJECT}건</span>
              </div>
            </div>
          </div>
          <div
            style={{
              height: "auto",
              width: "100%",
              borderRadius: "16px 16px 0 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "21px",
              gap: "12px",
              paddingBottom: '21px',
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
              onClick={dismiss}
            >
              <span>닫기</span>
            </IonButton>
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
                dismiss();
                setTimeout(() => {
                  setSelectedTab(1);
                  router.push('/app/notifications', 'none', 'replace');
                }, 250);
              }}
            >
              <span>확인하기</span>
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default NotificationPopupModal;
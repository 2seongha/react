import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  IonContent,
  IonIcon,
  IonItem,
  IonModal,
} from "@ionic/react";
import { IonButton } from "@ionic/react";
import AppBar from "./AppBar";
import { close, star } from "ionicons/icons";
import "./ApprovalModal.css";
import _ from "lodash";
import useAppStore from "../stores/appStore";
import { pushModal } from "../App";
import LoadingIndicator from "./LoadingIndicator";
import NoData from "./NoData";
interface SearchHelpModalProps {
}

const SearchHelpModal: React.FC<SearchHelpModalProps> = ({
}) => {
  const searchHelp = useAppStore(state => state.searchHelp);
  const setSearchHelp = useAppStore(state => state.setSearchHelp);
  const [list, setList] = useState<any[] | null>(null);

  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);
  const modalRef = useRef<HTMLIonModalElement>(null);
  const modalId = 'searchHelp';

  // 닫기
  const dismiss = useCallback(() => {
    modalRef.current?.dismiss();
  }, []);

  const handleModalWillPresent = () => {
    const initList = async () => {
      const list = await searchHelp?.onValueHelp();
      setList(list);
    };
    initList();

    pushModal(modalId);
    // 모달이 열릴 때 히스토리 추가
    const currentState = window.history.state;
    window.history.pushState({ ...currentState, searchHelpOpen: true }, "");
    historyPushedRef.current = true;
    closedByBackButtonRef.current = false;
  };

  const handleModalDidDismiss = () => {
    setSearchHelp({ isOpen: false });
    setList(null);
    setTimeout(() => {
      const input = searchHelp?.input.current;
      if (!input) return;
      input.classList.add('has-focus');
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
    if (!searchHelp?.isOpen) return;

    const handlePopState = (event: PopStateEvent) => {
      closedByBackButtonRef.current = true;
      dismiss();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [searchHelp?.isOpen]);

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
      isOpen={searchHelp?.isOpen}
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
      <AppBar title={<span>{searchHelp?.title}</span>} customEndButtons={closeButton} />
      <IonContent
        onIonScrollStart={async (e: Event) => {
          // @ts-ignore
          const modalEl = modalRef.current;
          if (!modalEl) return;
          // @ts-ignore
          const gesture = modalEl.gesture; // internal API
          gesture.enable(false);
        }}
        onIonScrollEnd={() => {
          const modalEl = modalRef.current;
          if (!modalEl) return;
          // @ts-ignore
          const gesture = modalEl.gesture;
          gesture.enable(true);
        }}
        forceOverscroll={false}
        scrollEvents
      >
        {list === null
          ? <LoadingIndicator
            color="var(--ion-text-color)"
            style={{
              margin: '0 auto',
              marginTop: '120px'
            }} />
          : _.isEmpty(list) ? <NoData />
            : list.map((item, index) => {
              return (
                <IonItem
                  key={'search-help-item' + index}
                  mode="md"
                  button
                  style={{
                    '--min-height': '52px',
                    '--padding-start': '21px',
                    '--padding-end': '21px',
                    marginBottom: list.length - 1 === index ? 'var(--ion-safe-area-bottom)' : 0,
                    borderBottom: '.5px solid var(--ion-color-step-100)',
                  }}
                  onClick={() => {
                    searchHelp?.onChange(item);
                    dismiss();
                  }}
                >
                  {item.Type === 'VKORG' ?
                    <>
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>{item.Key}-{item.Add1}-{item.Add3}</span>
                      <div
                        slot="end"
                        style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: 'var(--ion-color-secondary)'
                        }}>
                        <span>{item.Name}-{item.Add2}-{item.Add4}</span>
                      </div>
                    </>
                    :
                    <>
                      {item.Favorite && <IonIcon src={star} color="primary" size="small" style={{ marginRight: '8px' }}></IonIcon>}
                      <span
                        style={{
                          fontSize: '13px',
                          fontWeight: '500'
                        }}>{item.Type === 'ACCOUNT_CODE_T' ? item.Name : item.Key}</span>
                      <div
                        slot="end"
                        style={{
                          fontSize: '13px',
                          fontWeight: '500',
                          color: 'var(--ion-color-secondary)'
                        }}>
                        {item.Type === 'ACCOUNT_CODE_T'
                          ? <>
                            <span>{item.Add1}</span>
                            <span> ({item.KeyName})</span>
                          </>
                          : <span>{item.Name}</span>
                        }
                      </div>
                    </>
                  }
                </IonItem>
              );
            })
        }
      </IonContent>
    </IonModal>
  );
};

export default SearchHelpModal;
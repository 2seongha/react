import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  IonContent,
  IonModal,
} from "@ionic/react";
import { IonButton } from "@ionic/react";
import AppBar from "./AppBar";
import _ from "lodash";
import CustomInput from "./CustomInput";
import { getTopModalId, popModal, pushModal } from "../App";
import { getSearchHelp } from "../stores/service";
import { FormRef } from "../stores/types";
import dayjs from "dayjs";

interface NotificationPopupProps {
  trigger?: string;
  docItem?: any;
  modalRef: any;
}

const PersonalExpenseAddModal: React.FC<NotificationPopupProps> = ({
  trigger,
  docItem,
  modalRef
}) => {
  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);
  // const modalRef = useRef<HTMLIonModalElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaveEnabled, setIsSaveEnabled] = useState(false);
  const formRef = useRef<FormRef>({});
  const modalId = 'addItem';

  // docItem 변경 시 form 재할당
  useEffect(() => {
    console.log(docItem)
    formRef.current = docItem || {};
  }, [docItem]);

  const checkRequired = useCallback(() => {
    if (formRef.current.ACCOUNT_CODE_T
      && formRef.current.WRBTR
      && formRef.current.SGTXT) {
      setIsSaveEnabled(true);
    } else {
      setIsSaveEnabled(false);
    }
  }, []);

  function dismiss() {
    modalRef.current?.dismiss();
  }

  const handleModalWillPresent = () => {
    setIsModalOpen(true);
    pushModal(modalId);
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

    // 스택에서 제거
    if (getTopModalId() === modalId) {
      popModal();
    }
  };

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    if (!isModalOpen) return;

    const handlePopState = (event: PopStateEvent) => {
      if (getTopModalId() === 'searchHelp') {
        return popModal();
      }
      if (getTopModalId() !== modalId) return;
      if (isModalOpen) {
        closedByBackButtonRef.current = true;
        dismiss();
        popModal();
      }
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isModalOpen]);

  const handleFocus = (e: any) => {
    document.querySelectorAll('.has-focus').forEach((el) => {
      el.classList.remove('has-focus');
    });

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
      ref={modalRef}
      onIonModalWillPresent={handleModalWillPresent}
      onIonModalDidDismiss={handleModalDidDismiss}
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
            marginLeft: '8px',
            width: '64px',
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
            formRef={formRef}
            value="$ACCOUNT_CODE_T"
            helperText="GL계정 : $SAKNR | GL계정명 : $SAKNR_T"
            label="계정그룹명"
            required
            onFocus={handleFocus}
            onValueHelp={() => getSearchHelp('ACCOUNT_CODE_T', 'IA103')}
            onChange={(value) => {
              formRef.current.ACCOUNT_CODE_T = value;
              if (!value) {
                formRef.current.ACCOUNT_CODE = '';
                formRef.current.SAKNR = '';
                formRef.current.SAKNR_T = '';
              }
              checkRequired();
            }}
            onChangeValueHelp={(value) => {
              formRef.current.ACCOUNT_CODE = value.Key;
              formRef.current.ACCOUNT_CODE_T = value.Name;
              formRef.current.SAKNR = value.Add1;
              formRef.current.SAKNR_T = value.KeyName;
            }}
            readOnly
            clearInput
            style={{ marginBottom: '28px' }}
          />
          <CustomInput
            formRef={formRef}
            value="$KOSTL"
            helperText="코스트센터명 : $KOSTL_T"
            label="코스트센터"
            onFocus={handleFocus}
            onValueHelp={() => getSearchHelp('KOSTL', 'IA103')}
            onChange={(value) => {
              formRef.current.KOSTL = value;
              if (!value) {
                formRef.current.KOSTL_T = '';
              }
            }}
            onChangeValueHelp={(value) => {
              formRef.current.KOSTL = value.Key;
              formRef.current.KOSTL_T = value.Name;
            }}
            style={{ marginBottom: '28px' }}
            clearInput
          />
          <CustomInput
            formRef={formRef}
            value="$AUFNR"
            helperText="오더명 : $AUFNR_T"
            label="오더번호"
            onFocus={handleFocus}
            onValueHelp={() => getSearchHelp('AUFNR', 'IA103')}
            onChange={(value) => {
              formRef.current.AUFNR = value;
              if (!value) {
                formRef.current.AUFNR_T = '';
              }
            }}
            onChangeValueHelp={(value) => {
              formRef.current.AUFNR = value.Key;
              formRef.current.AUFNR_T = value.Name;
            }}
            style={{ marginBottom: '28px' }}
            clearInput
          />
          <CustomInput
            formRef={formRef}
            value="$PROJK"
            helperText="WBS요소명 : $PROJK_T"
            label="WBS요소"
            onFocus={handleFocus}
            onValueHelp={() => getSearchHelp('PROJK', 'IA103')}
            onChange={(value) => {
              formRef.current.PROJK = value;
              if (!value) {
                formRef.current.PROJK_T = '';
              }
            }}
            onChangeValueHelp={(value) => {
              formRef.current.PROJK = value.Key;
              formRef.current.PROJK_T = value.Name;
            }}
            style={{ marginBottom: '28px' }}
            clearInput
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CustomInput
              currency
              formRef={formRef}
              value="$WRBTR"
              label="전표통화금액"
              required
              formatter={(value) => {
                if (!value) return "";

                const raw = value
                  .replace(/[^0-9\-]/g, "") // 숫자, - 만 허용
                  .replace(/(?!^)-/g, "");  // - 는 맨 앞만

                if (raw === "" || raw === "-") return raw;

                return Number(raw).toLocaleString("ko-KR");
              }}
              onFocus={handleFocus}
              onChange={(value) => {
                formRef.current.WRBTR = String(Math.trunc(Number(value)));
                checkRequired();
              }}
              style={{ marginBottom: '28px', textAlign: 'right' }}
              inputMode='numeric'
            />
            <span style={{ paddingBottom: '10px', color: 'var(--ion-color-step-600)' }}>{docItem?.WAERS}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ion-color-step-600)' }}>
            <CustomInput
              currency
              formRef={formRef}
              value="$DMBTR"
              label="현지통화금액"
              formatter={(value) => {
                if (!value) return "";

                const raw = value
                  .replace(/[^0-9\-]/g, "") // 숫자, - 만 허용
                  .replace(/(?!^)-/g, "");  // - 는 맨 앞만

                if (raw === "" || raw === "-") return raw;

                return Number(raw).toLocaleString("ko-KR");
              }}
              onFocus={handleFocus}
              onChange={(value) => {
                formRef.current.DMBTR = String(Math.trunc(Number(value)));
              }}
              style={{ marginBottom: '28px', textAlign: 'right' }}
              inputMode='numeric'
            />
            <span style={{ paddingBottom: '10px' }}>{docItem?.HWAER}</span>
          </div>

          <CustomInput
            formRef={formRef}
            value="$SGTXT"
            label="항목텍스트"
            required
            onFocus={handleFocus}
            onChange={(value) => {
              formRef.current.SGTXT = value;
              checkRequired();
            }}
            style={{ marginBottom: '28px' }}
            clearInput
          />
          <CustomInput
            formRef={formRef}
            value="$ZUONR"
            label="지정"
            onFocus={handleFocus}
            onChange={(value) => {
              formRef.current.ZUONR = value;
            }}
            style={{ marginBottom: '28px' }}
            clearInput
          />
          <CustomInput
            formRef={formRef}
            value="$VALUT"
            label="기준일자"
            readOnly
            date
            formatter={(value) => {
              return dayjs(value).format('YYYY-MM-DD');
            }}
            onFocus={handleFocus}
            onChange={(value) => {
              formRef.current.VALUT = value;
            }}
            style={{ marginBottom: '28px' }}
          />
          <CustomInput
            formRef={formRef}
            value="$ZFBDT"
            label="만기계산일"
            readOnly
            date
            formatter={(value) => {
              return dayjs(value).format('YYYY-MM-DD');
            }}
            onFocus={handleFocus}
            onChange={(value) => {
              formRef.current.ZFBDT = value;
            }}
            style={{ marginBottom: '28px' }}
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
              disabled={!isSaveEnabled}
              onClick={() => {
                dismiss();
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
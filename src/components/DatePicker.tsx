import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  IonDatetime,
  IonPopover,
} from "@ionic/react";
import "./ApprovalModal.css";
import _ from "lodash";
import useAppStore from "../stores/appStore";
import { pushModal } from "../App";
import dayjs from "dayjs";
interface DatePickerModalProps {
}

const DatePickerModal: React.FC<DatePickerModalProps> = ({
}) => {
  const datePicker = useAppStore(state => state.datePicker);
  const setDatePicker = useAppStore(state => state.setDatePicker);

  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);
  const modalRef = useRef<HTMLIonPopoverElement>(null);
  const modalId = 'datePicker';

  // 닫기
  const dismiss = useCallback(() => {
    setDatePicker({ ...datePicker, isOpen: false });
  }, [datePicker]);

  const handleModalWillPresent = (event: Event) => {
    pushModal(modalId);

    if (modalRef.current && event) {
      modalRef.current.event = event; // 위치 계산용 이벤트
    }

    // 모달이 열릴 때 히스토리 추가
    const currentState = window.history.state;
    window.history.pushState({ ...currentState, datePickerOpen: true }, "");
    historyPushedRef.current = true;
    closedByBackButtonRef.current = false;
    if (modalRef.current) modalRef.current.event = datePicker.buttonEvent;
  };

  const handleModalDidDismiss = () => {
    setDatePicker({ ...datePicker, isOpen: false });
    setTimeout(() => {
      const input = datePicker?.input.current;
      if (!input) return;
      input.classList.add('has-focus');
    }, 0);

    // 일반적인 닫기 (뒤로가기가 아닌)인 경우 히스토리에서 제거
    if (historyPushedRef.current && !closedByBackButtonRef.current) {
      if (window.history.state?.datePickerOpen) {
        window.history.back();
      }
    }
    historyPushedRef.current = false;
    closedByBackButtonRef.current = false;
  };

  // 브라우저 뒤로가기 버튼 처리
  useEffect(() => {
    if (!datePicker?.isOpen) return;

    const handlePopState = (event: PopStateEvent) => {
      closedByBackButtonRef.current = true;
      dismiss();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [datePicker?.isOpen]);

  return (
    <IonPopover
      mode="ios"
      ref={modalRef}
      side='bottom'
      alignment="center"
      isOpen={datePicker?.isOpen && !!datePicker.buttonEvent} // 이벤트가 준비될 때까지 열지 않음
      event={datePicker.buttonEvent}
      onIonPopoverWillPresent={() => handleModalWillPresent(datePicker.buttonEvent)}
      onIonPopoverDidDismiss={handleModalDidDismiss}
      showBackdrop={true}
      style={{
        ...(datePicker.fixed ? { '--offset-y': 0 } : {}),
      }}
    >
      <IonDatetime
        mode='md'
        class='date-picker-pop-up'
        onClick={(e) => {
          const path = (e.nativeEvent as any).composedPath?.() as EventTarget[];
          const isDayButtonClicked = path?.some((el) =>
            el instanceof HTMLElement &&
            el.classList.contains('calendar-day-wrapper')
          );
          if (isDayButtonClicked) {
            if (typeof (e.target as any).closest('ion-datetime')?.value === 'string') {
              let date = (e.target as any).closest('ion-datetime').value;
              date = dayjs(date).format('YYYYMMDD');
              datePicker?.onChange(date);
              dismiss();
            }
          }
        }}
        presentation="date"
        locale="ko-KR"
      />
    </IonPopover>
  );
};

export default DatePickerModal;
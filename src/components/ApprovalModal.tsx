import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Dialog,
} from '@mui/material';
import { IonButtons, IonContent, IonHeader, IonIcon, IonModal, IonTextarea, IonTitle, IonToolbar } from '@ionic/react';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import { IonButton } from '@ionic/react';
import AppBar from './AppBar';
import { close } from 'ionicons/icons';
import './ApprovalModal.css';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ApprovalModalProps {
  isOpen: boolean;
  trigger: string;
  onDidDismiss: () => void;
  title: string;
  subtitle?: string;
  message?: string;
  placeholder?: string;
  cancelText?: string;
  confirmText?: string;
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'danger';
  onCancel?: () => void;
  onConfirm?: (textValue: string) => void;
  maxLength?: number;
  required?: boolean;
  page?: any;
}

const ApprovalModal: React.FC<ApprovalModalProps> = ({
  isOpen,
  trigger,
  onDidDismiss,
  title,
  subtitle,
  message,
  placeholder = '내용을 입력해주세요',
  cancelText = '취소',
  confirmText = '확인',
  confirmColor = 'primary',
  onCancel,
  onConfirm,
  maxLength = 500,
  required = false,
  page = undefined,
}) => {

  // 브라우저 뒤로가기 버튼 처리
  // useEffect(() => {
  //   if (!isOpen) return;

  //   // 팝업이 열릴 때 history에 가상 상태 추가
  //   const currentState = window.history.state;
  //   window.history.pushState({ ...currentState, modalOpen: true }, '');

  //   const handlePopState = (event: PopStateEvent) => {
  //     if (isOpen) {
  //       handleCancel();
  //     }
  //   };

  //   window.addEventListener('popstate', handlePopState);

  //   return () => {
  //     window.removeEventListener('popstate', handlePopState);
  //   };
  // }, [isOpen]);
  const modal = useRef<HTMLIonModalElement>(null);
  const [canDismiss, setCanDismiss] = useState(true);
  const [textValue, setTextValue] = useState('');

  function dismiss() {
    modal.current?.dismiss();
  }

  const handleTextChange = (e: any) => {
    const value = (e.target as HTMLTextAreaElement).value;
    setTextValue(value);
  };

  const handelModalWillPresent = () => {
    setTextValue('');
  };

  // 닫기 버튼 컴포넌트 - AppBar 버튼과 동일한 스타일
  const closeButton = useMemo(() => (
    <IonButton
      mode='md'
      shape='round'
      color={'medium'}
      className="app-bar-button"
      onClick={dismiss}
    >
      <IonIcon icon={close} />
    </IonButton>
  ), []);

  return (
    <IonModal
      onIonModalWillPresent={handelModalWillPresent}
      className='approval-modal'
      mode='ios'
      ref={modal}
      trigger={trigger}
      canDismiss={canDismiss}
      initialBreakpoint={1} breakpoints={[0, 1]}
      style={{
        '--max-height': 'calc(100% - 48px)',
      }}
    >
      <AppBar
        title={<></>}
        customEndButtons={closeButton}
      />
      <IonContent>
        <div className='approval-modal-title-wrapper'>
          <span>임직원 개인경비 <span style={{ color: 'var(--ion-color-primary)' }}>1건</span>을</span>
          <span><span style={{ color: 'var(--ion-color-primary)' }}>{title}</span> 하시겠습니까?</span>
        </div>
        <div className='approval-modal-content-wrapper'>
          <span style={{ fontWeight: '600' }}>결재 의견</span>
          <IonTextarea
            mode='md'
            style={{
              marginTop: '8px',
              '--border-radius': '16px',
            }}
            rows={5}
            value={textValue}
            onInput={handleTextChange}
            labelPlacement='start'
            fill="outline"
            placeholder="결재 의견을 입력해 주세요."
          ></IonTextarea>
        </div>
        <div style={{ padding: '8px', position: 'absolute', bottom: 0, width: '100%' }}>
          <IonButton
            mode='md'
            color={confirmColor}
            // color='danger'
            // onClick={handleConfirm}
            disabled={required && !textValue?.trim()}
            style={{
              height: '48px',
              width: '100%',
              flex: 1,
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            <span>{confirmText}</span>
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
    // <Dialog
    //   open={isOpen}
    //   onClose={onDidDismiss}
    //   maxWidth="sm"
    //   fullWidth
    //   slots={{
    //     transition: Transition,
    //   }}
    //   sx={{
    //     '& .MuiDialog-paper': {
    //       borderRadius: '18px',
    //       margin: '16px',
    //       backgroundColor: 'var(--ion-item-background)',
    //       color: 'var(--ion-text-color)'
    //     }
    //   }}
    // >
    //   <div style={{ padding: '16px' }}>
    //     <span style={{ textAlign: 'center', width: '100%' }}>{title}</span>
    //     <IonTextarea
    //       style={{
    //         margin: '16px 0',
    //         '--border-radius': '16px',
    //       }}
    //       rows={5}
    //       value={textValue}
    //       onInput={handleTextChange}
    //       labelPlacement='start'
    //       fill="outline"
    //       placeholder="결재 의견"
    //     ></IonTextarea>
    //     <div style={{ height: '48px', display: 'flex', gap: '8px' }}>
    //       <IonButton
    //         mode='md'
    //         onClick={handleCancel}
    //         color='light'
    //         style={{
    //           height: '100%',
    //           flex: 1,
    //           borderRadius: '12px'
    //         }}
    //       >
    //         <span>{cancelText}</span>
    //       </IonButton>
    //       <IonButton
    //         mode='md'
    //         color={confirmColor}
    //         // color='danger'
    //         onClick={handleConfirm}
    //         disabled={required && !textValue.trim()}
    //         style={{
    //           height: '100%',
    //           flex: 1,
    //           borderRadius: '12px',
    //         }}
    //       >
    //         <span>{confirmText}</span>
    //       </IonButton>
    //     </div>
    //   </div>
    // </Dialog>
  );
};

export default ApprovalModal;
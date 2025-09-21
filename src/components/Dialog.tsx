import { IonButton, IonContent, IonHeader, IonIcon, IonInput, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { close } from 'ionicons/icons';
import AppBar from './AppBar';
import React, { ReactNode, useEffect, useRef, useMemo, useState } from 'react';
import CustomInput from './CustomInput';


interface CustomDialogProps {
  trigger: string;
  title?: ReactNode;
  message?: ReactNode;
  body?: ReactNode;

  // 첫 번째 버튼 (일반적으로 취소)
  firstButtonText?: string;
  firstButtonColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'light' | 'medium' | 'dark';
  firstButtonStyle?: React.CSSProperties;
  onFirstButtonClick?: () => void;
  showFirstButton?: boolean;

  // 두 번째 버튼 (일반적으로 확인)
  secondButtonText?: string;
  secondButtonColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'light' | 'medium' | 'dark';
  secondButtonStyle?: React.CSSProperties;
  onSecondButtonClick?: () => void;
  showSecondButton?: boolean;

  // 단일 버튼 모드
  singleButton?: boolean;
  singleButtonText?: string;
  singleButtonColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success' | 'light' | 'medium' | 'dark';
  singleButtonStyle?: React.CSSProperties;
  onSingleButtonClick?: () => void;

  // 스타일링
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  fullWidth?: boolean;
  titleAlign?: 'left' | 'center' | 'right';
  dialogStyle?: React.CSSProperties;
  contentStyle?: React.CSSProperties;

  // 기능
  preventClose?: boolean; // ESC나 외부 클릭으로 닫기 방지
  onDidDismiss?: () => void;
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  trigger,
  onDidDismiss,
  title,
  message,
  body,
  firstButtonText = '취소',
  firstButtonColor = 'light',
  firstButtonStyle,
  onFirstButtonClick,
  showFirstButton = true,
  secondButtonText = '확인',
  secondButtonColor = 'primary',
  secondButtonStyle,
  onSecondButtonClick,
  showSecondButton = true,
  singleButton = false,
  singleButtonText = '확인',
  singleButtonColor = 'primary',
  singleButtonStyle,
  onSingleButtonClick,
  maxWidth = 'sm',
  fullWidth = true,
  titleAlign = 'center',
  dialogStyle,
  contentStyle,
  preventClose = false
}) => {
  const modal = useRef<HTMLIonModalElement>(null);
  const [canDismiss, setCanDismiss] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const historyPushedRef = useRef(false);
  const closedByBackButtonRef = useRef(false);

  function dismiss() {
    modal.current?.dismiss();
  }

  const handleModalWillPresent = () => {
    setIsModalOpen(true);
    // 모달이 열릴 때 히스토리 추가
    const currentState = window.history.state;
    window.history.pushState({ ...currentState, modalOpen: true }, '');
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
    onDidDismiss?.();
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

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isModalOpen]);

  const handleFirstButton = () => {
    if (onFirstButtonClick) {
      onFirstButtonClick();
    } else {
      dismiss();
    }
  };

  const handleSecondButton = () => {
    if (onSecondButtonClick) {
      onSecondButtonClick();
    } else {
      dismiss();
    }
  };

  const handleSingleButton = () => {
    if (onSingleButtonClick) {
      onSingleButtonClick();
    } else {
      dismiss();
    }
  };

  // 닫기 버튼 컴포넌트
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

  const renderContent = () => {
    if (body) return body;
    if (message) return <div style={{ margin: '16px 0' }}>{message}</div>;
    return null;
  };

  const renderButtons = () => {
    if (singleButton) {
      return (
        <div style={{ height: '48px', display: 'flex' }}>
          <IonButton
            mode='md'
            onPointerUp={handleSingleButton}
            color={singleButtonColor}
            style={{
              height: '100%',
              flex: 1,
              borderRadius: '12px',
              fontSize: '16px',
              ...singleButtonStyle
            }}
          >
            <span>{singleButtonText}</span>
          </IonButton>
        </div>
      );
    }

    return (
      <div style={{ height: '48px', display: 'flex', gap: '8px' }}>
        {showFirstButton && (
          <IonButton
            mode='md'
            onPointerUp={handleFirstButton}
            color={firstButtonColor}
            style={{
              height: '100%',
              flex: 1,
              borderRadius: '12px',
              fontSize: '16px',
              ...firstButtonStyle
            }}
          >
            <span>{firstButtonText}</span>
          </IonButton>
        )}
        {showSecondButton && (
          <IonButton
            mode='md'
            onPointerUp={handleSecondButton}
            color={secondButtonColor}
            style={{
              height: '100%',
              flex: showFirstButton ? 1 : 2,
              borderRadius: '12px',
              fontSize: '16px',
              ...secondButtonStyle
            }}
          >
            <span>{secondButtonText}</span>
          </IonButton>
        )}
      </div>
    );
  };

  return (
    <IonModal
      onIonModalWillPresent={handleModalWillPresent}
      onIonModalDidDismiss={handleModalDidDismiss}
      className='custom-dialog'
      mode='ios'
      ref={modal}
      trigger={trigger}
      canDismiss={canDismiss}
      style={{
        alignItems: 'center',
        '--width': 'fit-content',
        '--height': 'fit-content',
        '--background': 'transparent',
        justifyContent: 'center',
        paddingBottom: 'var(--keyboard-height)'
      }}
    >
      {/* <div style={{ width: '100%', padding: '0 40px' }}> */}
      <div style={{ padding: '16px', ...contentStyle, backgroundColor: 'var(--ion-background-color)', borderRadius: '18px', width: '300px' }}>
        {title && (
          <div style={{
            textAlign: titleAlign,
            width: '100%',
            marginBottom: '16px',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            {title}
          </div>
        )}
        {renderContent()}
        <CustomInput></CustomInput>
        <CustomInput></CustomInput>
        <CustomInput></CustomInput>
        {(showFirstButton || showSecondButton || singleButton) && (
          <div style={{ marginTop: '16px' }}>
            {renderButtons()}
          </div>
        )}
      </div>
      {/* </div> */}
    </IonModal>
  );
}

export default CustomDialog;

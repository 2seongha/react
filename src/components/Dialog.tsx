import { IonButton } from '@ionic/react';
import {
  Dialog,
  Slide,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import React, { ReactNode } from 'react';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface CustomDialogProps {
  isOpen: boolean;
  onClose: () => void;
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
}

const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  onClose,
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

  const handleClose = () => {
    if (!preventClose) {
      onClose();
    }
  };

  const handleFirstButton = () => {
    if (onFirstButtonClick) {
      onFirstButtonClick();
    } else {
      onClose();
    }
  };

  const handleSecondButton = () => {
    if (onSecondButtonClick) {
      onSecondButtonClick();
    } else {
      onClose();
    }
  };

  const handleSingleButton = () => {
    if (onSingleButtonClick) {
      onSingleButtonClick();
    } else {
      onClose();
    }
  };

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
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      slots={{
        transition: Transition,
      }}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '18px',
          margin: '16px',
          backgroundColor: 'var(--ion-item-background)',
          color: 'var(--ion-text-color)',
          boxShadow: 'none',
          ...dialogStyle
        }
      }}
    >
      <div style={{ padding: '16px', ...contentStyle }}>
        {title && (
          <div style={{
            textAlign: titleAlign,
            width: '100%',
            margin: '8px 0',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            {title}
          </div>
        )}
        {renderContent()}
        {(showFirstButton || showSecondButton || singleButton) && renderButtons()}
      </div>
    </Dialog>
  );
}

export default CustomDialog;

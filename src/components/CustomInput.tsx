import { IonInput, IonButton, IonIcon } from '@ionic/react';
import {
  forwardRef,
  useRef,
  Ref,
} from 'react';
import { ValueHelp } from './CustomIcon';
import SearchHelpModal from './SearchHelpModal';
import { calendarOutline } from 'ionicons/icons';
import useAppStore from '../stores/appStore';

export interface CustomInputProps {
  path: string; // ★ 반드시 필요
  label: string;
  required?: boolean;
  value?: string;
  clearInput?: boolean;
  onClick?: () => void;
  onChange?: (value: string) => void;
  onFocus?: (e: Event) => void;
  onValueHelp?: () => void;
  onDatePicker?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
}

// ref는 모든 input 값을 담는 객체의 ref
export type FormRef = {
  [key: string]: string | undefined;
};

const CustomInput = forwardRef<FormRef, CustomInputProps>(
  (
    {
      path,
      label,
      required = false,
      value,
      clearInput = false,
      onClick,
      onChange,
      onFocus,
      onValueHelp,
      onDatePicker,
      placeholder = '',
      readOnly = false,
      style
    },
    formRef: Ref<FormRef>
  ) => {
    const setSearchHelp = useAppStore(state => state.setSearchHelp);
    const inputRef = useRef<HTMLIonInputElement>(null);

    const handleInput = (val: string) => {
      if (!formRef || typeof formRef !== 'object') return;

      // ref.current 초기화
      if (!('current' in formRef) || formRef.current == null) {
        // @ts-ignore
        formRef.current = {};
      }

      // ref.current[name] 에 값 저장
      (formRef.current as FormRef)[path] = val;

      onChange?.(val);
    };

    return (
      <>
        <IonInput
          mode="md"
          required={required}
          labelPlacement='stacked'
          placeholder={placeholder}
          value={value}
          readonly={readOnly}
          clearInput={clearInput}
          onClick={onClick}
          onIonFocus={onFocus}
          onIonInput={(e) => handleInput(e.detail.value!)}
          style={style}
          ref={inputRef}
        >
          <div slot="label">
            <span>
              {label}
              {required && <span style={{ color: 'var(--red)', marginLeft: '4px' }}>*</span>}
            </span>
          </div>
          {onValueHelp &&
            <div slot='end' style={{ width: '30px', height: '30px', position: 'relative' }}>
              <IonButton
                id="search-help-modal-trigger"
                fill="clear"
                slot="end"
                color="medium"
                onClick={async () => {
                  // inputRef.current?.setFocus();
                  // onValueHelp();
                  setSearchHelp({ IS_OPEN: true, TITLE: label });
                }}
                style={{
                  width: '42px',
                  height: '42px',
                  '--border-radius': '24px',
                  '--padding-start': '0',
                  '--padding-end': '0',
                  '--padding-top': '0',
                  '--padding-bottom': '0',
                  'position': 'absolute',
                  'right': '-8px',
                  'top': '-6px'
                }}
              >
                <ValueHelp color="var(--ion-color-step-600)" size={16} />
              </IonButton>
            </div>
          }
          {onDatePicker &&
            <div slot='end' style={{ width: '30px', height: '30px', position: 'relative' }}>
              <IonButton
                fill="clear"
                slot="end"
                color="medium"
                onClick={async () => {
                  inputRef.current?.setFocus();
                  onDatePicker();
                }}
                style={{
                  width: '42px',
                  height: '42px',
                  '--border-radius': '24px',
                  '--padding-start': '0',
                  '--padding-end': '0',
                  '--padding-top': '0',
                  '--padding-bottom': '0',
                  'position': 'absolute',
                  'right': '-6px',
                  'top': '-6px'
                }}
              >
                <IonIcon src={calendarOutline} />
              </IonButton>
            </div>
          }
        </IonInput>
      </>
    );
  }
);

export default CustomInput;
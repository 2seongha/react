import { IonInput, IonButton, IonIcon } from '@ionic/react';
import {
  RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import { ValueHelp } from './CustomIcon';
import { calendarOutline } from 'ionicons/icons';
import useAppStore from '../stores/appStore';
import { FormRef } from '../stores/types';

export interface CustomInputProps {
  formRef?: RefObject<FormRef>;
  label: string;
  required?: boolean;
  value?: string;
  helperText?: string;
  clearInput?: boolean;
  onClick?: () => void;
  onChange?: (value: string) => void;
  onFocus?: (e: Event) => void;
  onValueHelp?: () => void | Promise<void>;
  onChangeValueHelp?: (value: any) => void;
  onDatePicker?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
  inputMode?: any;
  currency?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  formRef,
  label,
  required = false,
  value,
  clearInput = false,
  onClick,
  onChange,
  onFocus,
  onValueHelp,
  onChangeValueHelp,
  onDatePicker,
  placeholder = '',
  readOnly = false,
  style,
  inputMode,
  helperText,
  currency
}) => {
  const setSearchHelp = useAppStore(state => state.setSearchHelp);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [localValue, setLocalValue] = useState('');
  const [localHelper, setLocalHelper] = useState('');

  useEffect(() => {
    setLocalValue(resolveTemplate(value ?? ''));
    setLocalHelper(resolveTemplate(helperText ?? ''));
  }, [formRef?.current])

  const resolveTemplate = (template: string) => {
    if (!template) return "";

    // 템플릿에 사용된 모든 key 추출
    const keys = [...template.matchAll(/\$([A-Za-z0-9_]+)/g)].map(
      match => match[1]
    );

    // key 전부 formRef에 없는 경우
    const hasAnyValue = keys.some(
      key => formRef?.current?.[key]
    );

    if (!hasAnyValue) {
      return "";
    }

    // 하나라도 있으면 정상 치환
    return template.replace(/\$([A-Za-z0-9_]+)/g, (_, key) => {
      return formRef?.current?.[key] ?? "";
    });
  };

  const handleValueHelp = (val: any) => {
    onChangeValueHelp?.(val);
    setLocalValue(resolveTemplate(value ?? ''));
    setLocalHelper(resolveTemplate(helperText ?? ''));
  };

  const handleInput = (val: string) => {
    if (currency) {
      const rawValue = val.replaceAll(',', '');
      onChange?.(rawValue);
      setLocalValue(Number(rawValue).toLocaleString("ko-KR"));
    } else {
      onChange?.(val);
      setLocalValue(resolveTemplate(value ?? ''));
      setLocalHelper(resolveTemplate(helperText ?? ''));
    }
  };

  const handleOpenValueHelp = async () => {
    setTimeout(() => {
      if (inputRef.current && !inputRef.current.classList.contains("has-focus")) {
        inputRef.current.classList.add("has-focus");
      }
    }, 50);
    setSearchHelp({
      isOpen: true,
      title: label,
      input: inputRef,
      onValueHelp: onValueHelp,
      onChange: handleValueHelp,
      list: null
    });
  };

  return (
    <>
      <IonInput
        mode="md"
        required={required}
        labelPlacement='stacked'
        placeholder={placeholder}
        value={localValue}
        helperText={localHelper}
        readonly={readOnly}
        clearInput={clearInput}
        onClick={readOnly && onValueHelp ? handleOpenValueHelp ?? onDatePicker : onClick}
        onIonFocus={onFocus}
        onIonInput={(e) => handleInput(e.detail.value!)}
        style={style}
        ref={inputRef}
        inputMode={inputMode}
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
              onClick={handleOpenValueHelp}
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
};

export default CustomInput;
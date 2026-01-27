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
  ref?: any;
  disabled?: boolean;
  formRef?: RefObject<FormRef>;
  label: string;
  required?: boolean;
  value?: string;
  helperText?: string;
  valueTemplate?: string;
  helperTextTemplate?: string;
  clearInput?: boolean;
  onClick?: () => void;
  onChange?: (value: string) => void;
  onFocus?: (e: Event) => void;
  formatter?: (value: any) => string;
  onBlur?: (e: Event) => void;
  onValueHelp?: () => void | Promise<void>;
  beforeOpenValueHelp?: () => boolean;
  onChangeValueHelp?: (value: any) => void;
  placeholder?: string;
  readOnly?: boolean;
  style?: React.CSSProperties;
  inputMode?: any;
  currency?: boolean;
  date?: boolean;
  labelPlacement?: any;
  datePickerFixed?: boolean;
  error?: boolean;
  errorText?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({
  ref,
  disabled,
  formRef,
  label,
  required = false,
  value,
  helperText,
  valueTemplate,
  helperTextTemplate,
  clearInput = false,
  onClick,
  onChange,
  onFocus,
  formatter,
  onBlur,
  onValueHelp,
  beforeOpenValueHelp,
  onChangeValueHelp,
  placeholder = '',
  readOnly = false,
  style,
  inputMode,
  currency,
  date,
  labelPlacement = 'stacked',
  datePickerFixed = true,
  error = false,
  errorText,
}) => {
  const setSearchHelp = useAppStore(state => state.setSearchHelp);
  const setDatePicker = useAppStore(state => state.setDatePicker);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [localValue, setLocalValue] = useState('');
  const [localHelper, setLocalHelper] = useState('');

  useEffect(() => {
    if (ref) ref(inputRef);
  })

  useEffect(() => {
    setLocalValue(valueTemplate ? resolveTemplate(valueTemplate ?? '', false) : value ?? '');
    setLocalHelper(helperTextTemplate ? resolveTemplate(helperTextTemplate ?? '') : helperTextTemplate ?? '');
  }, [formRef?.current])

  const resolveTemplate = (template: string, userInteraction: boolean = true) => {
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
    const result = template.replace(/\$([A-Za-z0-9_]+)/g, (_, key) => {
      return formRef?.current?.[key] ?? "";
    });
    return formatter ? formatter(result) : result;
  };

  const handleBlur = (e: any) => {
    onBlur?.(e);
    if (formatter) setLocalValue(formatter(inputRef.current?.value));
  };

  const handleValueHelp = (val: any) => {
    onChangeValueHelp?.(val);
    setLocalValue(valueTemplate ? resolveTemplate(valueTemplate ?? '') : value ?? '');
    setLocalHelper(helperTextTemplate ? resolveTemplate(helperTextTemplate ?? '') : helperTextTemplate ?? '');
  };

  const handleInput = (val: string, isDatePicker = false) => {
    onChange?.(val);
    // if (isDatePicker) {
      setLocalValue(valueTemplate ? resolveTemplate(valueTemplate ?? '') : value ?? '');
      setLocalHelper(helperTextTemplate ? resolveTemplate(helperTextTemplate ?? '') : helperTextTemplate ?? '');
    // }
  };

  const handleOpenValueHelp = async () => {
    if (beforeOpenValueHelp && !beforeOpenValueHelp()) return;
    if (!onValueHelp) return;

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

  const handleOpenDatePicker = async (e: any) => {
    setTimeout(() => {
      if (inputRef.current && !inputRef.current.classList.contains("has-focus")) {
        inputRef.current.classList.add("has-focus");
      }
    }, 50);
    setDatePicker({
      fixed: datePickerFixed,
      isOpen: true,
      input: inputRef,
      onChange: (val: string) => handleInput(val, true),
      buttonEvent: e
    });
  };

  return (
    <IonInput
      className={error ? 'ion-invalid ion-touched has-focus' : ''}
      errorText={errorText}
      disabled={disabled}
      mode="md"
      required={required}
      labelPlacement={labelPlacement}
      placeholder={placeholder}
      value={localValue}
      helperText={localHelper}
      readonly={readOnly}
      clearInput={clearInput}
      onClick={readOnly && !date ? handleOpenValueHelp : date ? handleOpenDatePicker : onClick}
      onIonFocus={onFocus}
      onIonBlur={handleBlur}
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
      {date &&
        <div slot='end' style={{ width: '30px', height: '30px', position: 'relative' }}>
          <IonButton
            fill="clear"
            slot="end"
            color="medium"
            onClick={handleOpenDatePicker}
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
  );
};

export default CustomInput;
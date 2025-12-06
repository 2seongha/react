import { IonInput, IonButton } from '@ionic/react';
import {
  forwardRef,
  useRef,
  Ref,
} from 'react';
import { ValueHelp } from './CustomIcon';

export interface CustomInputProps {
  path: string; // ★ 반드시 필요
  label: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onFocus?: (e: Event) => void;
  onValueHelp?: () => void;
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
      onChange,
      onFocus,
      onValueHelp,
      placeholder = '',
      readOnly = false,
      style
    },
    formRef: Ref<FormRef>
  ) => {
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
        <span className="label">
          {label}
          {required && <span style={{ color: 'var(--red)' }}>*</span>}
        </span>

        <IonInput
          className="input"
          mode="md"
          fill="outline"
          placeholder={placeholder}
          value={value}
          readonly={readOnly}
          onIonFocus={onFocus}
          onIonInput={(e) => handleInput(e.detail.value!)}
          style={style}
          ref={inputRef}
        >
          {onValueHelp && <IonButton
            fill="clear"
            slot="end"
            color="medium"
            onClick={async () => {
              // input에 focus
              inputRef.current?.setFocus();
              // ValueHelp 클릭 이벤트 호출
              onValueHelp();
            }}
            style={{
              width: '62px',
              height: '48px',
              transform: 'translateX(15px)',
            }}
          >
            <ValueHelp color="var(--value-help-color)" size={28} />
          </IonButton>
          }
        </IonInput>
      </>
    );
  }
);

export default CustomInput;
import { IonInput, IonButton, IonIcon } from '@ionic/react';
import {
  useEffect,
  useRef,
  useState,
} from 'react';
import { ValueHelp } from './CustomIcon';
import { calendarOutline } from 'ionicons/icons';
import useAppStore from '../stores/appStore';

export interface CustomInputProps {
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
}

const CustomInput: React.FC<CustomInputProps> = ({
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
  helperText
}) => {
  const setSearchHelp = useAppStore(state => state.setSearchHelp);
  const inputRef = useRef<HTMLIonInputElement>(null);
  const [localValue, setLocalValue] = useState(value);
  const [localHelper, setLocalHelper] = useState(helperText);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    setLocalHelper(helperText);
  }, [helperText]);

  const handleValueHelp = (val: any) => {
    setLocalValue(val.Key);
    setLocalHelper(val.Name);
    onChangeValueHelp?.(val);
  };

  const handleInput = (val: string) => {
    onChange?.(val);
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
        onClick={onClick}
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
              onClick={async () => {
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
                // inputRef.current?.setFocus();
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
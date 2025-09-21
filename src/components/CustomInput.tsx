import React, { useRef, useEffect, useState, useCallback } from 'react';
import { IonInput, isPlatform } from '@ionic/react';
import type { IonInputCustomEvent } from '@ionic/core';

interface CustomInputProps extends React.ComponentProps<typeof IonInput> {
  // IonInput의 모든 props를 상속받음
}

const CustomInput: React.FC<CustomInputProps> = ({
  onIonFocus,
  onIonBlur,
  onIonInput,
  value,
  style,
  className,
  ...props
}) => {
  const visibleInputRef = useRef<HTMLIonInputElement>(null);
  const hiddenInputRef = useRef<HTMLIonInputElement>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [inputValue, setInputValue] = useState(value || '');
  const containerRef = useRef<HTMLDivElement>(null);

  // iOS에서만 이 로직을 적용
  const shouldUseCustomLogic = isPlatform('ios');

  const handleFocus = useCallback((e: CustomEvent) => {
    if (!shouldUseCustomLogic) {
      onIonFocus?.(e);
      return;
    }

    // 숨겨진 input에 포커스
    if (hiddenInputRef.current && !isHidden) {
      hiddenInputRef.current?.setFocus();
      setIsHidden(true);
      debugger;
    }
    
    onIonFocus?.(e);
  }, [shouldUseCustomLogic, isHidden, onIonFocus]);

  const handleBlur = useCallback((e: CustomEvent) => {
    if (!shouldUseCustomLogic) {
      onIonBlur?.(e);
      return;
    }

    // 다시 보이는 input으로 전환
    if (isHidden) {
      setIsHidden(false);
    }
    
    onIonBlur?.(e);
  }, [shouldUseCustomLogic, isHidden, onIonBlur]);

  const handleInput = useCallback((e: CustomEvent) => {
    const newValue = e.detail.value;
    setInputValue(newValue);
    onIonInput?.(e);
  }, [onIonInput]);

  // value prop이 변경되면 내부 상태도 업데이트
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const inputProps = {
    ...props,
    value: inputValue,
    onIonInput: handleInput,
    onIonBlur: handleBlur,
  };

  if (!shouldUseCustomLogic) {
    // iOS가 아닌 경우 일반 IonInput 반환
    return (
      <IonInput
        ref={visibleInputRef}
        onIonFocus={handleFocus}
        style={style}
        className={className}
        {...inputProps}
      />
    );
  }

  return (
    <div ref={containerRef} style={{ position: 'relative', ...style }}>
      {/* 보이는 input (포커스 전까지) */}
      {!isHidden && (
        <IonInput
          ref={visibleInputRef}
          onIonFocus={handleFocus}
          className={className}
          {...inputProps}
        />
      )}
      
      {/* 숨겨진 input (포커스 시 활성화) */}
      <IonInput
        ref={hiddenInputRef}
        {...inputProps}
        onIonBlur={handleBlur}
        style={{
          position: isHidden ? 'static' : 'fixed',
          left: isHidden ? 'auto' : '-99999px',
          top: isHidden ? 'auto' : '-99999px',
          visibility: isHidden ? 'visible' : 'hidden',
          opacity: isHidden ? 1 : 0,
          width: isHidden ? '100%' : 'auto',
        }}
        className={isHidden ? className : ''}
      />
    </div>
  );
};

export default CustomInput;
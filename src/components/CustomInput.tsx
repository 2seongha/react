import React, { useRef, useEffect, useState, useCallback } from "react";
import { IonButton, IonInput, isPlatform } from "@ionic/react";
import type { IonInputCustomEvent } from "@ionic/core";

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

  const handleFocus = useCallback(
    (e: any) => {
      // if (!shouldUseCustomLogic) {
      //   onIonFocus?.(e);
      //   return;
      // }

      // 숨겨진 input에 포커스
      // if (hiddenInputRef.current && !isHidden) {
      // setIsHidden(true);
      hiddenInputRef.current!.style.position = "static";
      visibleInputRef.current!.style.visibility = "hidden";
      visibleInputRef.current!.style.position = "fixed";

      setTimeout(() => {
        hiddenInputRef.current?.setFocus();
      }, 10);
      // }

      // onIonFocus?.(e);
    },
    []
  );

  const handleBlur = useCallback(
    (e: CustomEvent) => {
      // if (!shouldUseCustomLogic) {
      //   onIonBlur?.(e);
      //   return;
      // }

      // 다시 보이는 input으로 전환
      // if (isHidden) {
      visibleInputRef.current!.style.visibility = "visible";
      visibleInputRef.current!.style.position = "static";
      hiddenInputRef.current!.style.position = "fixed";

      // setIsHidden(false);
      // }

      // onIonBlur?.(e);
    },
    []
  );

  const handleInput = useCallback(
    (e: CustomEvent) => {
      const newValue = e.detail.value;
      visibleInputRef.current!.innerText = newValue;
      // onIonInput?.(e);
    },
    [onIonInput]
  );

  // value prop이 변경되면 내부 상태도 업데이트
  // useEffect(() => {
  //   setInputValue(value || "");
  // }, [value]);

  const inputProps = {
    // ...props,
    onIonInput: handleInput,
    onblur: handleBlur,
  };

  // if (!shouldUseCustomLogic) {
  //   // iOS가 아닌 경우 일반 IonInput 반환
  //   return (
  //     <IonInput
  //       ref={visibleInputRef}
  //       onIonFocus={handleFocus}
  //       style={style}
  //       className={className}
  //       {...inputProps}
  //     />
  //   );
  // }

  return (
    <div style={{ position: "relative", ...style }}>
      {/* 보이는 input (포커스 전까지) */}
      {/* {!isHidden && ( */}
      <IonInput
        label="a"
        mode="md"
        fill="outline"
        color="primary"
        inputMode="none"
        ref={visibleInputRef}
        onFocus={handleFocus}
        value={value}
        // className={className}
        // {...inputProps}
      />
      {/* )} */}

      {/* 숨겨진 input (포커스 시 활성화) */}
      <IonInput
        label="d"
        fill="outline"
        color="primary"
        mode="md"
        ref={hiddenInputRef}
        {...inputProps}
        style={{
          position: "fixed",
          left: "-99999px",
          top: "-99999px",
          // visibility: isHidden ? "visible" : "hidden",
          // opacity: isHidden ? 1 : 1,
          // width: isHidden ? "100%" : "auto",
        }}
        // className={isHidden ? className : ""}
      />
    </div>
  );
};

export default CustomInput;

import { IonCheckbox, IonIcon, IonRippleEffect } from '@ionic/react';
import React, { ReactNode, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import './CustomItem.css';
import { chevronForwardOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { createGesture } from '@ionic/react';
interface CustomItemProps {
  title?: ReactNode;
  body?: ReactNode;
  sub?: ReactNode;
  selectable?: boolean;
  onClick?: () => void;
  onLongPress?: () => void;
  onCheckboxChange?: (checked: boolean) => void;
  checked?: boolean;
  expandable?: boolean;
  style?: React.CSSProperties;
}

const CustomItem: React.FC<CustomItemProps> = React.memo(({ selectable, title, body, sub, onClick, onLongPress, onCheckboxChange, checked, style }) => {
  const [isExpanded, setIsExpanded] = useState(false); // 확장 상태는 UI 변경이 필요하므로 state 유지
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleCheckboxToggle = useCallback((e: any) => {
    if (onCheckboxChange) {
      onCheckboxChange(!checked);
    }
  }, [onCheckboxChange, checked]);

  const handleTitleClick = useCallback(() => {
    if (sub) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    }
  }, [sub, isExpanded, onClick]);

  // Long press와 click을 통합 관리
  // let pressTimer: NodeJS.Timeout;

  // useEffect(() => {
  //   const gesture = createGesture({
  //     el: wrapperRef.current!,
  //     gestureName: 'long-press',
  //     threshold: 0,
  //     onStart: () => {
  //       // 꾹 누르기 600ms 후 동작
  //       pressTimer = setTimeout(() => {
  //         console.log('🕓 꾹 누르기 감지됨 (롱프레스)');
  //         // 👉 여기서 롱프레스 시 실행할 작업 추가
  //       }, 600);
  //     },
  //     onMove: () => {
  //       clearTimeout(pressTimer); // 움직이면 롱프레스 취소
  //     },
  //     onEnd: () => {
  //       clearTimeout(pressTimer); // 손 떼면 롱프레스 취소
  //     },
  //   });

  //   gesture.enable(true);
  //   return () => gesture.destroy();
  // }, []);

  const headerButton = useMemo(() => {
    if (sub) {
      return (
        <IonIcon src={isExpanded ? chevronUpOutline : chevronDownOutline} className='custom-item-header-icon' />
      );
    } else if (onClick) {
      return <IonIcon src={chevronForwardOutline} className='custom-item-header-icon' />;
    }
    return null;
  }, [sub, isExpanded, onClick]);

  const itemClasses = useMemo(() => `custom-item ${checked ? 'selected' : ''} ion-activatable`, [checked]);
  const contentAreaClasses = useMemo(() => `custom-item-header-content-area`, []);

  return (
    <div style={{ position: 'relative' }}>
      <div
        ref={wrapperRef}
        style={style}
        className={itemClasses}
        onPointerUp={onClick ? () => {
          onClick();
        } : undefined}
      >
        <div className='custom-item-header'>
          {selectable && (
            <IonCheckbox
              checked={checked}
              mode='md'
              style={{ pointerEvents: 'none' }}
            />
          )}
          <div className={contentAreaClasses} onClick={sub ? handleTitleClick : undefined} style={{ pointerEvents: sub ? 'auto' : 'none' }}>
            {title}
            {headerButton}
          </div>
        </div>
        {body}
        {sub && isExpanded && (
          <div className="custom-item-sub" style={{ overflow: "hidden" }}>
            <div style={{ padding: "12px 16px" }}>
              {sub}
            </div>
          </div>
        )}
        {onClick && <IonRippleEffect />}
      </div>
      {selectable &&
        <div
          className='custom-item-checkbox-wrapper'
          onTouchStart={handleCheckboxToggle}
          style={{ display: 'flex', alignItems: 'center' }}
        />
      }
    </div>
  );
});

export default CustomItem;
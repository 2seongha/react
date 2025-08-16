import { IonCheckbox, IonIcon, IonRippleEffect } from '@ionic/react';
import React, { ReactNode, useState, useMemo, useCallback, useRef, useEffect } from 'react';
import './CustomItem.css';
import { chevronForwardOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';

interface CustomItemProps {
  title?: ReactNode;
  body?: ReactNode;
  sub?: ReactNode;
  selectable?: boolean;
  onClick?: () => void;
  onCheckboxChange?: (checked: boolean) => void;
  checked?: boolean;
  expandable?: boolean;
  style?: React.CSSProperties;
  forceHideRipple?: boolean;
}

const CustomItem: React.FC<CustomItemProps> = React.memo(({ selectable, title, body, sub, onClick, onCheckboxChange, checked, style, forceHideRipple }) => {
  const [isExpanded, setIsExpanded] = useState(false); // 확장 상태는 UI 변경이 필요하므로 state 유지
  const stateRef = useRef({ hideRipple: false });
  const wrapperRef = useRef<HTMLDivElement>(null);

  const handleCheckboxToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    
    // IonRippleEffect 숨기기 - ref 사용으로 리렌더링 방지
    stateRef.current.hideRipple = true;
    
    // 100ms 후 ripple 다시 보이기
    setTimeout(() => {
      stateRef.current.hideRipple = false;
    }, 100);
    
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

  const itemClasses = useMemo(() => `custom-item ${checked ? 'selected' : ''}`, [checked]);
  const contentAreaClasses = useMemo(() => `custom-item-header-content-area`, []);

  return (
    <div 
      className={itemClasses} 
      style={style}
    >
      <div 
        ref={wrapperRef}
        className='custom-item-wrapper ion-activatable'
        onPointerUp={onClick ? (e) => {
          onClick();
        } : undefined}
        style={{ width: '100%', cursor: onClick ? 'pointer' : 'default' }}
      >
        <div className='custom-item-header'>
          {selectable && (
            <div 
              onPointerUp={handleCheckboxToggle}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <IonCheckbox 
                checked={checked} 
                mode='md'
                style={{ pointerEvents: 'none' }}
              />
            </div>
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
        {onClick && <IonRippleEffect style={{ display: (stateRef.current.hideRipple || forceHideRipple) ? 'none' : 'block' }} />}
      </div>
    </div>
  );
});

export default CustomItem;
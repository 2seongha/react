import { IonCheckbox, IonIcon, IonItem, IonRippleEffect } from '@ionic/react';
import React, { ReactNode, useState, useMemo, useCallback, useRef } from 'react';
import './CustomItem.css';
import { chevronForwardOutline, chevronDownOutline, chevronUpOutline } from 'ionicons/icons';
import { AnimatePresence, motion } from 'framer-motion';
interface CustomItemProps {
  selectable?: boolean;
  title?: ReactNode;
  body?: ReactNode;
  sub?: ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  onCheckboxChange?: (checked: boolean) => void;
  checked?: boolean;
  expandable?: boolean;
  style?: React.CSSProperties;
  checkboxCenter?: boolean;
}

const CustomItem: React.FC<CustomItemProps> = React.memo(({
  selectable,
  title,
  body,
  sub,
  onClick,
  onLongPress,
  onCheckboxChange,
  checked,
  style,
  checkboxCenter = true
}) => {
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

  const itemClasses = useMemo(() => `custom-item ${checked ? 'selected' : ''} ion-activatable`, [checked]);
  const contentAreaClasses = useMemo(() => `custom-item-header-content-area`, []);

  return (
    <div style={{ borderRadius: '8px', position: 'relative' }}>
      <div
        ref={wrapperRef}
        style={style}
        className={itemClasses}
        onClick={onClick ? () => {
          onClick();
        } : selectable ? handleCheckboxToggle : undefined}
      >
        {sub ?
          <IonItem
            mode='md'
            button
            onClick={(e) => {
              e.stopPropagation();
              handleTitleClick();
            }}
            style={{
              '--background': 'transparent'
            }}>
            <div className='custom-item-header' style={{ alignItems: checkboxCenter ? 'center' : 'start' }}>
              {selectable && (
                <IonCheckbox
                  checked={checked}
                  mode='md'
                  style={{ pointerEvents: 'none' }}
                />
              )}
              <div className={contentAreaClasses} >
                {title}
                {headerButton}
              </div>
            </div>
          </IonItem> :
          <div className='custom-item-header' style={{ alignItems: checkboxCenter ? 'center' : 'start' }}>
            {selectable && (
              <IonCheckbox
                checked={checked}
                mode='md'
                style={{ pointerEvents: 'none' }}
              />
            )}
            <div className={contentAreaClasses} >
              {title}
              {headerButton}
            </div>
          </div>
        }
        {body}
        <AnimatePresence initial={false}>
          {sub && isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                // height: { duration: 0.2, ease: 'easeInOut' },
                opacity: { duration: 0.3, ease: 'easeOut' }
              }}
              style={{ overflow: 'hidden' }}
            >
              <div className="custom-item-sub">
                <div style={{ padding: " 0 16px 12px 16px" }}>
                  {sub}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {(onClick || (!onClick && selectable)) && <IonRippleEffect />}
      </div>
      {selectable &&
        <div
          className='custom-item-checkbox-wrapper'
          onPointerUp={handleCheckboxToggle}
          style={{ display: 'flex', alignItems: 'center' }}
        />
      }
    </div>
  );
});

export default CustomItem;
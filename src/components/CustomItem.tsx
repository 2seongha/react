import { IonCheckbox, IonIcon, IonRippleEffect, IonItem, IonButton } from '@ionic/react';
import React, { ReactNode, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './CustomItem.css';
import { chevronForwardOutline, chevronDownOutline } from 'ionicons/icons';

interface CustomItemProps {
  title?: ReactNode;
  sub?: ReactNode;
  selectable?: boolean;
  onTouchStart?: () => void;
  onCheckboxChange?: (checked: boolean) => void;
  checked?: boolean;
  expandable?: boolean;
}

const CustomItem: React.FC<CustomItemProps> = React.memo(({ selectable, title, sub, onTouchStart, onCheckboxChange, checked }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCheckboxToggle = useCallback((e: any) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    if (onCheckboxChange) {
      onCheckboxChange(!checked);
    }
  }, [onCheckboxChange, checked]);

  const handleTitleClick = useCallback(() => {
    if (sub) {
      setIsExpanded(!isExpanded);
    } else if (onTouchStart) {
      onTouchStart();
    }
  }, [sub, isExpanded, onTouchStart]);

  const headerButton = useMemo(() => {
    if (sub) {
      return (
        <IonIcon
          src={isExpanded ? chevronDownOutline : chevronForwardOutline}
          style={{ width: 14, marginLeft: 2 }}
        />
      );
    } else if (onTouchStart) {
      return <IonIcon src={chevronForwardOutline} style={{ width: 14, marginLeft: 2 }} />;
    }
    return null;
  }, [sub, isExpanded, onTouchStart]);

  const itemClasses = useMemo(() => `custom-item ${checked ? 'selected' : ''}`, [checked]);
  const contentAreaClasses = useMemo(() => `custom-item-header-content-area ${sub || onTouchStart ? 'ion-activatable' : ''}`, [sub, onTouchStart]);

  return (
    <IonItem
      className={itemClasses}
      onTouchStart={onTouchStart ? onTouchStart : undefined}
      button={!!onTouchStart}
      mode='md'
    >
      <div className='custom-item-wrapper'>
        {/* //* header */}
        <div className='custom-item-header'>
          {selectable ? (
            <IonButton fill='clear' onTouchStart={handleCheckboxToggle} shape='round'>
              <IonCheckbox checked={checked} mode='md' />
            </IonButton>
          ) : null}

          <div
            className={contentAreaClasses}
            onTouchStart={sub ? handleTitleClick : onTouchStart}
          >
            {title}
            {headerButton}
            {(sub || onTouchStart) && <IonRippleEffect />}
          </div>
        </div>

        {/* //* body */}
        <div className='custom-item-body'>
          <div>item1</div>
          <div>item1</div>
          <div>item1</div>
          <div>item1</div>
          <div>item1</div>
          <div>item1</div>
        </div>

        {/* //* sub section */}
        <AnimatePresence>
          {sub && isExpanded && (
            <motion.div
              className="custom-item-sub"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <div style={{ padding: "12px 16px" }}>
                {sub}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </IonItem>
  );
});

export default CustomItem;
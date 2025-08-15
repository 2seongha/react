import { IonCheckbox, IonIcon, IonRippleEffect, IonItem, IonButton } from '@ionic/react';
import React, { ReactNode, useState, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
}

const CustomItem: React.FC<CustomItemProps> = React.memo(({ selectable, title, body, sub, onClick, onCheckboxChange, checked }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCheckboxToggle = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
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
  const contentAreaClasses = useMemo(() => `custom-item-header-content-area ${sub || onClick ? 'ion-activatable' : ''}`, [sub, onClick]);

  return (
    <IonItem
      className={itemClasses}
      onClick={onClick ? onClick : undefined}
      button={!!onClick}
      mode='md'
    >
      <div className='custom-item-wrapper'>
        {/* //* header */}
        <div className='custom-item-header'>
          {selectable ? (
            <IonCheckbox onClick={handleCheckboxToggle} checked={checked} mode='md' />
          ) : null}

          <div
            className={contentAreaClasses}
            onClick={sub ? handleTitleClick : undefined}
          >
            {title}
            {headerButton}
            {sub && <IonRippleEffect />}
          </div>
        </div>

        {/* //* body */}
        {body}

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
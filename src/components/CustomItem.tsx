import { IonCheckbox, IonIcon, IonRippleEffect, IonItem, IonButton } from '@ionic/react';
import React, { ReactNode, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import './CustomItem.css';
import { chevronForwardOutline, chevronDownOutline } from 'ionicons/icons';

interface CustomItemProps {
  title?: ReactNode;
  sub?: ReactNode;
  selectable?: boolean;
  onClick?: () => void;
  onCheckboxChange?: (checked: boolean) => void;
  checked?: boolean;
  expandable?: boolean;
}

const CustomItem: React.FC<CustomItemProps> = ({ selectable, title, sub, onClick, onCheckboxChange, checked }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCheckboxToggle = (e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    if (onCheckboxChange) {
      onCheckboxChange(!checked);
    }
  };

  const handleTitleClick = () => {
    if (sub) {
      setIsExpanded(!isExpanded);
    } else if (onClick) {
      onClick();
    }
  };

  const headerButton = sub ? (
    <IonIcon
      src={isExpanded ? chevronDownOutline : chevronForwardOutline}
      style={{ width: 14, marginLeft: 2 }}
    />
  ) : onClick ? (
    <IonIcon src={chevronForwardOutline} style={{ width: 14, marginLeft: 2 }} />
  ) : null;

  return (
    <IonItem
      className={`custom-item ${checked ? 'selected' : ''}`}
      onClick={onClick ? onClick : undefined}
      button={!!onClick}
      mode='md'
    >
      <div className='custom-item-wrapper'>
        {/* //* header */}
        <div className='custom-item-header'>
          {/* <div className='custom-item-header-checkbox-area ion-activatable'
            onClick={handleCheckboxToggle}>
            <IonCheckbox checked={checked} mode='md' />
            <IonRippleEffect />
          </div> */}
          {selectable ? (
            <IonButton fill='clear' onClick={handleCheckboxToggle} shape='round'>
              <IonCheckbox checked={checked} mode='md' />
            </IonButton>
          ) : null}

          <div
            className={`custom-item-header-content-area ${sub || onClick ? 'ion-activatable' : ''}`}
            onClick={sub ? handleTitleClick : onClick}
          >
            {title}
            {headerButton}
            {(sub || onClick) && <IonRippleEffect />}
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
};

export default CustomItem;
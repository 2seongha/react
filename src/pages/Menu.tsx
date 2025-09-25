import {
  IonContent,
  IonItem,
  IonLabel,
  IonList,
  IonMenu,
  IonIcon,
  IonImg,
  IonButton,
  IonMenuToggle,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  isPlatform,
  useIonRouter,
} from '@ionic/react';
import { menuController } from '@ionic/core/components';
import React, { useState, useCallback, useMemo } from 'react';
import {
  chevronDown,
  chevronUp,
  close,
  refreshOutline
} from 'ionicons/icons';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '../stores/appStore';
import { AreaModel } from '../stores/types';
import { getFlowIcon } from '../utils';
import './Menu.css';
import AppBar from '../components/AppBar';

const Menu: React.FC = () => {
  const areas = useAppStore(state => state.areas);
  const setAreas = useAppStore(state => state.setAreas);
  const fetchAreas = useAppStore(state => state.fetchAreas);

  const handleRefresh = useCallback(async (event: RefresherCustomEvent) => {
    setAreas(null);
    await fetchAreas('');
    event.detail.complete();
  }, [setAreas, fetchAreas]);

  // 닫기 버튼 컴포넌트 - AppBar 버튼과 동일한 스타일
  const closeButton = useMemo(() => (
    <IonMenuToggle menu="main-menu">
      <IonButton
        mode='md'
        shape='round'
        color={'medium'}
        className="app-bar-button"
      >
        <IonIcon icon={close} />
      </IonButton>
    </IonMenuToggle>
  ), []);

  return (
    <IonMenu side="end" menuId="main-menu" contentId="main-content" className="slide-menu" swipeGesture={false}>
      <AppBar
        title={<span>메뉴</span>}
        customEndButtons={closeButton}
      />

      <IonContent className="menu-content" scrollY={true} scrollX={false}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          {isPlatform('android') ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>
        <IonList className="hierarchical-menu">
          {areas?.map((area, index) => (
            <MenuItem key={`${area.AREA_CODE}-${index}`} area={area} />
          ))}
        </IonList>
      </IonContent>
    </IonMenu>
  );
};
interface MenuItemProps {
  area: AreaModel;
  level?: number;
}

const MenuItem: React.FC<MenuItemProps> = React.memo(({ area, level = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasChildren = !area.P_AREA_CODE;
  const icon = useMemo(() => getFlowIcon(area.AREA_CODE!), [area.AREA_CODE]);
  const router = useIonRouter();

  const toggleExpanded = useCallback(() => {
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
  }, [hasChildren, isExpanded]);

  const handleItemClick = useCallback(async () => {
    if (hasChildren) {
      await menuController.close('main-menu');
      router.push(`/flowList/${area.AREA_CODE}`);
    } else {
      await menuController.close('main-menu');
      router.push(`/approval/${area.P_AREA_CODE}/${area.AREA_CODE}/${area.P_AREA_CODE_TXT}/${area.O_LTEXT}`);
    }
  }, [hasChildren, router, area]);

  const handleExpandClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 중단
    toggleExpanded();
  }, [toggleExpanded]);

  return (
    <>
      <IonItem
        button
        className={`menu-item level-${level} ${hasChildren ? 'has-children' : ''} ${isExpanded ? 'expanded' : ''}`}
        onClick={handleItemClick}
      >
        <div className="menu-item-icon" style={{ backgroundColor: icon.backgroundColor }}>
          <IonImg src={icon.image} alt="menu icon" />
        </div>

        <IonLabel className="menu-item-label">
          <div className="menu-item-text">
            <span>{area.O_LTEXT}</span>
            <span>({area.CNT ?? 0})</span>
          </div>
        </IonLabel>

        {hasChildren &&
          <IonButton
            mode='md'
            shape='round'
            color={'medium'}
            fill='clear'
            className="app-bar-button"
            onClick={handleExpandClick}>
            <IonIcon
              style={{ width: 18, height: 18 }}
              icon={isExpanded ? chevronUp : chevronDown}
            />
          </IonButton>
          // :
          // <div style={{
          //   width: '44px',
          //   height: '44px',
          //   display: 'flex',
          //   alignItems: 'center',
          //   justifyContent: 'center',
          //   marginRight: '8px'
          // }}>
          //   <IonIcon
          //     style={{ width: 24, height: 24, color: 'rgba(100, 109, 123, .48)' }}
          //     icon={chevronForward}
          //     slot="end"
          //   />
          // </div>
        }
      </IonItem >

      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className={`submenu-container level-${level + 1}`}>
              {area.CHILDREN?.map((child, index) => (
                <MenuItem
                  key={`${child.AREA_CODE}-${index}`}
                  area={child}
                  level={level + 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

MenuItem.displayName = 'MenuItem';
export default Menu;

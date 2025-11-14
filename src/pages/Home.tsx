import {
  IonContent,
  IonPage,
  IonItem,
  IonCard,
  IonButton,
  IonIcon,
  useIonViewWillEnter,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  useIonRouter,
  isPlatform,
} from '@ionic/react';
import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { chevronDown, chevronUp, chevronForwardOutline, person, refreshOutline } from 'ionicons/icons';
import CustomSkeleton from '../components/CustomSkeleton';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import './Home.css';
import { getFlowIcon } from '../utils';
import { AreaModel } from '../stores/types';
import GroupButton from '../components/GroupButton';
import BottomTabBar from '../components/BottomNavigation';
import { banknotesGlassIcon, creditcardGlassIcon, personIcon, searchIcon } from '../assets/images';
import { useShallow } from 'zustand/shallow';
import { webviewHaptic } from '../webview';
import CachedImage from '../components/CachedImage';
import _ from 'lodash';

const Home: React.FC = () => {
  const setMenuAreas = useAppStore(state => state.setAreas);
  const setApprovals = useAppStore(state => state.setApprovals);

  const getAreas = useAppStore(state => state.getAreas);

  useIonViewWillEnter(() => {
    getAreas('');
  });

  async function handleRefresh(event: RefresherCustomEvent) {
    setMenuAreas(null);
    setApprovals(null);
    webviewHaptic("mediumImpact");
    await Promise.allSettled(([getAreas('')]));
    event.detail.complete();
  }

  return (
    <IonPage className="home">
      <AppBar showLogo={true} showSearchButton={true} showMenuButton={true} />

      <IonContent scrollEvents={false} scrollX={false} scrollY={true} forceOverscroll={false}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          {isPlatform('android') ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>
        <div style={{ marginTop: '0px' }}>
          <NoticeCard />
        </div>
        <div style={{ marginTop: '12px' }}>
          <WelcomeCard />
        </div>
        <div style={{ marginTop: '12px' }}>
          <MenuCard />
        </div>
        <div style={{ marginTop: '12px' }}>
          <StartButtons />
        </div>
        <div style={{ marginTop: '12px', marginBottom: '12px' }}>
          <TodoSummaryCard />
        </div>
      </IonContent>
      <BottomTabBar />
    </IonPage>
  );
};

export default Home;


const NoticeCard: React.FC = () => {
  return (
    <IonCard button className='home-card' onClick={() => {

    }}>
      <div className='notice-card-content'>
        <div className='notice-card-badge'>
          <span>공지사항</span>
        </div>
        <span className='notice-card-notice'>새로운 공지사항이 없습니다.</span>
        <IonIcon src={chevronForwardOutline} style={{ width: 20 }} />
      </div>
    </IonCard>
  );
}

const WelcomeCard: React.FC = () => {
  const name = useAppStore(state => state.user?.NAME);
  const router = useIonRouter();

  return (
    <IonCard className='home-card'>
      <div className='welcome-card-content'>
        <CachedImage
          src={personIcon}
          style={{ width: '48px', height: '48px' }}
          alt="person"
        />
        <div className='welcome-card-name'>
          <span>{name}님</span>
          <span>좋은 하루 보내세요!</span>
        </div>
        <IonButton fill='clear' mode='md' className='welcome-card-button' onClick={() => {
          router.push(`/myPage`, 'forward', 'push');
        }}>내 정보</IonButton>
      </div>
    </IonCard>
  );
}


const MenuCard: React.FC = () => {
  const menuAreas = useAppStore(state => state.areas);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  // 메모이제이션된 계산값들
  const hasMoreMenus = useMemo(() => menuAreas && menuAreas.length > 3, [menuAreas]);

  const mainMenuItems = useMemo(() =>
    Array.from({ length: !menuAreas ? 3 : Math.min(menuAreas.length, 3) }),
    [menuAreas]
  );

  const expandedMenuItems = useMemo(() =>
    menuAreas ? menuAreas.slice(3) : [],
    [menuAreas]
  );

  // 최적화된 토글 핸들러
  const toggleExpanded = useCallback(() => {
    setIsMenuExpanded(prev => !prev);
  }, []);

  return (
    <IonCard className='home-card menu-card'>
      {mainMenuItems.map((_, index) => (
        <MenuItem key={index} menuItem={menuAreas?.[index]} isLoading={!menuAreas} />
      ))}

      <motion.div
        initial={{
          height: 0,
          opacity: 0
        }}
        style={{
          overflow: 'hidden',
          willChange: 'height, opacity',
          transform: 'translateZ(0)'
        }}
        animate={{
          height: isMenuExpanded ? 'auto' : 0,
          opacity: isMenuExpanded ? 1 : 0
        }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        {expandedMenuItems.map((menu, index) => (
          <ExpandedMenuItem
            key={`expanded-${menu.AREA_CODE}-${index}`}
            menu={menu}
            index={index}
          />
        ))}
      </motion.div>

      <IonButton
        color='medium'
        className='menu-expand-button'
        fill="clear"
        onClick={toggleExpanded}
        disabled={!hasMoreMenus}
      >
        <span>{isMenuExpanded ? '메뉴 접기' : '메뉴 펼치기'}</span>
        <IonIcon icon={isMenuExpanded ? chevronUp : chevronDown} style={{ width: '14px', marginLeft: '2px' }} />
      </IonButton>
    </IonCard>
  );
};

// 확장된 메뉴 아이템 컴포넌트 (최적화)
interface ExpandedMenuItemProps {
  menu: AreaModel;
  index: number;
}

const ExpandedMenuItem: React.FC<ExpandedMenuItemProps> = React.memo(({ menu }) => {
  return (
    <MenuItem menuItem={menu} isLoading={false} />
  );
}, (prevProps, nextProps) => {
  // 커스텀 비교 함수로 불필요한 리렌더링 방지
  return (
    prevProps.menu.AREA_CODE === nextProps.menu.AREA_CODE &&
    prevProps.menu.O_LTEXT === nextProps.menu.O_LTEXT &&
    prevProps.menu.CNT === nextProps.menu.CNT
  );
});

ExpandedMenuItem.displayName = 'ExpandedMenuItem';

interface MenuItemProps {
  menuItem?: AreaModel;
  isLoading?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ menuItem, isLoading = false }) => {
  if (isLoading || !menuItem) {
    return (
      <div style={{ height: '52px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <CustomSkeleton width={80} />
        <CustomSkeleton width={50} />
      </div>
    );
  }

  const icon = getFlowIcon(menuItem.AREA_CODE!);
  const router = useIonRouter();

  return (
    <IonItem button className='menu-ion-item' onClick={() => {
      router.push(`/flowList/${menuItem.AREA_CODE}`, 'forward', 'push');
    }} mode='md'>
      <div className='menu-item'>
        <div className='menu-item-content'>
          <div className='menu-item-icon' style={{ backgroundColor: icon.backgroundColor }}>
            <CachedImage
              width='27px'
              src={icon.image}
              alt="menu icon"
            />
          </div>
          <span>{menuItem.O_LTEXT}</span>
        </div>
        <span className='menu-item-count'>{menuItem.CNT ?? 0}건</span>
      </div>
    </IonItem>
  );
};

const TodoSummaryCard: React.FC = () => {
  const todoSummary = useAppStore(useShallow(state => state.areas?.find(area => area.AREA_CODE === 'TODO')?.CHILDREN || null));
  const approvals = useAppStore(state => state.approvals);
  const router = useIonRouter();
  const [selectedArea, setSelectedArea] = useState<AreaModel | null>(null);

  return (
    <IonCard className='home-card todo-summary-card'>
      <div className='todo-summary-title'>
        <CachedImage
          src={getFlowIcon('TODO').image}
          style={{ width: '24px', height: '24px' }}
          alt="todo icon"
        />
        <span>미결함</span>
      </div>
      <GroupButton onSelectionChange={(selectedItem) => {
        setSelectedArea(selectedItem);
      }} />
      <div style={{
        maxHeight: '150px',
        overflow: 'auto',
      }} onTouchMove={(e)=>e.stopPropagation()}>
        {
          approvals instanceof Error ?
            <div className='todo-summary-no-data'>
              <CachedImage
                src={searchIcon}
                style={{ width: '48px', height: '48px' }}
                alt="search icon"
              />
              <span>예상치 못한 오류가 발생했습니다.</span>
            </div>
            :
            approvals?.LIST?.length === 0 ?
              <div className='todo-summary-no-data'>
                <CachedImage
                  src={searchIcon}
                  style={{ width: '48px', height: '48px' }}
                  alt="search icon"
                />
                <span>미결 항목이 없습니다.</span>
              </div> :
              Array.from({ length: approvals?.LIST ? approvals?.LIST.length : 3 }).map((_, index) => (
                <ApprovalItem key={index} approvalItem={approvals?.LIST?.[index]} isLoading={!approvals?.LIST} index={index} onClick={() => {
                  router.push(`/detail/${approvals?.LIST?.[index].FLOWNO}`, 'forward', 'push');
                }} />
              ))
        }
      </div>
      <IonButton
        color='medium'
        className='menu-expand-button'
        fill="clear"
        onClick={() => {
          router.push(`/approval/${selectedArea?.P_AREA_CODE}/${selectedArea?.FLOWCODE}/${selectedArea?.P_AREA_CODE_TXT}/${selectedArea?.O_LTEXT}`);
        }}
        disabled={!approvals || !todoSummary || !todoSummary.length}
      >
        <span>자세히 보기</span>
        <IonIcon src={chevronForwardOutline} style={{ width: 14, marginLeft: 2 }} />
      </IonButton>
    </IonCard>
  );
}

interface ApprovalItemProps {
  approvalItem?: any;
  isLoading?: boolean;
  index: number;
  onClick: () => void;
}

const ApprovalItem: React.FC<ApprovalItemProps> = ({ approvalItem, isLoading = false, index, onClick }) => {
  if (isLoading || !approvalItem) {
    return (
      <div className='todo-summary-item-skeleton '>
        <CustomSkeleton width={200} />
      </div>
    );
  }

  return (
    <IonItem button className='todo-summary-ion-item' onClick={onClick}>
      <div className='todo-summary-item-wrapper'>
        <span className='todo-summary-index'>{`${index + 1}.`}</span>
        <div className='todo-summary-content'>
          <span className='todo-summary-item-title'>{approvalItem.APPR_TITLE}</span>
          <div className='todo-summary-item-sub-wrapper'>
            <span>{approvalItem.CREATE_DATE + '・'}</span>
            <IonIcon src={person} ></IonIcon>
            <span>{approvalItem.CREATOR_NAME}</span>
          </div>
        </div>
      </div>
    </IonItem>
  );
};

const StartButtons: React.FC = () => {

  return (
    <div style={{ marginTop: '32px' }}>
      <span style={{ fontSize: '17px', fontWeight: '600', marginLeft: '8px' }}>업무 시작</span>
      <div style={{
        marginTop: '12px',
        display: 'flex',
        gap: '12px'
      }}>
        <IonItem
          button
          mode='md'
          style={{ flex: 1, '--border-radius': '12px' }}
          onClick={() => { console.log('adsf') }}
        >
          <div style={{
            padding: '12px',
            height: '88px',
            width: '100%',
            background: 'linear-gradient(to bottom, transparent 0%, transparent calc(100% - 10px), rgba(var(--ion-color-primary-rgb), .08) 100%)'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '600', display: 'block', marginBottom: 4 }}>법인카드</span>
            <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ion-color-secondary)' }}> 5건</span>
            <CachedImage src={creditcardGlassIcon}
              style={{
                width: '48px',
                position: 'absolute',
                right: 12,
                bottom: 2
              }} />
          </div>
        </IonItem>
        <IonItem
          button
          mode='md'
          style={{ flex: 1, '--border-radius': '12px' }}
          onClick={() => { console.log('adsf') }}
        >
          <div style={{
            padding: '12px',
            height: '88px',
            width: '100%',
            background: 'linear-gradient(to bottom, transparent 0%, transparent calc(100% - 10px), rgba(var(--ion-color-primary-rgb), .08) 100%)'
          }}>
            <span style={{ fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: 4 }}>임직원개인경비</span>
            <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--ion-color-secondary)' }}> 38건</span>
            <CachedImage src={banknotesGlassIcon}
              style={{
                width: '48px',
                position: 'absolute',
                right: 12,
                bottom: 2
              }} />
          </div>
        </IonItem>
      </div>
      {/* <IonCard className='home-card menu-card'>
      </IonCard> */}
    </div>
  );
};

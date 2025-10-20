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
import { personIcon, searchIcon } from '../assets/images';
import { useShallow } from 'zustand/shallow';
import { webviewHaptic } from '../webview';
import CachedImage from '../components/CachedImage';

const Home: React.FC = () => {
  const setMenuAreas = useAppStore(state => state.setAreas);
  const setApprovals = useAppStore(state => state.setApprovals);

  const fetchAreas = useAppStore(state => state.fetchAreas);

  useIonViewWillEnter(() => {
    fetchAreas('');
  });

  async function handleRefresh(event: RefresherCustomEvent) {
    setMenuAreas(null);
    setApprovals(null);
    webviewHaptic("mediumImpact");
    await Promise.allSettled(([fetchAreas('')]));
    event.detail.complete();
  }

  return (
    <IonPage className="home">
      <AppBar showLogo={true} showSearchButton={true} showMenuButton={true} />

      <IonContent scrollEvents={false} scrollX={false} scrollY={true} forceOverscroll={false}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          {isPlatform('android') ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>
        {/* <div>
          <NoticeCard />
        </div> */}
        <div style={{ marginTop: '12px' }}>
          <WelcomeCard />
        </div>
        <div style={{ marginTop: '12px' }}>
          <MenuCard />
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
      <GroupButton />
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
          todoSummary?.length == 0 ?
            <div className='todo-summary-no-data'>
              <CachedImage
                src={searchIcon}
                style={{ width: '48px', height: '48px' }}
                alt="search icon"
              />
              <span>미결 항목이 없습니다.</span>
            </div> :
            Array.from({ length: !approvals?.LIST ? 3 : Math.min(approvals?.LIST.length, 3) }).map((_, index) => (
              <ApprovalItem key={index} approvalItem={approvals?.LIST?.[index]} isLoading={!approvals?.LIST} index={index} />
            ))
      }
      <IonButton
        color='medium'
        className='menu-expand-button'
        fill="clear"
        onClick={() => {
          router.push(`/approval/${approvals?.P_AREA_CODE}/${approvals?.AREA_CODE}/${approvals?.P_AREA_CODE_TXT}/${approvals?.AREA_CODE_TXT}`);
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
}

const ApprovalItem: React.FC<ApprovalItemProps> = ({ approvalItem, isLoading = false, index }) => {
  const router = useIonRouter();

  if (isLoading || !approvalItem) {
    return (
      <div className='todo-summary-item-skeleton '>
        <CustomSkeleton width={200} />
      </div>
    );
  }

  return (
    <IonItem button className='todo-summary-ion-item' onClick={() => {
      router.push(`/detail/${approvalItem.FLOWNO}`, 'forward', 'push');

    }}>
      <div className='todo-summary-item-wrapper'>
        <span className='todo-summary-index'>{`${index + 1}.`}</span>
        <div className='todo-summary-content'>
          <span className='todo-summary-item-title'>{approvalItem.TITLE}</span>
          <div className='todo-summary-item-sub-wrapper'>
            <span>{approvalItem.CREATE_DATE + '・'}</span>
            <IonIcon src={person} ></IonIcon>
            <span>{approvalItem.NAME}</span>
          </div>
        </div>
      </div>
    </IonItem>
  );
};

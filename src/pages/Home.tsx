import {
  IonContent,
  IonPage,
  IonItem,
  IonCard,
  IonButton,
  IonIcon,
  IonImg,
  useIonViewWillEnter,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  useIonRouter,
} from '@ionic/react';
import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chevronDown, chevronUp, chevronForwardOutline, person, refreshOutline } from 'ionicons/icons';
import CustomSkeleton from '../components/CustomSkeleton';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import './Home.css';
import { getFlowIcon, getPlatformMode } from '../utils';
import { ApprovalModel, AreaModel } from '../stores/types';
import GroupButton from '../components/GroupButton';
import BottomTabBar from '../components/BottomNavigation';
import { personIcon, searchIcon } from '../assets/images';

const Home: React.FC = () => {
  const setMenuAreas = useAppStore(state => state.setMenuAreas);
  const setTodoSummary = useAppStore(state => state.setTodoSummary);
  const setApprovals = useAppStore(state => state.setApprovals);

  const fetchMenuAreas = useAppStore(state => state.fetchMenuAreas);
  const fetchTodoSummary = useAppStore(state => state.fetchTodoSummary);

  useIonViewWillEnter(() => {
    fetchMenuAreas();
    fetchTodoSummary();
    console.log('home will enter');
  });

  async function handleRefresh(event: RefresherCustomEvent) {
    setMenuAreas(null);
    setTodoSummary(null);
    setApprovals(null);
    await Promise.allSettled(([fetchMenuAreas(), fetchTodoSummary()]));
    event.detail.complete();
  }

  return (
    <IonPage className="home">
      <AppBar showLogo={true} showSearchButton={true} showMenuButton={true} />

      <IonContent scrollEvents={false} scrollX={false} scrollY={true}>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} mode={getPlatformMode()}>
          {getPlatformMode() === 'md' ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>
        <div>
          <NoticeCard />
        </div>
        <div style={{ marginTop: '12px' }}>
          <WelcomeCard />
        </div>
        <div style={{ marginTop: '12px' }}>
          <MenuCard />
        </div>
        <div style={{ marginTop: '12px' }}>
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
  return (
    <IonCard className='home-card'>
      <div className='welcome-card-content'>
        <IonImg
          src={personIcon}
          style={{ width: '48px', height: '48px' }}
          alt="person"
        />
        <div className='welcome-card-name'>
          <span>이성하님</span>
          <span>좋은 하루 보내세요</span>
        </div>
        <IonButton fill='clear' mode='md' className='welcome-card-button'>내 정보</IonButton>
      </div>
    </IonCard>
  );
}


const MenuCard: React.FC = () => {
  const menuAreas = useAppStore(state => state.menuAreas);
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
            key={`expanded-${menu.flowCode}-${index}`}
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
    prevProps.menu.flowCode === nextProps.menu.flowCode &&
    prevProps.menu.oLtext === nextProps.menu.oLtext &&
    prevProps.menu.cnt === nextProps.menu.cnt
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

  const icon = getFlowIcon(menuItem.flowCode!);
  const router = useIonRouter();

  return (
    <IonItem button className='menu-ion-item' onClick={() => {
      router.push('/flowList', 'forward', 'push');
    }} mode='md'>
      <div className='menu-item'>
        <div className='menu-item-content'>
          <div className='menu-item-icon' style={{ backgroundColor: icon.backgroundColor }}>
            <IonImg
              src={icon.image}
              alt="menu icon"
            />
          </div>
          <span>{menuItem.oLtext}</span>
        </div>
        <span className='menu-item-count'>{menuItem.cnt}건</span>
      </div>
    </IonItem>
  );
};

const TodoSummaryCard: React.FC = () => {
  const todoSummary = useAppStore(state => state.todoSummary);
  const approvals = useAppStore(state => state.approvals);

  return (
    <IonCard className='home-card todo-summary-card'>
      <div className='todo-summary-title'>
        <IonImg
          src={getFlowIcon('TODO').image}
          style={{ width: '24px', height: '24px' }}
          alt="todo icon"
        />
        <span>미결함</span>
      </div>
      <GroupButton />
      <AnimatePresence>
        {todoSummary?.length == 0 ?
          <div className='todo-summary-no-data'>
            <IonImg
              src={searchIcon}
              style={{ width: '48px', height: '48px' }}
              alt="search icon"
            />
            <span>미결 항목이 없습니다.</span>
          </div> :
          Array.from({ length: !approvals ? 3 : Math.min(approvals.length, 3) }).map((_, index) => (
            <ApprovalItem key={index} approvalItem={approvals?.[index]} isLoading={!approvals} index={index} />
          ))}
      </AnimatePresence>
      <IonButton
        color='medium'
        className='menu-expand-button'
        fill="clear"
        onClick={() => { }}
        disabled={!todoSummary || !todoSummary.length}
      >
        <span>자세히 보기</span>
        <IonIcon src={chevronForwardOutline} style={{ width: 14, marginLeft: 2 }} />
      </IonButton>
    </IonCard>
  );
}

interface ApprovalItemProps {
  approvalItem?: ApprovalModel;
  isLoading?: boolean;
  index: number;
}

const ApprovalItem: React.FC<ApprovalItemProps> = ({ approvalItem, isLoading = false, index }) => {
  if (isLoading || !approvalItem) {
    return (
      <div className='todo-summary-item-skeleton '>
        <CustomSkeleton width={200} />
      </div>
    );
  }

  return (
    <IonItem button className='todo-summary-ion-item'>
      <div className='todo-summary-item-wrapper'>
        <span className='todo-summary-index'>{`${index + 1}.`}</span>
        <div className='todo-summary-content'>
          <span className='todo-summary-item-title'>{approvalItem.apprTitle}</span>
          <div className='todo-summary-item-sub-wrapper'>
            <span>{approvalItem.createDate + '・'}</span>
            <IonIcon src={person} ></IonIcon>
            <span>{approvalItem.creatorName}</span>
          </div>
        </div>
      </div>
    </IonItem>
  );
};

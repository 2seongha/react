import {
  IonContent,
  IonPage,
  IonItem,
  IonCard,
  IonCardContent,
  IonButton,
  IonIcon,
  useIonViewWillEnter,
  IonRefresher,
  IonRefresherContent,
  RefresherCustomEvent,
  useIonRouter,
} from '@ionic/react';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { chevronDown, chevronForwardOutline, person, refreshOutline } from 'ionicons/icons';
import CustomSkeleton from '../components/CustomSkeleton';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import './Home.css';
import { getFlowIcon, getPlatformMode } from '../utils';
import { ApprovalModel, AreaModel } from '../stores/types';
import GroupButton from '../components/GroupButton';
import LazyImage from '../components/LazyImage';

interface HomeProps {
  display?: string;
}

const Home: React.FC<HomeProps> = ({ display }) => {
  const setMenuAreas = useAppStore(state => state.setMenuAreas);
  const setTodoSummary = useAppStore(state => state.setTodoSummary);
  const setApprovals = useAppStore(state => state.setApprovals);

  const fetchMenuAreas = useAppStore(state => state.fetchMenuAreas);
  const fetchTodoSummary = useAppStore(state => state.fetchTodoSummary);

  useIonViewWillEnter(() => {
    fetchMenuAreas();
    fetchTodoSummary();
  });

  async function handleRefresh(event: RefresherCustomEvent) {
    setMenuAreas(null);
    setTodoSummary(null);
    setApprovals(null);
    await Promise.allSettled(([fetchMenuAreas(), fetchTodoSummary()]));
    event.detail.complete();
  }

  return (
    <IonContent fullscreen style={{ display: display }}>
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
        <LazyImage 
          src='/assets/images/icon/person.webp' 
          alt="사용자 프로필" 
          style={{ width: '48px', height: '48px' }}
          placeholder={<div style={{ width: '48px', height: '48px', backgroundColor: 'transparent', borderRadius: '50%' }} />}
        />
        <div className='welcome-card-name'>
          <span>이성하님</span>
          <span>좋은 하루 보내세요</span>
        </div>
        <IonButton fill='clear' className='welcome-card-button'>내 정보</IonButton>
      </div>
    </IonCard>
  );
}


const MenuCard: React.FC = () => {
  const menuAreas = useAppStore(state => state.menuAreas);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  const hasMoreMenus = menuAreas && menuAreas.length > 3;

  return (
    <IonCard className='home-card menu-card'>
      {/* <IonCardContent className='menu-card-context'> */}

      {Array.from({ length: !menuAreas ? 3 : Math.min(menuAreas.length, 3) }).map((_, index) => (
        <MenuItem key={index} menuItem={menuAreas?.[index]} isLoading={!menuAreas} />
      ))}
      <motion.div
        layout
        transition={{
          duration: 0.4,
          ease: "easeInOut",
        }}
      >
        <AnimatePresence>
          {isMenuExpanded && menuAreas && (menuAreas.slice(3)).map((menu, index) => {
            const icon = getFlowIcon(menu.flowCode!);

            return <motion.div key={index}
              layout
              initial={{
                opacity: 0,
                height: 0,
              }}
              animate={{
                opacity: 1,
                height: '48px',
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  delay: index * 0.04,
                  ease: "easeInOut",
                  opacity: { duration: 0.2 }
                }
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeInOut",
                height: { duration: 0.3 },
              }}
              style={{
                overflow: 'hidden', // ← 고정
              }}
            >
              {/* <IonItem button key={index} className='menu-ion-item'>
                <div className='menu-item'>
                  <div className='menu-item-content'>
                    <div className='menu-item-icon' style={{ backgroundColor: icon.backgroundColor }}>
                      <IonImg src={icon.image} />
                    </div>
                    <span>{menu.oLtext}</span>
                  </div>
                  <span className='menu-item-count'>{menu.cnt}건</span>
                </div>
              </IonItem> */}
              <MenuItem key={index} menuItem={menu} isLoading={!menuAreas} />

            </motion.div>
          })
          }
        </AnimatePresence>
      </motion.div>

      <IonButton
        color='medium'
        className='menu-expand-button'
        fill="clear"
        onClick={() => setIsMenuExpanded(!isMenuExpanded)}
        disabled={!hasMoreMenus}
      >
        <span>{isMenuExpanded ? '메뉴 접기' : '메뉴 펼치기'}</span>
        <motion.div
          style={{ paddingLeft: '4px' }}
          animate={{ rotate: isMenuExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <IonIcon
            icon={chevronDown}
          />
        </motion.div>
      </IonButton>
      {/* </IonCardContent> */}
    </IonCard>
  );
};

interface MenuItemProps {
  menuItem?: AreaModel;
  isLoading?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ menuItem, isLoading = false }) => {
  if (isLoading || !menuItem) {
    return (
      <IonItem className='menu-ion-item'>
        <div className='menu-item'>
          <CustomSkeleton width={80} />
          <CustomSkeleton width={50} />
        </div>
      </IonItem>
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
            <LazyImage 
              src={icon.image} 
              alt={menuItem.oLtext || ''} 
              placeholder={<div style={{ backgroundColor: icon.backgroundColor, width: '100%', height: '100%' }} />}
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
    <IonCard className='home-card todo-summary-card' onClick={() => {

    }}>
      <div className='todo-summary-title'>
        <LazyImage 
          src={getFlowIcon('TODO').image} 
          alt="미결함 아이콘" 
          style={{ width: '24px', height: '24px' }}
        />
        <span>미결함</span>
      </div>
      <GroupButton />
      <AnimatePresence>
        {todoSummary?.length == 0 ?
          <div className='todo-summary-no-data'>
            <LazyImage 
              src='/assets/images/icon/search.webp' 
              alt="검색 아이콘" 
              style={{ width: '48px', height: '48px' }}
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
      <div className='todo-summary-item-skeleton'>
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

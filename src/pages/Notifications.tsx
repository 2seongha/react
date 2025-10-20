import { IonButton, IonContent, IonFab, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonList, IonPage, IonRefresher, IonRefresherContent, IonSelect, IonSelectOption, IonToolbar, isPlatform, RefresherCustomEvent, useIonViewWillEnter } from '@ionic/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import AppBar from '../components/AppBar';
import BottomTabBar from '../components/BottomNavigation';
import './Notifications.css';
import useAppStore from '../stores/appStore';
import { webviewHaptic, webviewToast } from '../webview';
import { refreshOutline, trashOutline } from 'ionicons/icons';
import NoData from '../components/NoData';
import { OrbitProgress } from 'react-loading-indicators';
import CustomDialog from '../components/Dialog';
import { AnimatePresence, motion } from 'framer-motion';

const Notifications: React.FC = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [filterValue, setFilterValue] = useState("A");

  const fetchNotifications = useAppStore(state => state.fetchNotifications);
  const setNotifications = useAppStore(state => state.setNotifications);

  useIonViewWillEnter(() => {
    fetchNotifications();
  });

  async function handleRefresh(event: RefresherCustomEvent) {
    webviewHaptic("mediumImpact");
    setNotifications(null);
    await Promise.allSettled(([fetchNotifications()]));
    event.detail.complete();
  }

  const notifications = useAppStore(state => state.notifications);

  const filteredNotifications = useMemo(() => {
    if (!notifications) return null;

    if (filterValue === "A") return notifications;
    if (filterValue === "N") return notifications.filter((notifiaction: any) => notifiaction.READ_YN === "N");
    if (filterValue === "R") return notifications.filter((notifiaction: any) => notifiaction.READ_YN === "Y");

    return notifications;
  }, [notifications, filterValue]);

  useEffect(() => {
    setTotalCount(0);
    setTimeout(() => {
      setTotalCount(filteredNotifications?.length ? filteredNotifications?.length : 0);
    }, 200)
  }, [filteredNotifications]);

  const [isTop, setIsTop] = useState(true);
  const scrollCallbackRef = useRef<(() => void) | null>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);

  const scrollToTop = () => {
    contentRef.current?.scrollToTop(500);
  };

  useEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const handleScroll = () => {
      content.getScrollElement().then((scrollElement) => {
        if (scrollElement) {
          const scrollTop = scrollElement.scrollTop;
          setIsTop(scrollTop < 100);

          if (scrollCallbackRef.current) {
            scrollCallbackRef.current();
          }
        }
      });
    };

    content.getScrollElement().then((scrollElement) => {
      if (scrollElement) {
        scrollElement.addEventListener('scroll', handleScroll, { passive: true });
      }
    });

    return () => {
      content.getScrollElement().then((scrollElement) => {
        if (scrollElement) {
          scrollElement.removeEventListener('scroll', handleScroll);
        }
      });
    };
  }, []);

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(notifications?.filter((notification) =>
      notification.NOTIFY_NO !== notificationId
    ) || []);
    webviewToast('알림이 삭제되었습니다');

    //TODO 알림 단건 삭제 api 호출
  };

  return (
    <IonPage className="notifications">
      <AppBar
        title={<span>알림</span>}
        showCount={true}
        count={totalCount} />
      <IonHeader mode='ios'>
        <div style={{
          padding: '6px 0 6px 21px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <IonItem style={{
            fontSize: '16px',
            width: '130px',
            fontWeight: '500'
          }}>
            <IonSelect
              mode='md'
              interface="popover"
              placeholder="전체"
              value={filterValue}
              onIonChange={(e) => {
                setFilterValue(e.detail.value);
              }}
              className='select'>
              <IonSelectOption value="A">전체</IonSelectOption>
              <IonSelectOption value="N">읽지않은알림</IonSelectOption>
              <IonSelectOption value="R">읽은알림</IonSelectOption>
            </IonSelect>
          </IonItem>
          <div>
            <IonButton
              disabled={(notifications?.filter(notification => notification.READ_YN === 'N').length ?? 0) === 0}
              mode='md'
              fill='clear'
              style={{
                color: 'var(--ion-text-color)',
                fontSize: '15px',
                height: '42px'
              }}>모두 읽음</IonButton>
            <IonButton
              disabled={(notifications?.length ?? 0) === 0}
              id='all-delete-trigger'
              mode='md'
              fill='clear'
              style={{
                color: 'var(--ion-text-color)',
                fontSize: '15px',
                height: '42px'
              }}>모두 삭제</IonButton>
          </div>
        </div>
      </IonHeader>
      <IonContent
        ref={contentRef}
        scrollEvents={false}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          {isPlatform('android') ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>
        {
          !filteredNotifications ?
            <div className='loading-indicator-wrapper'>
              <OrbitProgress color="var(--ion-color-primary)" size="small" text="" textColor="" />
            </div>
            : (!filteredNotifications || filteredNotifications.length === 0) ?
              <NoData />
              :
              <IonList>
                <AnimatePresence>
                  {filteredNotifications.map(((notifiaction: any, index: number) => (
                    <motion.div
                      key={`notification-${notifiaction.NOTIFY_NO}`}
                      initial={{ opacity: 1 }}
                      exit={{
                        opacity: 0,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <IonItemSliding>
                        <IonItem button mode='md' onClick={() => { }}>
                          <div
                            className={notifiaction.READ_YN === 'N' ? 'not-read' : ''}
                            style={{
                              width: '100%',
                              padding: '30px 24px',
                              borderBottom: '1px solid var(--custom-border-color-50)',
                              display: 'flex',
                              flexDirection: 'column',
                              backgroundColor: notifiaction.READ_YN === 'N' ? 'rgba(var(--ion-color-primary-rgb), .08)' : 'transparent',
                              position: 'relative'
                            }}>
                            <span style={{ fontWeight: '400', fontSize: '13px', color: 'var(--ion-color-secondary)', position: 'absolute', right: '16px', top: '16px' }}>{notifiaction.ERDAT}</span>
                            <span style={{ fontWeight: '700', fontSize: '15px', marginBottom: '6px', display: 'flex', alignItems: 'center', color: notifiaction.READ_YN === 'N' ? 'var(--ion-text-color)' : 'var(--ion-color-step-600)' }}>
                              {notifiaction.TITLE}
                            </span>
                            <span style={{ fontWeight: '500', fontSize: '14px', color: notifiaction.READ_YN === 'N' ? 'var(--ion-color-step-800)' : 'var(--ion-color-step-600)' }}>{notifiaction.CONTENT}</span>
                          </div>
                        </IonItem>
                        <IonItemOptions side="end" >
                          <IonItemOption
                            color="danger"
                            onClick={() => handleDeleteNotification(notifiaction.NOTIFY_NO)}
                          >
                            <IonIcon icon={trashOutline} style={{ width: '60px', fontSize: '22px' }} />
                          </IonItemOption>
                        </IonItemOptions>
                      </IonItemSliding>
                    </motion.div>
                  )))}
                </AnimatePresence>
              </IonList>
        }
        <ScrollToTopFab
          isTop={isTop}
          onScrollToTop={scrollToTop}
          scrollCallbackRef={scrollCallbackRef}
        />
        <CustomDialog
          trigger="all-delete-trigger"
          title="알림"
          message="알림을 모두 삭제하시겠습니까?"
          firstButtonText='아니오'
          secondButtonText='예'
          onSecondButtonClick={() => {
            //TODO 전체 삭제
            setNotifications([]);
          }}
        />
      </IonContent>
      <BottomTabBar />
    </IonPage>
  );
};

export default Notifications;

// 독립적인 ScrollToTop FAB 컴포넌트
interface ScrollToTopFabProps {
  isTop: boolean;
  onScrollToTop: () => void;
  scrollCallbackRef: React.RefObject<(() => void) | null>;
}

const ScrollToTopFab: React.FC<ScrollToTopFabProps> = React.memo(({ isTop, onScrollToTop, scrollCallbackRef }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Virtuoso의 rangeChanged 이벤트를 통해 스크롤 감지
    const handleScroll = () => {
      if (!isTop) {
        if (!isScrolling) {  // 이미 스크롤 중이면 중복 처리 방지
          setIsScrolling(true);
        }

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false);
        }, 2000);
      }
    };

    // callback 등록
    scrollCallbackRef.current = handleScroll;

    return () => {
      scrollCallbackRef.current = null;
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isTop, isScrolling, scrollCallbackRef]);

  return (
    <IonFab
      vertical="bottom"
      horizontal="end"
      slot="fixed"
      style={{
        marginBottom: 'calc(var(--ion-safe-area-bottom) + 12px)',
        opacity: (isScrolling && !isTop) ? 1 : 0,
        transform: (isScrolling && !isTop) ? 'scale(1)' : 'scale(0.8)',
        transition: 'all 0.3s ease-in-out',
        pointerEvents: (isScrolling && !isTop) ? 'auto' : 'none'
      }}
    >
      <IonButton onTouchStart={onScrollToTop} className='scroll-top-button'>
        <span>상단으로 이동</span>
      </IonButton>
    </IonFab>
  );
});

import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonList, IonPage, IonRefresher, IonRefresherContent, IonSelect, IonSelectOption, isPlatform, RefresherCustomEvent, useIonViewWillEnter } from '@ionic/react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AppBar from '../components/AppBar';
import BottomTabBar from '../components/BottomNavigation';
import ScrollToTopFab, { useScrollToTop } from '../components/ScrollToTopFab';
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

  const handleRefresh = useCallback(async (event: RefresherCustomEvent) => {
    webviewHaptic("mediumImpact");
    setNotifications(null);
    await Promise.allSettled(([fetchNotifications()]));
    event.detail.complete();
  }, [fetchNotifications, setNotifications]);

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

  const { isTop, scrollToTop, scrollCallbackRef, contentRef } = useScrollToTop();

  const handleDeleteNotification = useCallback((notificationId: string) => {
    setNotifications(notifications?.filter((notification) =>
      notification.NOTIFY_NO !== notificationId
    ) || []);
    webviewToast('알림이 삭제되었습니다');

    //TODO 알림 단건 삭제 api 호출
  }, [notifications, setNotifications]);

  return (
    <IonPage className="notifications">
      <AppBar
        title={<span>알림</span>}
        showCount={true}
        count={totalCount} />
      <IonHeader mode='ios'>
        <div className="filter-header">
          <IonItem className="filter-select-item">
            <IonSelect
              mode='md'
              interface="popover"
              placeholder="전체"
              value={filterValue}
              onIonChange={useCallback((e: any) => {
                setFilterValue(e.detail.value);
              }, [])}
              className='select'>
              <IonSelectOption value="A">전체</IonSelectOption>
              <IonSelectOption value="N">읽지않은알림</IonSelectOption>
              <IonSelectOption value="R">읽은알림</IonSelectOption>
            </IonSelect>
          </IonItem>
          <div className="filter-buttons">
            <IonButton
              disabled={useMemo(() => (notifications?.filter(notification => notification.READ_YN === 'N').length ?? 0) === 0, [notifications])}
              mode='md'
              fill='clear'
              className="filter-button">모두 읽음</IonButton>
            <IonButton
              disabled={useMemo(() => (notifications?.length ?? 0) === 0, [notifications])}
              id='all-delete-trigger'
              mode='md'
              fill='clear'
              className="filter-button">모두 삭제</IonButton>
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
                  {filteredNotifications.map((notification: any) => (
                    <NotificationItem
                      key={notification.NOTIFY_NO}
                      notification={notification}
                      onDelete={handleDeleteNotification}
                    />
                  ))}
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
          onSecondButtonClick={useCallback(() => {
            //TODO 전체 삭제
            setNotifications([]);
          }, [setNotifications])}
        />
      </IonContent>
      <BottomTabBar />
    </IonPage>
  );
};

export default Notifications;

interface NotificationItemProps {
  notification: any;
  onDelete: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = React.memo(({ notification, onDelete }) => {
  return (
    <motion.div
      key={`notification-${notification.NOTIFY_NO}`}
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.3 }
      }}
    >
      <IonItemSliding>
        <IonItem button mode='md' onClick={() => { }}>
          <div
            className={`notification-item ${notification.READ_YN === 'N' ? `not-read ${notification.TYPE}` : ''}`}
          >
            <span className="notification-date">{notification.ERDAT}</span>
            <span className={`notification-title ${notification.READ_YN === 'N' ? 'unread' : 'read'}`}>
              {notification.TITLE}
            </span>
            <span className={`notification-content ${notification.READ_YN === 'N' ? 'unread' : 'read'}`}>
              {notification.CONTENT}
            </span>
          </div>
        </IonItem>
        <IonItemOptions side="end">
          <IonItemOption
            color="danger"
            onClick={() => onDelete(notification.NOTIFY_NO)}
          >
            <IonIcon icon={trashOutline} className="delete-icon" />
          </IonItemOption>
        </IonItemOptions>
      </IonItemSliding>
    </motion.div>
  );
});


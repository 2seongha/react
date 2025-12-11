import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonPage, IonRefresher, IonRefresherContent, IonSelect, IonSelectOption, isPlatform, RefresherCustomEvent, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import AppBar from '../components/AppBar';
import BottomTabBar from '../components/BottomNavigation';
import ScrollToTopFab, { useVirtuosoScrollToTop } from '../components/ScrollToTopFab';
import './Notifications.css';
import useAppStore from '../stores/appStore';
import { webviewHaptic, webviewToast } from '../webview';
import { refreshOutline, trashOutline } from 'ionicons/icons';
import NoData from '../components/NoData';
import CustomDialog from '../components/Dialog';
import { Virtuoso } from 'react-virtuoso';
import LoadingIndicator from '../components/LoadingIndicator';

const Notifications: React.FC = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [filterValue, setFilterValue] = useState("A");
  const [refreshEnable, setRefreshEnable] = useState(true);

  const getApprovals = useAppStore(state => state.getApprovals);
  const setApprovals = useAppStore(state => state.setApprovals);
  const getNotifications = useAppStore(state => state.getNotifications);
  const setNotifications = useAppStore(state => state.setNotifications);
  const patchNotifications = useAppStore(state => state.patchNotifications);

  useIonViewWillEnter(() => {
    getNotifications();
  });

  const handleRefresh = useCallback(async (event: RefresherCustomEvent) => {
    webviewHaptic("mediumImpact");
    setNotifications(null);
    await Promise.allSettled([getNotifications()]);
    event.detail.complete();
  }, [getNotifications, setNotifications]);

  const notifications = useAppStore(state => state.notifications);
  const router = useIonRouter();

  const filteredNotifications = useMemo(() => {
    if (!notifications) return null;

    if (filterValue === "A") return notifications;
    if (filterValue === "N") return notifications.filter((notifiaction: any) => notifiaction.READ_YN === "N");
    if (filterValue === "R") return notifications.filter((notifiaction: any) => notifiaction.READ_YN === "Y");

    return notifications;
  }, [notifications, filterValue]);

  useEffect(() => {
    setTimeout(() => {
      setTotalCount(filteredNotifications?.length ? filteredNotifications?.filter(n => n.READ_YN === 'N').length : 0);
    }, 100)
  }, [filteredNotifications]);

  const { isTop, scrollToTop, scrollCallbackRef, contentRef, scrollerRef } = useVirtuosoScrollToTop();

  //? 알림 읽음
  const handleReadNotification = useCallback(async (notifyNo: string) => {
    setNotifications(notifications?.map(notification => {
      if (notification.NOTIFY_NO === notifyNo) notification.READ_YN = 'Y';
      return notification;
    }) || []);
    patchNotifications(notifyNo, 'Y', 'N');

    const notifiaction = notifications?.find(n => n.NOTIFY_NO === notifyNo);
    const link = notifiaction?.LINK?.split('/');
    if (!link) return webviewToast('결재 내역을 확인할 수 없습니다');

    setApprovals(null);
    getApprovals('', '', link[0], link[1]); // 0: flowCode, 1: flowNo
    router.push(`/detail/${link[1]}/-/-/-/-/Y`, 'forward', 'push');
  }, [notifications]);

  //? 알림 삭제
  const handleDeleteNotification = useCallback((notifyNo: string) => {
    setNotifications(notifications?.filter(notification =>
      notification.NOTIFY_NO !== notifyNo
    ) || []);
    patchNotifications(notifyNo, 'Y', 'Y');
    webviewToast('알림이 삭제되었습니다');
  }, [notifications]);

  //? 모두 읽음 
  const handleReadAll = useCallback(() => {
    setNotifications(notifications?.map(notification => {
      notification.READ_YN = 'Y';
      return notification;
    }) || []);
    patchNotifications('', 'Y', '');
  }, [notifications]);

  //? 모두 삭제
  const handleDeleteAll = useCallback(() => {
    setNotifications([]);
    patchNotifications('', 'Y', 'Y');
  }, [notifications]);

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
          <div>
            <IonButton
              disabled={useMemo(() => (notifications?.filter(notification => notification.READ_YN === 'N').length ?? 0) === 0, [notifications])}
              mode='md'
              fill='clear'
              onClick={handleReadAll}
              className="filter-button">모두읽음</IonButton>
            <IonButton
              disabled={useMemo(() => (notifications?.length ?? 0) === 0, [notifications])}
              id='all-delete-trigger'
              mode='md'
              fill='clear'
              className="filter-button">모두삭제</IonButton>
          </div>
        </div>
      </IonHeader>
      <IonContent
        scrollEvents={false}
        scrollY={false}
      >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh} disabled={!refreshEnable}  >
          {isPlatform('android') ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>
        {
          !filteredNotifications ?
            <div className='loading-indicator-wrapper'>
              <LoadingIndicator color="var(--ion-color-primary)" />
            </div>
            : (!filteredNotifications || filteredNotifications.length === 0) ?
              <NoData />
              :
              <Virtuoso
                ref={contentRef}
                scrollerRef={scrollerRef}
                data={filteredNotifications}
                overscan={15}
                initialItemCount={15}
                initialTopMostItemIndex={0}
                increaseViewportBy={{ top: 200, bottom: 200 }}
                atTopStateChange={atTop => setRefreshEnable(atTop)}
                itemContent={(index, notification) => (
                  <NotificationItem
                    notification={notification}
                    onRead={handleReadNotification}
                    onDelete={handleDeleteNotification}
                  />
                )}
              />
        }
        <ScrollToTopFab
          isTop={isTop}
          onScrollToTop={scrollToTop}
          scrollCallbackRef={scrollCallbackRef}
          safeAreaBottom={false}
        />
        <CustomDialog
          trigger="all-delete-trigger"
          title="알림"
          message="알림을 모두 삭제하시겠습니까?"
          firstButtonText='아니오'
          secondButtonText='예'
          onSecondButtonClick={handleDeleteAll}
        />
      </IonContent>
      <BottomTabBar />
    </IonPage>
  );
};

export default Notifications;

interface NotificationItemProps {
  notification: any;
  onRead: (notifyNo: string) => void;
  onDelete: (notifyNo: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = React.memo(({ notification, onDelete, onRead }) => {
  return (
    <div style={{ height: '99.5px' }}>
      <IonItemSliding>
        <IonItem button mode='md' onClick={() => onRead(notification.NOTIFY_NO)}>
          <div
            className={`notification-item ${notification.READ_YN === 'N' ? `not-read ${notification.TYPE}` : ''}`}
          >
            <span className={`notification-date ${notification.READ_YN === 'N' ? 'unread' : 'read'}`}>{notification.CREATED_AT}</span>
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
    </div>
  );
});


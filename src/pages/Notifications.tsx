import { IonButton, IonContent, IonHeader, IonIcon, IonItem, IonItemOption, IonItemOptions, IonItemSliding, IonList, IonPage, IonRefresher, IonRefresherContent, IonSelect, IonSelectOption, IonToolbar, isPlatform, RefresherCustomEvent, useIonViewWillEnter } from '@ionic/react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import AppBar from '../components/AppBar';
import BottomTabBar from '../components/BottomNavigation';
import './Notifications.css';
import useAppStore from '../stores/appStore';
import { webviewHaptic } from '../webview';
import { refreshOutline, trashOutline } from 'ionicons/icons';
import NoData from '../components/NoData';

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
              mode='md'
              fill='clear'
              style={{
                fontSize: '15px',
                height: '42px'
              }}>모두 읽음</IonButton>
            <IonButton
              mode='md'
              fill='clear'
              style={{
                fontSize: '15px',
                height: '42px'
              }}>모두 삭제</IonButton>
          </div>
        </div>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          {isPlatform('android') ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>
        {
          filteredNotifications ?
            <IonList>
              {filteredNotifications.map(((notifiaction: any, index: number) => (
                <IonItemSliding key={`notification-${index}`}>
                  <IonItem>
                    <div
                      className={notifiaction.READ_YN === 'N' ? 'not-read' : ''}
                      style={{
                        width: '100%',
                        padding: '28px 24px',
                        borderBottom: '1px solid var(--custom-border-color-50)',
                        display: 'flex',
                        flexDirection: 'column',
                        backgroundColor: notifiaction.READ_YN === 'N' ? 'rgba(var(--ion-color-primary-rgb), .08)' : 'transparent',
                        position: 'relative'
                      }}>
                      {/* {notifiaction.READ_YN === 'N' &&
                        <div style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '3px',
                          marginRight: '8px',
                          backgroundColor: 'var(--ion-color-primary)'
                        }} />
                      } */}
                      <span style={{ fontWeight: '400', fontSize: '13px', color: 'var(--ion-color-secondary)', position: 'absolute', right: '16px', top: '16px' }}>{notifiaction.ERDAT}</span>
                      <span style={{ fontWeight: '500', fontSize: '15px', marginBottom: '6px', display: 'flex', alignItems: 'center', color: notifiaction.READ_YN === 'N' ? 'var(--ion-color-primary)' : 'var(--ion-text-secondary)' }}>
                        {notifiaction.TITLE}
                      </span>
                      <span style={{ fontWeight: '400', fontSize: '13px' }}>{notifiaction.CONTENT}</span>
                    </div>
                  </IonItem>
                  <IonItemOptions side="end" >
                    <IonItemOption color="danger" >
                      <IonIcon icon={trashOutline} style={{ width: '60px' }} />
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              )))}
            </IonList> :
            <NoData />
        }
      </IonContent>
      <BottomTabBar />
    </IonPage>
  );
};

export default Notifications;

import React, { useMemo } from 'react';
import {
  IonContent,
  IonPage,
  useIonViewWillEnter,
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import NoData from '../components/NoData';
import dayjs from 'dayjs';

const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const getNotices = useAppStore(state => state.getNotices);
  const notices = useAppStore(state => state.notices);

  useIonViewWillEnter(() => {
    if (!notices) getNotices();
  });

  const notice = useMemo(() => {
    if (!notices) return null;
    return notices.find(item => item.SEQNO === id || item.NO === id) || null;
  }, [notices, id]);

  const isRecentNotice = useMemo(() => {
    if (!notice?.CRE_DATE) return false;
    const created = dayjs(notice.CRE_DATE, 'YYYYMMDD', true);
    if (!created.isValid()) return false;
    return dayjs().diff(created, 'day') <= 7;
  }, [notice]);

  return (
    <IonPage>
      <AppBar title={<span></span>} showBackButton={true} />
      <IonContent>
        {!notice ? (
          <NoData />
        ) : (
          <div style={{ padding: '16px 21px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--ion-text-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}>
                {notice.TITLE}
              </div>
              <span style={{
                fontSize: '13px',
                color: 'var(--ion-color-secondary)'
              }}>{dayjs(notice.CRE_DATE).format('YYYY-MM-DD')} {notice.CRE_TIME.replace(/(\d{2})(?=\d)/g, '$1:')}</span>
            </div>
            <div style={{
              marginTop: '8px',
              fontSize: '13px',
              color: 'var(--ion-color-step-600)',
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
            }}>
              <span>{notice.CREATOR_NAME}</span>
              <span>{notice.CREATOR_ID}</span>
            </div>
            <div style={{
              borderTop: '1px solid var(--custom-border-color-50)',
              marginTop: '16px',
              fontSize: '14px',
              color: 'var(--ion-text-color)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.6,
              paddingTop: '24px'
            }}>
              {notice.LTEXT}
            </div>
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default NoticeDetail;

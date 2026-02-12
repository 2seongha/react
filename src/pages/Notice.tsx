import { IonContent, IonHeader, IonPage, IonRefresher, IonRefresherContent, isPlatform, RefresherCustomEvent, useIonRouter, useIonViewWillEnter } from '@ionic/react';
import React, { useCallback, useMemo, useRef } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import NoData from '../components/NoData';
import { NoticeModel } from '../stores/types';
import dayjs from 'dayjs';
import { refreshOutline } from 'ionicons/icons';
import { webviewHaptic } from '../webview';

const Notice: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const getNoticies = useAppStore(state => state.getNotices);
  const noticies = useAppStore(state => state.notices);
  const router = useIonRouter();

  const swiperRef = useRef<SwiperClass | null>(null);
  useIonViewWillEnter(() => {
    getNoticies();
  }, [])

  const allNotices = useMemo(
    () => noticies?.filter((notice) => notice.ALL_MODE === 'A') ?? [],
    [noticies]
  );
  const deptNotices = useMemo(
    () => noticies?.filter((notice) => notice.ALL_MODE === 'P') ?? [],
    [noticies]
  );

  const handleTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (swiperRef.current) {
      swiperRef.current.slideTo(newValue);
    }
  }, []);

  const handleRefresh = useCallback(async (event: RefresherCustomEvent) => {
    webviewHaptic("mediumImpact");
    await Promise.allSettled([getNoticies()]);
    event.detail.complete();
  }, [getNoticies]);

  return (
    <IonPage>
      <IonHeader>
        <AppBar title={<span>공지사항</span>} showBackButton={true} />
        <Tabs value={value} onChange={handleTabChange} variant="fullWidth" aria-label="탭 메뉴" sx={{
          '& .MuiTab-root': {
            outline: 'none',
            boxShadow: 'none',
            color: 'var(--ion-text-color)'
          },
          '& .Mui-selected': {
            color: 'var(--ion-color-primary)', // 선택되었을 때 글자 색상
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'var(--ion-color-primary)', // 아래쪽 바(인디케이터) 색상
          },
        }}>
          <Tab label="전체" />
          <Tab label="부서" />
        </Tabs>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          {isPlatform('android') ? <IonRefresherContent /> : <IonRefresherContent pullingIcon={refreshOutline} />}
        </IonRefresher>
        <Swiper onSwiper={(swiper) => swiperRef.current = swiper}
          onSlideChange={(swiper) => setValue(swiper.activeIndex)}
          style={{ height: "100%" }}>
          <SwiperSlide>
            <NoticeList
              items={allNotices}
              onItemClick={(notice) => {
                const id = notice.SEQNO || notice.NO;
                if (!id) return;
                router.push(`/notice/${id}`, 'forward', 'push');
              }}
            />
          </SwiperSlide>
          <SwiperSlide>
            <NoticeList
              items={deptNotices}
              onItemClick={(notice) => {
                const id = notice.SEQNO || notice.NO;
                if (!id) return;
                router.push(`/notice/${id}`, 'forward', 'push');
              }}
            />
          </SwiperSlide>
          {/* 추가 슬라이드들 */}
        </Swiper>
      </IonContent>
    </IonPage >
  );
};

export default Notice;

const NoticeList: React.FC<{
  items: NoticeModel[];
  onItemClick: (notice: NoticeModel) => void;
}> = ({ items, onItemClick }) => {
  if (!items.length) return <NoData />;

  const isRecentNotice = (notice: NoticeModel) => {
    if (!notice.CRE_DATE) return false;
    const created = dayjs(notice.CRE_DATE, 'YYYYMMDD', true);
    if (!created.isValid()) return false;
    return dayjs().diff(created, 'day') <= 7;
  };

  return (
    <div style={{ padding: '12px 21px' }}>
      {items.map((notice, index) => (
        <div
          key={notice.SEQNO || notice.NO || `${notice.CREATOR_ID}-${notice.CRE_DATE}-${index}`}
          onClick={() => onItemClick(notice)}
          style={{
            padding: '18px 0',
            borderBottom: '1px solid var(--custom-border-color-50)',
            cursor: 'pointer',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--ion-text-color)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {notice.TITLE}
              {isRecentNotice(notice) && (
                <span style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#fff',
                  backgroundColor: '#f65353',
                  borderRadius: '6px',
                  padding: '2px 6px',
                  lineHeight: 1,
                }}>
                  New
                </span>
              )}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'var(--ion-color-secondary)'
            }}>
              <span>{dayjs(notice.CRE_DATE).format('YYYY-MM-DD')}</span>
              <span>{notice.CRE_TIME.replace(/(\d{2})(?=\d)/g, '$1:')}</span>
            </div>
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
        </div>
      ))}
    </div>
  );
};

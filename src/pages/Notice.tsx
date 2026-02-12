import { IonContent, IonHeader, IonPage, useIonViewWillEnter } from '@ionic/react';
import React, { useRef } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';

const Notice: React.FC = () => {
  const [value, setValue] = React.useState(0);
  const getNoticies = useAppStore(state => state.getNotices);
  const noticies = useAppStore(state => state.notices);

  const swiperRef = useRef<SwiperClass | null>(null);
  useIonViewWillEnter(() => {
    getNoticies();
  }, [])

  const handleTabChange = React.useCallback((event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (swiperRef.current) {
      swiperRef.current.slideTo(newValue);
    }
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <AppBar title={<span>공지</span>} showBackButton={true} />
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

        <Swiper onSwiper={(swiper) => swiperRef.current = swiper}
          onSlideChange={(swiper) => setValue(swiper.activeIndex)}
          style={{ height: "100%" }}>
          <SwiperSlide>
            <h2>전체공지</h2>
            <p>전체공지 콘텐츠</p>
          </SwiperSlide>
          <SwiperSlide>
            <h2>부서공지</h2>
            <p>부서공지 콘텐츠</p>
          </SwiperSlide>
          {/* 추가 슬라이드들 */}
        </Swiper>
      </IonContent>
    </IonPage >
  );
};

export default Notice;

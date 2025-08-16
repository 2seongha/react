import { IonContent, IonPage, useIonViewWillEnter } from '@ionic/react';
import React, { useRef } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import AppBar from '../components/AppBar';
import BottomTabBar from '../components/BottomNavigation';

const Notifications: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const swiperRef = useRef<SwiperClass | null>(null);

  useIonViewWillEnter(() => {
    console.log('notifications will enter');
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (swiperRef.current) {
      swiperRef.current.slideTo(newValue);
    }
  };

  return (
    <IonPage className="notifications">
      <AppBar title={<span>알림</span>} />
      <IonContent fullscreen>
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
      <BottomTabBar />
    </IonPage>
  );
};

export default Notifications;

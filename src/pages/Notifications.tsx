import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useRef } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import AppBar from '../components/AppBar';

interface NotificationsProps {
  display?: string;
}

const Notifications: React.FC<NotificationsProps> = ({ display }) => {
  const [value, setValue] = React.useState(0);

  const swiperRef = useRef<SwiperClass | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (swiperRef.current) {
      swiperRef.current.slideTo(newValue);
    }
  };

  return (
    <IonContent fullscreen style={{ display: display }}>
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
  );
};

export default Notifications;

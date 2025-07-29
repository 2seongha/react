import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React, { useRef } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import 'swiper/css';

const Notifications: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const swiperRef = useRef<SwiperClass | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    if (swiperRef.current) {
      swiperRef.current.slideTo(newValue);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>알림</IonTitle>
        </IonToolbar>
        <Tabs value={value} onChange={handleTabChange} variant="fullWidth" aria-label="탭 메뉴" >
          <Tab label="전체 공지" />
          <Tab label="부서 공지" />
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

export default Notifications;

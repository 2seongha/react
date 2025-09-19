import { IonContent, IonHeader, IonPage } from '@ionic/react';
import React, { useRef } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import AppBar from '../components/AppBar';

const Notice: React.FC = () => {
  const [value, setValue] = React.useState(0);

  const swiperRef = useRef<SwiperClass | null>(null);

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
          },
        }}>
          <Tab label="전체" />
          <Tab label="부서" />
        </Tabs>
      </IonHeader>

      <IonContent fullscreen className="ion-padding" scrollEvents={false} scrollX={false} scrollY={false}>
        <div style={{ height: '100%', overflow: 'auto' }}>

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
        </div>
      </IonContent>
    </IonPage >
  );
};

export default Notice;

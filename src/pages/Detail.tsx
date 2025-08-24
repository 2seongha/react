import { IonContent, IonPage, createGesture } from '@ionic/react';
import React, { useRef, useCallback, useEffect, memo } from 'react';
import { useParams } from 'react-router-dom';
import AppBar from '../components/AppBar';
import useAppStore from '../stores/appStore';
import { useShallow } from 'zustand/shallow'
import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
import Tabs from '@mui/material/Tabs';
import { Tab } from '@mui/material';
import { useSnapScroll } from '../hooks/useScrollDelegate';
import { animateScroll as scroll } from 'react-scroll';
import './Detail.css';

interface DetailParams {
  flowNo: string;
}

const Detail: React.FC = memo(() => {
  const { flowNo } = useParams<DetailParams>();
  const approval = useAppStore(useShallow(state => state.approvals?.find(approval => approval.flowNo === flowNo) || null));
  const [value, setValue] = React.useState(0);
  const swiperRef = useRef<SwiperClass | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
    // swiperRef.current?.slideTo(newValue);
  }, []);

  // 스냅 스크롤 hook 사용
  const { snapToPosition } = useSnapScroll({
    scrollContainer: scrollContainerRef.current,
    tabsElement: tabsRef.current,
    isHeaderVisible: true // 초기값
  });

  // wrapper scroll event로 실제 스크롤 위임
  useEffect(() => {
    const headerElement = headerRef.current;
    const scrollContainer = scrollContainerRef.current;

    if (!headerElement || !scrollContainer) return;

    // wrapper scroll 이벤트 - delta 값으로 스크롤 위임
    let lastScrollTop = 0;
    let isResettingScroll = false;
    let accumulatedPaddingTop = 0;
    const handleScroll = (e: Event) => {
      if (isResettingScroll) return;

      const target = e.target as HTMLElement;
      const firstChild = target.firstElementChild as HTMLElement;
      const scrollContainer = scrollContainerRef.current;
      const headerElement = headerRef.current;

      if (!scrollContainer || !headerElement) return;

      // const currentScrollTop = target.scrollTop;
      const currentScrollTop = target.scrollTop;
      const delta = currentScrollTop - lastScrollTop;

      if (delta !== 0) {
        // 부모에 delta만큼 스크롤 적용
        scrollContainer.scrollTop += delta;

        // 자식 스크롤 리셋을 다음 프레임으로 지연
        isResettingScroll = true;
        requestAnimationFrame(() => {
          // padding-top 누적
          if (headerElement.style.display != 'none') {
            accumulatedPaddingTop += delta;
            // target.style.paddingTop = `${accumulatedPaddingTop}px`;
            firstChild.style.transform = `translateY(${accumulatedPaddingTop}px)`;
          }

          isResettingScroll = false;
        });
      }

      // 헤더 숨김 조건
      if (scrollContainer.scrollTop >= headerElement.offsetHeight && headerElement.style.display != 'none') {
        headerElement.style.display = 'none';
        // target.style.paddingTop = `0px`;
        firstChild.style.transform = `translateY(0px)`;
        target.scrollTop = 0;
        console.log('Header 숨김');
      }

      lastScrollTop = currentScrollTop;
    };

    const handleScrollEnd = (e: Event) => {
      if (isResettingScroll) return;
      accumulatedPaddingTop = 0;
      const target = e.target as HTMLElement;
      if (target.scrollTop == 0 && headerElement.style.display == 'none') {
        headerElement.style.display = 'block';
        scrollContainer.scrollTop = 280;
        console.log('Header 살림');
      }
    }

    // let isSnapping = false;

    // const handleScrollEnd2 = (e: Event) => {
    //   if (isResettingScroll || isSnapping) return;

    //   if (headerElement.style.display != 'none') {
    //     const scrollTop = scrollContainer.scrollTop;

    //     if (scrollTop > 140) {
    //       isSnapping = true;
    //       console.log('Snapping to top');
    //       scroll.scrollTo(0, {
    //         containerId: 'scroll-container',
    //         duration: 150,
    //         smooth: 'easeOutQuad',
    //         onComplete: () => {
    //           isSnapping = false; // 스냅 완료 후 플래그 해제
    //         }
    //       });
    //     } else {
    //       const tabsTop = tabsRef.current?.offsetTop ?? 0;
    //       isSnapping = true;
    //       console.log('Snapping to tabs:', tabsTop);
    //       scroll.scrollTo(tabsTop, {
    //         containerId: 'scroll-container',
    //         duration: 150,
    //         smooth: 'easeOutQuad',
    //         onComplete: () => {
    //           isSnapping = false;
    //         }
    //       });
    //     }
    //   }
    // };

    // scrollContainer.addEventListener('scrollend', handleScrollEnd2, { passive: false });
    const slides = scrollContainer.querySelectorAll('.swiper-slide');
    slides.forEach(slide => {
      slide.addEventListener('scroll', handleScroll, { passive: false });
      slide.addEventListener('scrollend', handleScrollEnd, { passive: false });
    });

    return () => {
      // wrapper.removeEventListener('scroll', handleScroll);
      // wrapper.removeEventListener('scrollend', handleScrollEnd);
    };
  }, []);

  if (!approval) {
    return (
      <IonPage>
        <AppBar title={<span>상세</span>} showBackButton={true} />
        <IonContent fullscreen>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            color: 'var(--ion-color-medium)'
          }}>
            해당 결재 정보를 찾을 수 없습니다.
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <AppBar showBackButton={true}
        title={
          <span>{approval.apprTitle}</span>
        } />
      <IonContent
        scrollY={false}
        scrollEvents={false}
      >
        <div ref={scrollContainerRef} style={{
          overflow: 'auto',
          height: '100%',
          position: 'relative',
        }}>
          <div ref={headerRef} style={{
            background: '#666',
            height: '280px',
            overflow: 'hidden',
            willChange: 'transform',
            contain: 'layout style paint'
          }}>
            <span>{approval.apprTitle}</span>
            <div>
              <div>
                <span>결재</span>
              </div>
            </div>
          </div>

          <Tabs ref={tabsRef} value={value} onChange={handleTabChange} variant="fullWidth" style={{
            position: 'sticky',
            top: 0,
            background: 'var(--ion-background-color)',
            zIndex: 2,
            willChange: 'transform',
            contain: 'layout style'
          }}>
            <Tab label="상세" />
            <Tab label="결재선" />
            <Tab label="첨부파일" />
          </Tabs>

          <Swiper
            style={{ height: 'calc(100% - 48px)', width: '100%' }}
            onSwiper={useCallback((swiper: SwiperClass) => {
              swiperRef.current = swiper;
            }, [])}
            onSlideChange={useCallback((swiper: SwiperClass) => {
              setValue(swiper.activeIndex);
            }, [])}
          >
            <SwiperSlide style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ padding: '20px' }}>
                <h2>전표 상세</h2>
                <div style={{ marginBottom: '30px' }}>
                  <h3>결재 제목</h3>
                  <p>{approval.apprTitle}</p>
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <h3>상신자</h3>
                  <p>{approval.creatorName}</p>
                </div>
                <div style={{ marginBottom: '30px' }}>
                  <h3>상신일</h3>
                  <p>{approval.createDate}</p>
                </div>

                {Array.from({ length: 20 }, (_, i) => (
                  <div key={i} style={{
                    marginBottom: '20px',
                    padding: '20px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                  }}>
                    <h4>항목 {i + 1}</h4>
                    <p>스크롤하면 상단 영역이 스크롤 이동거리만큼 줄어들고 늘어납니다.</p>
                  </div>
                ))}
              </div>
            </SwiperSlide>
            <SwiperSlide style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ padding: '20px' }}>
                <h2>부서공지</h2>
                <p>부서공지 콘텐츠</p>
                {Array.from({ length: 15 }, (_, i) => (
                  <div key={i} style={{
                    marginBottom: '20px',
                    padding: '20px',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '8px'
                  }}>
                    <h4>공지 {i + 1}</h4>
                    <p>부서 공지사항 내용입니다.</p>
                  </div>
                ))}
              </div>
            </SwiperSlide>
            <SwiperSlide style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ padding: '20px' }}>
                <h2>첨부파일</h2>
                {Array.from({ length: 12 }, (_, i) => (
                  <div key={i} style={{
                    marginBottom: '20px',
                    padding: '20px',
                    backgroundColor: '#fff3e0',
                    borderRadius: '8px'
                  }}>
                    <h4>파일 {i + 1}</h4>
                    <p>첨부파일 관련 내용입니다.</p>
                  </div>
                ))}
              </div>
            </SwiperSlide>
          </Swiper>
        </div>
      </IonContent>
    </IonPage >
  );
});

export default Detail;
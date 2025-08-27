

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { IonPage, IonContent, IonSegment, IonSegmentButton, IonLabel, IonImg, IonIcon } from "@ionic/react";
import type { HTMLIonContentElement } from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperClass } from "swiper";
import { useShallow } from 'zustand/shallow'
import "swiper/css";
import AppBar from "../components/AppBar";
import "./Detail.css";
import { getFlowIcon } from "../utils";
import { useParams } from "react-router-dom";
import useAppStore from "../stores/appStore";
import { person } from "ionicons/icons";
import { motion, useMotionValue, useScroll, useTransform } from "framer-motion";

interface DetailParams {
  flowNo: string;
}

const HEADER_COLLAPSED_HEIGHT = 48 + 28 + 48;

const TAB_KEYS = ["tab1", "tab2", "tab3"];

const generateList = (count: number, prefix: string) => {
  return Array.from({ length: count }, (_, i) => `${prefix} Item ${i + 1}`);
};

const Detail: React.FC = () => {
  const [activeTab, setActiveTab] = useState("tab1");
  const [expandedHeight, setExpandedHeight] = useState(0);
  const [swiperHeight, setSwiperHeight] = useState("calc(100% - 76px)");

  // Refs
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const swiperRef = useRef<SwiperClass | null>(null);
  const expandedHeaderRef = useRef<HTMLDivElement | null>(null);
  const ionContentRef = useRef<HTMLIonContentElement | null>(null);
  const slideContentRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Constants
  const { flowNo } = useParams<DetailParams>();
  const approval = useAppStore(useShallow(state => state.approvals?.find(approval => approval.flowNo === flowNo) || null));
  const icon = useMemo(() => getFlowIcon('TODO'), []);

  // 콘텐츠 크기에 맞는 Swiper 높이 계산 및 설정
  const adjustSwiperHeight = useCallback((slideIndex: number) => {
    const slideContent = slideContentRefs.current[slideIndex];
    if (slideContent) {
      const contentHeight = slideContent.offsetHeight;
      const baseMinHeight = `calc(100% - 76px)`;
      const baseMinHeightPx = window.innerHeight - 76;

      // 콘텐츠가 기본 최소 높이보다 크면 contentHeight, 작으면 baseMinHeight 사용
      if (contentHeight > baseMinHeightPx) {
        setSwiperHeight(`${contentHeight}px`);
      } else {
        setSwiperHeight(baseMinHeight);
      }
    }
  }, []);

  // IonContent 스크롤 시 각 슬라이드를 translateY로 이동
  const handleContentScroll = useCallback((e: any) => {
    const headerHeight = expandedHeight;
    const scrollTop = e.detail.scrollTop;
    scrollY.set(scrollTop);
    const contentScrollTop = scrollTop - headerHeight;
    const currentActiveIndex = TAB_KEYS.indexOf(activeTab);
    if (contentScrollTop <= 0) return;
    if (currentActiveIndex !== -1) {
      scrollRefs.current.forEach((element, index) => {
        if (!element) return;

        if (index === currentActiveIndex) {
          element.style.transform = 'translateY(0px)';
        } else {
          // 비활성 슬라이드는 스크롤 위치에 따라 이동
          element.style.transform = `translateY(${contentScrollTop}px)`;
        }
      });
    }
  }, [activeTab, expandedHeight]);

  const handleContentScrollEnd = useCallback(async (e: any) => {
    const headerHeight = expandedHeight;
    const scrollElement = await ionContentRef.current.getScrollElement();
    const scrollTop = scrollElement.scrollTop;
    if (scrollTop >= headerHeight) return;
    if (scrollTop > headerHeight / 2) {
      ionContentRef.current.scrollToPoint(0, expandedHeight, 200);
    } else {
      ionContentRef.current.scrollToTop(200);
    }
  }, [expandedHeight]);

  // 슬라이드 변경 핸들러 - 위치 정상화 포함
  const handleSlideChange = useCallback((swiper: SwiperClass) => {
    const newIndex = swiper.activeIndex;
    const newTab = TAB_KEYS[newIndex];
    setActiveTab(newTab);

  }, []);

  const handleSlideTransitionEnd = useCallback(async (swiper: SwiperClass) => {
    const newIndex = swiper.activeIndex;

    // 높이 동기화
    adjustSwiperHeight(newIndex);

    // 모든 슬라이드 위치 초기화
    scrollRefs.current.forEach((element, index) => {
      if (!element) return;
      element.style.transform = 'translateY(0px)';
    });

    const scrollElement = await ionContentRef.current.getScrollElement();
    if (scrollElement.scrollTop >= expandedHeight) ionContentRef.current.scrollToPoint(0, expandedHeight, 0);

    console.log(`슬라이드 ${newIndex + 1} 전환 완료 후 위치 초기화`);
  }, [adjustSwiperHeight, expandedHeight]);

  // 헤더 높이 측정
  useEffect(() => {
    if (!expandedHeaderRef.current || !approval) return;

    const measureHeight = () => {
      if (expandedHeaderRef.current) {
        const height = expandedHeaderRef.current.scrollHeight;
        if (height > 0 && height !== expandedHeight) {
          setExpandedHeight(height);
        }
      }
    };

    setTimeout(measureHeight, 0);
  }, [approval, expandedHeight]);

  // 초기 로드 시 첫 번째 탭의 높이 설정
  useEffect(() => {
    const timer = setTimeout(() => {
      adjustSwiperHeight(0);
    }, 500);

    return () => clearTimeout(timer);
  }, [adjustSwiperHeight]);


  // 헤더 애니메이션
  // 스크롤 감지 (전체 문서 기준)
  const scrollY = useMotionValue(0);
  // opacity: 0~100px까지 1 → 0
  const opacity = useTransform(scrollY, [0, expandedHeight/1.8], [1, 0]);
  // scale: 0~100px까지 1 → 0.95
  const scale = useTransform(scrollY, [0, expandedHeight/1.8], [1, 0.5]);

  return (
    <IonPage className="detail">
      <AppBar showBackButton={true} />
      <IonContent
        scrollEvents={true}
        scrollY={true}
        scrollX={false}
        ref={ionContentRef}
        onIonScroll={handleContentScroll}
        onIonScrollEnd={handleContentScrollEnd}
      >
        {/* 상단 헤더 */}
        {/* <motion.div
          style={{
            // position: "fixed",
            // top: 'calc(var(--ion-safe-area-top))',
            // left: 0,
            // right: 0,
            height: HEADER_EXPANDED_HEIGHT,
            // backgroundColor: "var(--ion-background-color2)",
            // zIndex: 2,
            // pointerEvents: 'none',
            // paddingBottom: '76px',
            // scale: headerScale,
            // translateY: headerTranslateY,
            // transformOrigin: 'top',
            // willChange: 'transform',
            // contain: 'layout style paint',
            // isolation: 'isolate'
          }}
        > */}
        {/* 펼쳐진 헤더 */}
        <motion.div
          ref={expandedHeaderRef}
          style={{
            display: "flex",
            alignItems: "start",
            justifyContent: "center",
            flexDirection: 'column',
            padding: "12px 22px 22px 22px",
            opacity,
            scale,
            willChange: 'opacity, transform',
          }}
        >
          {
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <IonImg src={icon.image} style={{ width: '20px' }} />
                <span style={{ fontSize: '13px', fontWeight: '500' }}>미결함</span>
                <span style={{ margin: '0 4px', color: 'var(--gray-color)', fontSize: '11px' }}>|</span>
                <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--ion-color-secondary)' }}>전자세금계산서</span>
              </div>
              <span style={{ fontSize: '16px', fontWeight: '600', width: '100%' }}>{approval?.apprTitle}</span>
              <div style={{ marginTop: '22px', backgroundColor: 'var(--ion-background-color)', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', backgroundColor: '#2E3C52' }}>
                  <div style={{ display: 'flex', gap: '4px' }}><IonIcon src={person} style={{ width: '12px', color: 'var(--ion-color-secondary)' }} /><span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{approval?.creatorName}</span></div>
                  <span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{approval?.createDate}</span>
                </div>
                <div className='custom-item-body'>
                  <div className='custom-item-body-line'>
                    <span>구분</span>
                    <span>임시전표</span>
                  </div>
                  <div className='custom-item-body-line'>
                    <span>전표 번호</span>
                    <span>1900000165</span>
                  </div>
                  <div className='custom-item-body-line'>
                    <span>거래처</span>
                    <span>현대 법인카드_7430820</span>
                  </div>
                  <div className='custom-item-body-line'>
                    <span>기본적요</span>
                    <span>소모품비</span>
                  </div>
                  <div className='custom-item-body-line'>
                    <span>계정명</span>
                    <span>소모품비-기타</span>
                  </div>
                </div>
              </div>
            </>
          }

        </motion.div>

        {/* 접힌 헤더 */}
        {/* <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "start",
              paddingLeft: '64px',
              height: HEADER_COLLAPSED_HEIGHT - 28 - 48,
              opacity: collapsedOpacity,
              willChange: 'opacity',
              contain: 'layout style paint',
              backfaceVisibility: 'hidden'
            }}
          >
            <div>
              <span>미결함</span>
              <span>{approval?.apprTitle}</span>
            </div>
          </motion.div>
        </motion.div> */}

        {/* 헤더 밖으로 분리된 grab indicator와 segment */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            // top: `calc(var(--ion-safe-area-top) + ${HEADER_EXPANDED_HEIGHT - 48 - 28}px)`,
            // left: 0,
            // right: 0,
            height: '76px',
            zIndex: 3,
            backgroundColor: 'var(--ion-background-color2)'
            // translateY: bottomElementsTranslateY,
            // willChange: 'transform',
            // transform: 'translateZ(0)',
            // backfaceVisibility: 'hidden',
            // pointerEvents: 'none'
          }}
        >
          <div
            className="grap-indicator-wrapper">
            <span style={{ display: 'block', width: '60px', height: '4px', background: 'var(--grab-indicator-color)' }} />
          </div>
          <IonSegment className="segment" value={activeTab} mode="md" onIonChange={(e) => {
            const selectedTab = e.detail.value as string;
            const tabIndex = TAB_KEYS.indexOf(selectedTab);
            if (tabIndex !== -1) {
              setActiveTab(selectedTab);
              swiperRef.current?.slideTo(tabIndex);
            }
          }}>
            <IonSegmentButton value="tab1">
              <IonLabel>상세</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="tab2">
              <IonLabel>결재선</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="tab3">
              <IonLabel>첨부파일</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </div>

        {/* Swiper 탭 콘텐츠 */}
        <Swiper
          style={{
            height: swiperHeight,
            backgroundColor: 'var(--ion-background-color)',
          }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={handleSlideChange}
          onSlideChangeTransitionEnd={handleSlideTransitionEnd}
          resistanceRatio={0}
        >
          {TAB_KEYS.map((key, index) => (
            <SwiperSlide key={key}>
              <div
                ref={(el) => { scrollRefs.current[index] = el; }}
                style={{
                  overflowY: "auto",
                  boxSizing: "border-box",
                  background: "var(--ion-background-color)",
                  overscrollBehavior: "none", // prevent bounce
                  willChange: 'scroll-position', // 스크롤 최적화
                  contain: 'layout style paint', // 레이아웃 격리
                  transform: 'translateZ(0)' // 하드웨어 가속
                }}
              >
                <div
                  ref={(el) => { slideContentRefs.current[index] = el; }}
                  style={{ padding: 20 }}
                >
                  <h2>{`탭 ${index + 1}`}</h2>
                  <p>{`현재 탭은 ${key}`}</p>
                  {generateList(
                    index === 0 ? 5 : index === 1 ? 15 : 30,
                    `탭 ${index + 1}`
                  ).map((item) => (
                    <div
                      key={item}
                      style={{
                        padding: 16,
                        marginBottom: 12,
                        backgroundColor: "#f1f1f1",
                        borderRadius: 8,
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </IonContent>
    </IonPage>
  );
};

export default Detail;
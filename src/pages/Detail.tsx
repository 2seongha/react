

import React, { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { IonPage, IonContent, IonSegment, IonSegmentButton, IonLabel, IonBackButton, IonImg, IonIcon } from "@ionic/react";
import { motion, useMotionValue, useTransform } from "framer-motion";
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
  
  // Refs
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const swiperRef = useRef<SwiperClass | null>(null);
  const expandedHeaderRef = useRef<HTMLDivElement | null>(null);
  const isSnapping = useRef(false);
  const isTouching = useRef(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  
  // Motion values
  const scrollY = useMotionValue(0);
  
  // Constants
  const { flowNo } = useParams<DetailParams>();
  const approval = useAppStore(useShallow(state => state.approvals?.find(approval => approval.flowNo === flowNo) || null));
  const icon = useMemo(() => getFlowIcon('TODO'), []);
  
  const HEADER_EXPANDED_HEIGHT = expandedHeight;
  const COLLAPSE_RANGE = HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT;

  // 다른 탭 동기화
  const syncOtherTabs = useCallback((scrollTop: number) => {
    scrollRefs.current.forEach((element, index) => {
      const key = TAB_KEYS[index];
      if (element && key !== activeTab) {
        element.scrollTop = scrollTop;
      }
    });
  }, [activeTab]);

  // 헤더 스냅
  const snapToPosition = useCallback((scrollTop: number, element: HTMLDivElement) => {
    if (isSnapping.current) return;
    
    const midPoint = COLLAPSE_RANGE / 2;
    const targetScroll = scrollTop < midPoint ? 0 : COLLAPSE_RANGE;
    
    if (scrollTop !== targetScroll) {
      isSnapping.current = true;
      element.scrollTo({ top: targetScroll, behavior: 'smooth' });
      setTimeout(() => { isSnapping.current = false; }, 300);
    }
  }, [COLLAPSE_RANGE]);

  // 통합된 스크롤 핸들러
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const element = e.currentTarget;
    const prevScrollY = scrollY.get();
    
    scrollY.set(scrollTop);

    // 헤더 상태 변화 감지
    if (prevScrollY > 0 && scrollTop === 0) {
      syncOtherTabs(0);
    } else if (prevScrollY < COLLAPSE_RANGE && scrollTop >= COLLAPSE_RANGE) {
      syncOtherTabs(COLLAPSE_RANGE);
    }
    
    // 스크롤 완료 후 스냅 처리
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = window.setTimeout(() => {
      if (!isTouching.current && !isSnapping.current) {
        const currentScrollTop = element.scrollTop;
        if (currentScrollTop > 0 && currentScrollTop < COLLAPSE_RANGE) {
          snapToPosition(currentScrollTop, element);
        }
      }
    }, 150);
  }, [scrollY, COLLAPSE_RANGE, syncOtherTabs, snapToPosition]);

  // 터치 핸들러들
  const handleTouchStart = useCallback(() => {
    isTouching.current = true;
  }, []);

  const handleTouchEnd = useCallback(() => {
    isTouching.current = false;
  }, []);

  // 슬라이드 변경 핸들러
  const handleSlideChange = useCallback((swiper: SwiperClass) => {
    setActiveTab(TAB_KEYS[swiper.activeIndex]);
  }, []);

  // Animation transforms
  const headerHeight = useTransform(scrollY, [0, COLLAPSE_RANGE], [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT], { clamp: true });
  const expandedOpacity = useTransform(scrollY, [0, COLLAPSE_RANGE / 2], [1, 0], { clamp: true });
  const collapsedOpacity = useTransform(scrollY, [COLLAPSE_RANGE / 2, COLLAPSE_RANGE], [0, 1], { clamp: true });
  const expandedScale = useTransform(scrollY, [0, COLLAPSE_RANGE / 2], [1, 0.8], { clamp: true });

  // 헤더 높이 측정
  useEffect(() => {
    if (!expandedHeaderRef.current || !approval) return;
    
    const measureHeight = () => {
      if (expandedHeaderRef.current) {
        const height = expandedHeaderRef.current.scrollHeight;
        if (height > 0 && height !== expandedHeight) {
          setExpandedHeight(height + 48 + 22 + 48);
        }
      }
    };
    
    setTimeout(measureHeight, 0);
  }, [approval, expandedHeight]);

  return (
    <IonPage className="detail">
      <IonContent scrollEvents={false} scrollY={false} scrollX={false}>
        <AppBar showBackButton={true} />
        {/* 상단 헤더 */}
        <motion.div
          style={{
            position: "fixed",
            top: 'calc(var(--ion-safe-area-top))',
            left: 0,
            right: 0,
            height: headerHeight,
            backgroundColor: "var(--ion-background-color2)",
            zIndex: 2,
            pointerEvents: 'none',
            paddingBottom: '76px',
            willChange: 'height',
            contain: 'layout style paint',
            isolation: 'isolate'
          }}
        >
          {/* 펼쳐진 헤더 */}
          <motion.div
            ref={expandedHeaderRef}
            style={{
              position: "absolute",
              top: '42px',
              left: 0,
              right: 0,
              display: "flex",
              alignItems: "start",
              justifyContent: "center",
              flexDirection: 'column',
              padding: "12px 22px 22px 22px",
              opacity: expandedOpacity,
              scale: expandedScale,
              willChange: 'opacity, transform',
              contain: 'layout style paint',
              backfaceVisibility: 'hidden'
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
                    <div style={{ display: 'flex', gap: '4px' }}><IonIcon src={person} style={{ width: '12px', color: 'var(--ion-color-secondary)' }} /><span style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>최재웅</span></div>
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
          <motion.div
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
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '76px', // grab indicator(28px) + segment(48px)
              willChange: 'transform',
            }}
          >
            <div
              className="grap-indicator-wrapper"
              style={{
                willChange: 'transform',
                transform: 'translateZ(0)',
              }}
            >
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
        </motion.div>

        {/* Swiper 탭 콘텐츠 */}
        <Swiper
          style={{ height: "100%" }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={handleSlideChange}
          resistanceRatio={0}
        >
          {TAB_KEYS.map((key, index) => (
            <SwiperSlide key={key}>
              <div
                ref={(el) => { scrollRefs.current[index] = el; }}
                onScroll={handleScroll}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                style={{
                  overflowY: "auto",
                  height: `calc(100vh - ${HEADER_COLLAPSED_HEIGHT - 28 - 48}px)`,
                  paddingTop: HEADER_EXPANDED_HEIGHT - 48,
                  boxSizing: "border-box",
                  background: "var(--ion-background-color)",
                  overscrollBehavior: "none", // prevent bounce
                }}
              >
                <div style={{ padding: 20 }}>
                  <h2>{`탭 ${index + 1}`}</h2>
                  <p>{`현재 탭은 ${key}`}</p>
                  {generateList(20, `탭 ${index + 1}`).map((item) => (
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
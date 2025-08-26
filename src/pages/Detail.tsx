

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

  // 각 슬라이드별 스크롤 위치 저장
  const scrollPositions = useRef<{ [key: string]: number }>({
    tab1: 0,
    tab2: 0,
    tab3: 0,
  });

  // 슬라이드별 스크롤 영역 참조
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollY = useMotionValue(0);

  // 헤더 상태 변화에 따른 모든 슬라이드 스크롤 조정
  const adjustAllScrollsOnHeaderStateChange = useCallback((newScrollTop: number) => {
    // 모든 슬라이드의 scrollTop을 즉시 조정
    scrollRefs.current.forEach((element) => {
      if (element) {
        element.scrollTop = newScrollTop;
      }
    });
    
    // 저장된 스크롤 위치도 모두 조정
    TAB_KEYS.forEach((key) => {
      scrollPositions.current[key] = newScrollTop;
    });
  }, []);

  // 슬라이드 스크롤 이벤트
  const handleScrollYChange = useCallback(
    (scrollTop: number, key: string) => {
      console.log('scroll move')

      const prevScrollY = scrollY.get();
      scrollPositions.current[key] = scrollTop;
      scrollY.set(scrollTop);
      
      // 헤더가 완전히 펼쳐지는 순간 (축소된 상태에서 0으로)
      if (prevScrollY > 0 && scrollTop === 0) {
        adjustAllScrollsOnHeaderStateChange(0);
      }
      // 헤더가 완전히 접히는 순간 (0에서 COLLAPSE_RANGE로)
      else if (prevScrollY < COLLAPSE_RANGE && scrollTop >= COLLAPSE_RANGE) {
        adjustAllScrollsOnHeaderStateChange(COLLAPSE_RANGE);
      }
    },
    [scrollY, adjustAllScrollsOnHeaderStateChange]
  );

  

  // 슬라이드 전환 시, 스크롤 위치 복구
  const handleSlideChange = useCallback((swiper: SwiperClass) => {
    const newIndex = swiper.activeIndex;
    const newKey = TAB_KEYS[newIndex];
    setActiveTab(newKey);
  }, [scrollY]);

  const swiperRef = useRef<SwiperClass | null>(null);
  const expandedHeaderRef = useRef<HTMLDivElement | null>(null);
  const [expandedHeight, setExpandedHeight] = useState(0);
  const isSnapping = useRef(false);
  
  
  const { flowNo } = useParams<DetailParams>();
  const approval = useAppStore(useShallow(state => state.approvals?.find(approval => approval.flowNo === flowNo) || null));
  const icon = useMemo(() => getFlowIcon('TODO'), [/*area.flowCode*/]);
  
  const HEADER_EXPANDED_HEIGHT = expandedHeight;
  const COLLAPSE_RANGE = HEADER_EXPANDED_HEIGHT - HEADER_COLLAPSED_HEIGHT;
  
    // 헤더 스냅 처리 함수
    const snapHeader = useCallback((scrollTop: number, element: HTMLDivElement) => {
      if (isSnapping.current) return; // 이미 스냅 중이면 무시
      
      const midPoint = COLLAPSE_RANGE / 2;
      const targetScroll = scrollTop < midPoint ? 0 : COLLAPSE_RANGE;
      
      if (scrollTop !== targetScroll) {
        isSnapping.current = true;
        element.scrollTo({ top: targetScroll, behavior: 'smooth' });
        
        // 스냅 완료 후 플래그 해제
        setTimeout(() => {
          isSnapping.current = false;
        }, 300); // smooth 애니메이션 시간고려
      }
    }, [scrollY, COLLAPSE_RANGE]);

    // 스크롤 끝날 때 스냅 처리
  const handleScrollEnd = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    console.log('scrollEnd');
    
    // 스냅 중이면 무시
    if (isSnapping.current) {
      console.log('ignoring scrollEnd during snap');
      return;
    }
    
    const element = e.currentTarget;
    const scrollTop = element.scrollTop;
    
    // 헤더 영역에서만 스냅 처리
    if (scrollTop > 0 && scrollTop < COLLAPSE_RANGE) {
      snapHeader(scrollTop, element);
    }
  }, [snapHeader]);

  // 헤더의 동적 높이
  const headerHeight = useTransform(
    scrollY,
    [0, COLLAPSE_RANGE],
    [HEADER_EXPANDED_HEIGHT, HEADER_COLLAPSED_HEIGHT],
    { clamp: true }
  );
  
  // 펼쳐진 헤더 opacity
  const expandedHeaderOpacity = useTransform(
    scrollY,
    [0, COLLAPSE_RANGE / 2],
    [1, 0],
    { clamp: true }
  );
  
  // 접힌 헤더 opacity
  const collapsedHeaderOpacity = useTransform(
    scrollY,
    [COLLAPSE_RANGE / 2, COLLAPSE_RANGE],
    [0, 1],
    { clamp: true }
  );
  
  // 펼쳐진 헤더 스케일 (0.8 ~ 1.0)
  const expandedHeaderScale = useTransform(
    scrollY,
    [0, COLLAPSE_RANGE / 2],
    [1, 0.8],
    { clamp: true }
  );
  
  // 첫 렌더링 시 펼쳐진 헤더의 실제 높이 측정
  useEffect(() => {
    if (expandedHeaderRef.current) {
      // DOM 렌더링 완료 후 측정
      setTimeout(() => {
        if (expandedHeaderRef.current) {
          const height = expandedHeaderRef.current.scrollHeight; // offsetHeight 대신 scrollHeight 사용
          console.log('Measured height:', height);
          if (height > 0 && height !== expandedHeight) {
            setExpandedHeight(height + 48 + 22 + 48);
          }
        }
      }, 0);
    }
  }, [approval]); // expandedHeight 의존성 제거로 무한 루프 방지

  return (
    <IonPage className="detail">
      <IonContent fullscreen>
      <AppBar showBackButton={true}/>
        {/* 상단 헤더 */}
        <motion.div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: headerHeight,
            backgroundColor: "var(--ion-background-color2)",
            zIndex: 2,
            pointerEvents: 'none',
            paddingTop: 'var(--ion-safe-area-top)',
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
              opacity: expandedHeaderOpacity,
              scale: expandedHeaderScale,
              willChange: 'opacity, transform',
              contain: 'layout style paint',
              backfaceVisibility: 'hidden'
            }}
          >
            {
              <>
              <div style={{display:'flex', alignItems:'center', gap:'4px', marginBottom: '8px'}}>
                <IonImg src={icon.image} style={{width:'20px'}}/>
                <span style={{fontSize:'13px', fontWeight: '500'}}>미결함</span>
                <span style={{margin:'0 4px', color:'var(--gray-color)', fontSize:'11px'}}>|</span>
                <span style={{fontSize:'13px', fontWeight: '500', color:'var(--ion-color-secondary)'}}>전자세금계산서</span>
              </div>
              <span style={{fontSize:'16px', fontWeight:'600', width:'100%'}}>{approval?.apprTitle}</span>
              <div style={{marginTop:'22px', backgroundColor:'var(--ion-background-color)', width:'100%', borderRadius:'12px', overflow:'hidden'}}>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 20px', backgroundColor:'#2E3C52'}}>
                  <div style={{display:'flex', gap:'4px'}}><IonIcon src={person} style={{width:'12px', color:'var(--ion-color-secondary)'}}/><span style={{color:'#fff',fontSize:'13px', fontWeight: '500'}}>최재웅</span></div>
                  <span style={{color:'#fff',fontSize:'13px', fontWeight: '500'}}>{approval?.createDate}</span>
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
              opacity: collapsedHeaderOpacity,
              willChange: 'opacity',
              contain: 'layout style paint',
              backfaceVisibility: 'hidden'
            }}
          >
            접힌 헤더 내용
          </motion.div>
          <div 
            className="grap-indicator-wrapper"
            style={{
              willChange: 'transform',
              transform: 'translateZ(0)', // GPU 레이어 생성
            }}
          >
            <span style={{display:'block', width: '60px', height:'4px', background:'var(--grab-indicator-color)'}} />
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
        </motion.div>
       
        {/* Swiper 탭 콘텐츠 */}
        <Swiper
          // style={{ height: "100%", marginTop: HEADER_COLLAPSED_HEIGHT }}
          style={{ height: "100%" }}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          onSlideChange={handleSlideChange}
        >
          {TAB_KEYS.map((key, index) => (
            <SwiperSlide key={key}>
              <div
                ref={(el) => { scrollRefs.current[index] = el; }}
                onScroll={(e) => handleScrollYChange(e.currentTarget.scrollTop, key)}
                onScrollEnd={handleScrollEnd}
                style={{
                  overflowY: "auto",
                  height: `calc(100vh - ${HEADER_COLLAPSED_HEIGHT - 28 - 48}px)`,
                  paddingTop: HEADER_EXPANDED_HEIGHT - 48,
                  boxSizing: "border-box",
                  background: "#fff",
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




// import { IonContent, IonPage, createGesture } from '@ionic/react';
// import React, { useRef, useCallback, useEffect, memo } from 'react';
// import { useParams } from 'react-router-dom';
// import AppBar from '../components/AppBar';
// import useAppStore from '../stores/appStore';
// import { useShallow } from 'zustand/shallow'
// import { Swiper, SwiperClass, SwiperSlide } from 'swiper/react';
// import Tabs from '@mui/material/Tabs';
// import { Tab } from '@mui/material';
// import { useSnapScroll } from '../hooks/useScrollDelegate';
// import { animateScroll as scroll } from 'react-scroll';
// import './Detail.css';

// interface DetailParams {
//   flowNo: string;
// }

// const Detail: React.FC = memo(() => {
//   const { flowNo } = useParams<DetailParams>();
//   const approval = useAppStore(useShallow(state => state.approvals?.find(approval => approval.flowNo === flowNo) || null));
//   const [value, setValue] = React.useState(0);
//   const swiperRef = useRef<SwiperClass | null>(null);
//   const tabsRef = useRef<HTMLDivElement>(null);
//   const scrollContainerRef = useRef<HTMLDivElement>(null);
//   const headerRef = useRef<HTMLDivElement>(null);
//   const isProgrammaticScroll = useRef(false);

//   const handleTabChange = useCallback((_: React.SyntheticEvent, newValue: number) => {
//     setValue(newValue);
//     swiperRef.current?.slideTo(newValue);
//   }, []);

//   // 스냅 스크롤 hook 사용
//   const { snapToPosition } = useSnapScroll({
//     scrollContainer: scrollContainerRef.current,
//     tabsElement: tabsRef.current,
//     isHeaderVisible: true // 초기값
//   });

//   // wrapper scroll event로 실제 스크롤 위임
//   useEffect(() => {
//     const headerElement = headerRef.current;
//     const scrollContainer = scrollContainerRef.current;
//     // let isSnapping = false;

//     if (!headerElement || !scrollContainer) return;

//     // wrapper scroll 이벤트 - delta 값으로 스크롤 위임
//     // let lastScrollTop = 0;
//     // let accumulatedPaddingTop = 0;
//     // let isHeaderHidden = false; // <- 추가된 상태 변수

//     // const handleScroll = (e: Event) => {
//     //   if (isSnapping) return;
//     //   const headerElement = headerRef.current;
//     //   const target = e.target as HTMLElement;
//     //   const firstChild = target.firstElementChild as HTMLElement;
//     //   const scrollContainer = scrollContainerRef.current;

//     //   if (!scrollContainer || !headerElement) return;

//     //   const currentScrollTop = target.scrollTop;
//     //   const delta = currentScrollTop - lastScrollTop;

//     //   if (delta !== 0) {
//     //     if (!isHeaderHidden) {
//     //       accumulatedPaddingTop += delta;
//     //       firstChild.style.transform = `translateY(${accumulatedPaddingTop}px)`;
//     //     }
//     //     scrollContainer.scrollTop += delta;
//     //   }

//     //   // 헤더 숨김 조건
//     //   if (
//     //     scrollContainer.scrollTop >= headerElement.offsetHeight &&
//     //     !isHeaderHidden
//     //   ) {
//     //     headerElement.style.display = 'none';
//     //     firstChild.style.transform = `translateY(0px)`;
//     //     accumulatedPaddingTop = 0;
//     //     isHeaderHidden = true;
//     //     console.log('Header 숨김');
//     //     requestAnimationFrame(() => {
//     //       target.scrollTop = 0;
//     //     })
//     //   }

//     //   lastScrollTop = currentScrollTop;
//     // };

//     // const handleScrollEnd = (e: Event) => {
//     //   const target = e.target as HTMLElement;
//     //   const scrollContainer = scrollContainerRef.current;
//     //   const headerElement = headerRef.current;
//     //   if (!scrollContainer || !headerElement) return;

//     //   // 스크롤이 top에 도달하고 헤더가 숨겨져 있을 때만 헤더 복구
//     //   if (target.scrollTop === 0 && isHeaderHidden) {
//     //     headerElement.style.display = 'block';
//     //     isHeaderHidden = false;

//     //     // 강제로 scrollTop을 보정할 필요 없이 자연스럽게 보여지게
//     //     // (필요하면 아래 코드 활성화)
//     //     scrollContainer.scrollTop = headerElement.offsetHeight;

//     //     console.log('Header 살림');
//     //   }
//     // };

//     const handleScrollEnd2 = (e: Event) => {
//       if (isProgrammaticScroll.current) {
//         console.log('Ignoring programmatic scrollend');
//         return; // 무조건 빠져나가기
//       }
    
//       if (headerElement.style.display !== 'none') {
//         const scrollTop = scrollContainer.scrollTop;
    
//         if (scrollTop < 140) {
//           console.log('Snapping to top');
//           isProgrammaticScroll.current = true;
    
//           scroll.scrollTo(0, {
//             containerId: 'scroll-container',
//             duration: 150,
//             smooth: 'easeOutQuad',
//           });
//         } else {
//           const tabsTop = tabsRef.current?.offsetTop ?? 0;
//           console.log('Snapping to tabs:', tabsTop);
//           isProgrammaticScroll.current = true;
    
//           scroll.scrollTo(tabsTop, {
//             containerId: 'scroll-container',
//             duration: 150,
//             smooth: 'easeOutQuad',
//           });
//         }
//         setTimeout(() => {
//           if (isProgrammaticScroll.current) {
//             console.log('Fallback: Assuming scroll complete');
//             isProgrammaticScroll.current = false;
//           }
//         }, 160);
//       }
//     };
    
//     // 이벤트 등록
//     scrollContainer.addEventListener('scrollend', handleScrollEnd2, { passive: true });
//     // const slides = scrollContainer.querySelectorAll('.swiper-slide');
//     // slides.forEach(slide => {
//     //   slide.addEventListener('scroll', handleScroll, { passive: false });
//     //   slide.addEventListener('scrollend', handleScrollEnd, { passive: false });
//     // });

//     // const gesture = createGesture({
//     //   el: scrollContainer,
//     //   gestureName: 'custom-swipe',
//     //   threshold: 0,
//     //   onEnd: () => {
//     //     if (headerElement.style.display == 'none') return;
//     //     isSnapping = true;
//     //     if (scrollContainer.scrollTop < 140) {
//     //       console.log('Snapping to top');
//     //       scroll.scrollTo(0, {
//     //         containerId: 'scroll-container',
//     //         duration: 150,
//     //         smooth: 'easeOutQuad',
//     //         onComplete: () => {
//     //           isSnapping = false; // 스냅 완료 후 플래그 해제
//     //         }
//     //       });
//     //     } else {
//     //       const tabsTop = tabsRef.current?.offsetTop ?? 0;
//     //       console.log('Snapping to tabs:', tabsTop);
//     //       scroll.scrollTo(tabsTop, {
//     //         containerId: 'scroll-container',
//     //         duration: 150,
//     //         smooth: 'easeOutQuad',
//     //         onComplete: () => {
//     //           isSnapping = false; // 스냅 완료 후 플래그 해제
//     //         }
//     //       });
//     //     }
//     //   },
//     // });

//     // gesture.enable(true);

//     return () => {
//       // gesture.destroy();
//       // const slides = scrollContainer.querySelectorAll('.swiper-slide');
//       // slides.forEach(slide => {
//       //   slide.removeEventListener('scroll', handleScroll);
//       //   slide.removeEventListener('scrollend', handleScrollEnd);
//       // });
//     };
//   }, []);

//   if (!approval) {
//     return (
//       <IonPage>
//         <AppBar title={<span>상세</span>} showBackButton={true} />
//         <IonContent fullscreen>
//           <div style={{
//             display: 'flex',
//             justifyContent: 'center',
//             alignItems: 'center',
//             height: '100%',
//             color: 'var(--ion-color-medium)'
//           }}>
//             해당 결재 정보를 찾을 수 없습니다.
//           </div>
//         </IonContent>
//       </IonPage>
//     );
//   }

//   return (
//     <IonPage>
//       <AppBar showBackButton={true}
//         title={
//           <span>{approval.apprTitle}</span>
//         } />
//       <IonContent
//         scrollY={false}
//         scrollEvents={false}
//       >
//         <div ref={scrollContainerRef} style={{
//           overflow: 'auto',
//           height: '100%',
//           position: 'relative',
//         }} id='scroll-container'>
//           <div ref={headerRef} style={{
//             background: '#666',
//             height: '280px',
//             overflow: 'hidden',
//             willChange: 'transform',
//             contain: 'layout style paint'
//           }}>
//             <span>{approval.apprTitle}</span>
//             <div>
//               <div>
//                 <span>결재</span>
//               </div>
//             </div>
//           </div>

//           <Tabs ref={tabsRef} value={value} onChange={handleTabChange} variant="fullWidth" style={{
//             position: 'sticky',
//             top: 0,
//             background: 'var(--ion-background-color)',
//             zIndex: 2,
//             willChange: 'transform',
//             contain: 'layout style'
//           }}>
//             <Tab label="상세" />
//             <Tab label="결재선" />
//             <Tab label="첨부파일" />
//           </Tabs>

//           <Swiper
//             style={{ height: 'calc(100% - 48px)', width: '100%' }}
//             onSwiper={useCallback((swiper: SwiperClass) => {
//               swiperRef.current = swiper;
//             }, [])}
//             onSlideChange={useCallback((swiper: SwiperClass) => {
//               setValue(swiper.activeIndex);
//             }, [])}
//           >
//             <SwiperSlide style={{ overflow: 'auto' }}>
//               <div style={{ padding: '20px', willChange: 'transform' }}>
//                 <h2>전표 상세</h2>
//                 <div style={{ marginBottom: '30px' }}>
//                   <h3>결재 제목</h3>
//                   <p>{approval.apprTitle}</p>
//                 </div>
//                 <div style={{ marginBottom: '30px' }}>
//                   <h3>상신자</h3>
//                   <p>{approval.creatorName}</p>
//                 </div>
//                 <div style={{ marginBottom: '30px' }}>
//                   <h3>상신일</h3>
//                   <p>{approval.createDate}</p>
//                 </div>

//                 {Array.from({ length: 20 }, (_, i) => (
//                   <div key={i} style={{
//                     marginBottom: '20px',
//                     padding: '20px',
//                     backgroundColor: '#f8f9fa',
//                     borderRadius: '8px'
//                   }}>
//                     <h4>항목 {i + 1}</h4>
//                     <p>스크롤하면 상단 영역이 스크롤 이동거리만큼 줄어들고 늘어납니다.</p>
//                   </div>
//                 ))}
//               </div>
//             </SwiperSlide>
//             <SwiperSlide style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
//               <div style={{ padding: '20px', willChange: 'transform' }}>
//                 <h2>부서공지</h2>
//                 <p>부서공지 콘텐츠</p>
//                 {Array.from({ length: 15 }, (_, i) => (
//                   <div key={i} style={{
//                     marginBottom: '20px',
//                     padding: '20px',
//                     backgroundColor: '#e8f5e8',
//                     borderRadius: '8px'
//                   }}>
//                     <h4>공지 {i + 1}</h4>
//                     <p>부서 공지사항 내용입니다.</p>
//                   </div>
//                 ))}
//               </div>
//             </SwiperSlide>
//             <SwiperSlide style={{ overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
//               <div style={{ padding: '20px', willChange: 'transform' }}>
//                 <h2>첨부파일</h2>
//                 {Array.from({ length: 12 }, (_, i) => (
//                   <div key={i} style={{
//                     marginBottom: '20px',
//                     padding: '20px',
//                     backgroundColor: '#fff3e0',
//                     borderRadius: '8px'
//                   }}>
//                     <h4>파일 {i + 1}</h4>
//                     <p>첨부파일 관련 내용입니다.</p>
//                   </div>
//                 ))}
//               </div>
//             </SwiperSlide>
//           </Swiper>
//         </div>
//       </IonContent>
//     </IonPage >
//   );
// });

// export default Detail;
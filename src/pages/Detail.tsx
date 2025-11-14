import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useMemo,
} from "react";
import {
  IonPage,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonImg,
  IonIcon,
  IonButton,
  IonItem,
  IonCheckbox,
  useIonRouter,
  IonFooter,
} from "@ionic/react";
import { Swiper, SwiperRef, SwiperSlide } from "swiper/react";
import { useShallow } from "zustand/shallow";
import "swiper/css";
import AppBar from "../components/AppBar";
import CustomDialog from "../components/Dialog";
import "./Detail.css";
import { getFlowIcon } from "../utils";
import { useParams } from "react-router-dom";
import useAppStore from "../stores/appStore";
import { motion, useMotionValue, useTransform } from "framer-motion";
import _ from "lodash";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import { Swiper as SwiperClass } from "swiper";
import CustomItem from "../components/CustomItem";
import {
  Cancel,
  CheckCircle,
  CheckCircleOutline,
  Close,
  HowToReg,
  PersonOutline,
} from "@mui/icons-material";
import ApprovalModal from "../components/ApprovalModal";
import { chevronCollapse, chevronExpand, chevronForward, person } from "ionicons/icons";
import { webviewToast } from "../webview";
import SubModal from "../components/SubModal";
import { OrbitProgress } from "react-loading-indicators";

const TAB_KEYS = ["tab1", "tab2", "tab3"];

const Detail: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("tab1");
  const [selectedProfitData, setSelectedProfitData] = useState<any>(null);
  const [selectedAttendeeData, setSelectedAttendeeData] = useState<any>(null);
  const [selectedSubData, setSelectedSubData] = useState<any>(null);

  // framer motion values - 스크롤 값 직접 사용
  const scrollY = useMotionValue(0);

  // Refs
  const swiperRef = useRef<SwiperClass | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const headerHeightRef = useRef<number>(0);
  const outerScrollRef = useRef<HTMLDivElement | null>(null);
  const router = useIonRouter();

  useLayoutEffect(() => {
    if (!headerRef.current) return;

    // 임시로 화면 밖에서 측정
    const tempElement = headerRef.current.cloneNode(true) as HTMLElement;
    tempElement.style.position = "absolute";
    tempElement.style.top = "-0";
    tempElement.style.left = "-0";
    tempElement.style.width = window.innerWidth + "px";

    document.body.appendChild(tempElement);

    // 높이 측정
    const measuredHeight = tempElement.offsetHeight;
    if (measuredHeight > 0) {
      headerHeightRef.current = measuredHeight;
    }

    document.body.removeChild(tempElement);
  }, []);

  // Constants
  let { P_AREA_CODE, AREA_CODE, P_AREA_CODE_TXT, AREA_CODE_TXT } = useParams<{ P_AREA_CODE: string, AREA_CODE: string, P_AREA_CODE_TXT: string, AREA_CODE_TXT: string }>();
  const { FLOWNO } = useParams<{ FLOWNO: string }>();
  P_AREA_CODE = useAppStore(
    useShallow((state) => state.approvals?.P_AREA_CODE) || null
  ) || P_AREA_CODE;
  P_AREA_CODE_TXT = useAppStore(
    useShallow((state) => state.approvals?.P_AREA_CODE_TXT) || null
  ) || P_AREA_CODE_TXT;
  AREA_CODE_TXT = useAppStore(
    useShallow((state) => state.approvals?.FLOWCODE_TXT) || null
  ) || AREA_CODE_TXT;

  const approval = useAppStore(
    useShallow(
      (state) =>
        state.approvals ? state.approvals.LIST.find(
          (approval: any) => approval.FLOWNO === FLOWNO
        ) || undefined : null
    )
  );

  useEffect(() => {
    if (approval === undefined) {
      router.canGoBack() ? router.goBack() : router.push('/app/home', 'back', 'replace');
      webviewToast('존재하지 않는 결재 건입니다');
    }
  }, [approval]);

  const titles = useAppStore((state) => state.approvals?.TITLE.TITLE_H);
  const flds = _(approval)
    .pickBy((_, key) => /^FLD\d+$/.test(key))
    .toPairs()
    .sortBy(([key]) => parseInt(key.replace("FLD", ""), 10))
    .map(([_, value]) => value)
    .value();


  const icon = useMemo(() => getFlowIcon(P_AREA_CODE ?? ""), []);

  // 슬라이드 변경 핸들러
  const handleSlideChange = useCallback((swiper: SwiperClass) => {
    const newIndex = swiper.activeIndex;
    const newTab = TAB_KEYS[newIndex];
    setActiveTab(newTab);
  }, []);

  // 스크롤 핸들러 - 스크롤 값 직접 전달
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
    scrollY.set(scrollTop); // 스크롤 값 직접 설정
  }, [scrollY]);

  // SwiperSlide 내부 스크롤 핸들러 - 위로 스크롤시 outer scroll을 헤더 높이만큼 스크롤

  const prevScrollTopRef = useRef(0);

  const handleSwiperSlideScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const currentScrollTop = element.scrollTop;
    const prevScrollTop = prevScrollTopRef.current;

    if (currentScrollTop <= 0) {
      element.style.overflow = 'hidden';
      setTimeout(() => {
        element.style.overscrollBehavior = 'auto';
        element.style.overflow = 'auto';
      }, 0)
    } else {
      element.style.overscrollBehavior = 'none';
    }

    if (currentScrollTop > prevScrollTop) {
      if (outerScrollRef.current) {
        outerScrollRef.current.scrollTo({
          top: headerHeightRef.current,
          behavior: 'auto'
        });
      }
    }

    prevScrollTopRef.current = currentScrollTop;
  }, []);

  // 아이템 선택 상태 관리
  const handleItemSelection = useCallback((flowCnt: string, isSelected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(flowCnt);
      } else {
        newSet.delete(flowCnt);
      }
      return newSet;
    });
  }, []);

  // 전체 선택 상태 계산
  const isAllSelected = useMemo(() => {
    if (approval?.SUB?.length === 0) return false;
    return approval?.SUB?.every((sub: any) => selectedItems.has(sub.FLOWCNT));
  }, [selectedItems]);

  // 전체 선택/해제 핸들러
  const handleSelectAll = useCallback(() => {
    if (!approval.SUB) return;

    if (isAllSelected) {
      // 전체 해제
      setSelectedItems(new Set());
    } else {
      // 전체 선택 (필터된 결과만)
      const newSet = new Set<string>();
      approval.SUB.forEach((sub: any) => {
        newSet.add(sub.FLOWCNT);
      });
      setSelectedItems(newSet);
    }
  }, [isAllSelected]);

  const opacity = useTransform(scrollY, [0, headerHeightRef.current / 2], [1, 0]);
  const opacityRev = useTransform(scrollY, [headerHeightRef.current / 2, headerHeightRef.current], [0, 1]);
  const scale = useTransform(scrollY, [0, headerHeightRef.current], [1, 0.8]);

  return !approval ?
    (<IonPage>
      <IonContent>
        <div className='loading-indicator-wrapper'>
          <OrbitProgress color="var(--ion-color-primary)" size="small" text="" textColor="" />
        </div>
      </IonContent>
    </IonPage>)
    : (
      <IonPage className="detail">
        <AppBar
          showBackButton={true}
          titleCenter={false}
          title={
            <motion.div
              style={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "start",
                opacity: opacityRev,
                paddingRight: "52px",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  width: "100%",
                }}
              >
                {approval?.APPR_TITLE}
              </span>
              <span
                style={{ fontSize: "13px", color: "var(--ion-color-secondary)" }}
              >
                {P_AREA_CODE_TXT}
              </span>
            </motion.div >
          }
        />
        < IonContent scrollEvents={false} scrollY={false} scrollX={false} >
          <div
            ref={outerScrollRef}
            onScroll={handleScroll}
            style={{
              height: "100%",
              scrollSnapType: 'y mandatory',
              overflow: 'auto',
              backgroundColor: "var(--ion-background-color)",
              overscrollBehavior: 'none'
            }}
          >
            <motion.div
              ref={headerRef}
              style={{
                position: "absolute",
                width: "100%",
                display: "flex",
                alignItems: "start",
                justifyContent: "center",
                flexDirection: "column",
                padding: "12px 21px 21px 21px",
                pointerEvents: "none",
                overflow: "hidden",
                zIndex: 0,
                opacity,
                scale,
                // y: headerY, // 스크롤한 만큼 위로 이동
              }}
            >
              {
                <>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginBottom: "8px",
                      height: "20px",
                    }}
                  >
                    <IonImg src={icon.image} style={{ width: "20px" }} />
                    <span style={{ fontSize: "13px", fontWeight: "500" }}>
                      {P_AREA_CODE_TXT}
                    </span>
                    <span
                      style={{
                        margin: "0 4px",
                        color: "var(--gray-color)",
                        fontSize: "11px",
                      }}
                    >
                      |
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: "500",
                        color: "var(--ion-color-secondary)",
                      }}
                    >
                      {AREA_CODE_TXT}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      width: "100%",
                    }}
                  >
                    {approval?.APPR_TITLE}
                  </span>
                  <div
                    style={{
                      marginTop: "22px",
                      width: "100%",
                      borderRadius: "12px",
                      overflow: "hidden",
                      backgroundColor: 'var(--ion-background-color)'
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 20px",
                        backgroundColor: "#2E3C52",
                      }}
                    >
                      <div style={{ display: "flex", gap: "4px" }}>
                        <IonIcon
                          src={person}
                          style={{
                            width: "12px",
                            color: "var(--ion-color-secondary)",
                          }}
                        />
                        <span
                          style={{
                            color: "#fff",
                            fontSize: "13px",
                            fontWeight: "500",
                          }}
                        >
                          {approval.CREATOR_NAME}
                        </span>
                      </div>
                      <span
                        style={{
                          color: "#fff",
                          fontSize: "13px",
                          fontWeight: "500",
                        }}
                      >
                        {approval.CREATE_DATE}
                      </span>
                    </div>
                    <div className="custom-item-body">
                      {titles?.map((title, index) => {
                        return (
                          <div
                            className="custom-item-body-line"
                            key={approval.FLOWNO + index}
                          >
                            <span>{title}</span>
                            <span>{flds[index]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              }
            </motion.div>
            <div
              style={{
                backgroundColor: "var(--ion-background-color2)",
                height: headerHeightRef.current, // 스크롤한 만큼 높이 감소
                willChange: 'height',
                scrollSnapAlign: 'start'
              }}
            ></div>
            <div
              className="grab-indicator"
              style={{
                scrollSnapAlign: 'start'
              }}>
              <span></span>
            </div>
            <IonSegment
              className="segment"
              value={activeTab}
              color="medium"
              mode="md"
              onIonChange={(e) => {
                const selectedTab = e.detail.value as string;
                const tabIndex = TAB_KEYS.indexOf(selectedTab);
                if (tabIndex !== -1) {
                  setActiveTab(selectedTab);
                  swiperRef.current?.slideTo(tabIndex);
                }
              }}
            >
              <IonSegmentButton value="tab1">
                <div className="detail-segment-label">
                  <span>상세목록</span>
                  <span>({approval.SUB.length})</span>
                </div>
              </IonSegmentButton>
              <IonSegmentButton value="tab2">
                <div className="detail-segment-label">
                  <span>결재정보</span>
                  <span></span>
                </div>
              </IonSegmentButton>
              <IonSegmentButton value="tab3">
                <div className="detail-segment-label">
                  <span>첨부파일</span>
                  <span></span>
                </div>
              </IonSegmentButton>
            </IonSegment>
            {/* Swiper 탭 콘텐츠 */}
            <Swiper
              className="swiper"
              style={{
                // height: `calc(100vh - ${P_AREA_CODE === 'TODO' ? '301' : '184'}px)`,
                height: `calc(100vh - var(--ion-safe-area-top) - 131px - 111px)`,
                width: "100%",
                backgroundColor: "var(--ion-background-color)",
              }}
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              onSlideChange={handleSlideChange}
              resistanceRatio={0}
            >

              <SwiperSlide
                style={{
                  overflow: "auto",
                  padding: "0px 21px 0 21px",
                }}
                onScroll={handleSwiperSlideScroll}
              >
                {(P_AREA_CODE === 'TODO' && approval.IS_SEPERATE) && <div style={{
                  backgroundColor: "var(--ion-background-color)",
                  position: "sticky",
                  width: "100%",
                  height: "48px",
                  display: "flex",
                  alignItems: "center",
                  padding: "0px 9px",
                  borderBottom: "0.56px solid var(--custom-border-color-50)",
                  left: 0,
                  top: 0,
                  zIndex: 1,
                }}>
                  <IonItem button onClick={handleSelectAll} mode='md' className='select-all-button' style={{
                    "--padding-start": "12px",
                    "--padding-end": "12px",
                    "--padding-top": "8px",
                    "--padding-bottom": "8px",
                    "--border-radius": "8px"
                  }}>
                    <IonCheckbox
                      mode='md'
                      checked={isAllSelected}
                      style={{ pointerEvents: 'none', marginRight: '8px' }}
                    />
                    <span style={{ fontSize: '12px' }}>전체 선택 <span style={{ color: 'var(--ion-color-primary)' }}>({selectedItems.size})</span></span>
                  </IonItem>
                </div>}
                {[...approval.SUB, ...approval.SUB, ...approval.SUB, ...approval.SUB].filter((sub: any) => sub.CHECK === 'I').map((item: any, index: number) => (
                  <SubItem
                    style={{ marginTop: index === 0 ? '12px' : 0 }}
                    key={item.FLOWNO + item.FLOWCNT + index}
                    selectable={P_AREA_CODE === "TODO" && approval.IS_SEPERATE}
                    item={item}
                    sub={approval.SUB.filter((sub: any) => sub.CHECK === 'S' && item.FLOWCNT === sub.FLOWCNT)}
                    isSelected={selectedItems.has(item.FLOWCNT)}
                    onSelectionChange={handleItemSelection}
                    onProfitDialogOpen={(profitData) => {
                      setSelectedProfitData(profitData);
                      document.getElementById("profit-dialog-trigger")?.click();
                    }}
                    onAttendeeDialogOpen={(attendeeData) => {
                      setSelectedAttendeeData(attendeeData);
                      document.getElementById("attendee-dialog-trigger")?.click();
                    }}
                    onSubModalOpen={(subs, index) => {
                      setSelectedSubData({ modalTitle: item.TITLE || item.FLD02, subs: subs, initialIndex: index });
                      document.getElementById("sub-modal-trigger")?.click();
                    }}
                  />
                ))}
              </SwiperSlide>
              <SwiperSlide
                style={{
                  overflow: "auto",
                }}
                onScroll={handleSwiperSlideScroll}
              >
                <Timeline
                  position="right"
                  sx={{
                    paddingTop: "12px",
                    paddingLeft: "22px",
                    paddingRight: 0,
                    paddingBottom: 0,
                    margin: 0,
                    "& .MuiTimelineItem-root": {
                      minHeight: "auto",
                      "&:before": {
                        display: "none",
                      },
                    },
                  }}
                >
                  {approval.APPRLINE.map((apprLine: any, index: number) => {
                    const isStarter = apprLine.WFIT_TYPE === "ST";
                    const isRef = apprLine.WFIT_TYPE === "D"; //참조
                    const isLast = index === approval.APPRLINE.length - 1;
                    const text = approval.TEXT.find(
                      (text: any) => text.FLOWIT === apprLine.APPR_CNT
                    )?.LTEXT;

                    let MuiIcon, color, borderColor, connectorColor;

                    if (isRef) {
                      apprLine.WFSTAT = approval.APPRLINE.find((p: any) => (p.APPR_CNT === apprLine.APPR_CNT) && (p.WFIT_TYPE !== 'D'))?.WFSTAT;
                    }

                    switch (apprLine.WFSTAT) {
                      case "":
                        MuiIcon = PersonOutline;
                        color = "var(--gray-color)";
                        borderColor = "var(--gray-color)";
                        connectorColor = "var(--gray-color)";
                        break;
                      case "P":
                        MuiIcon = CheckCircleOutline;
                        color = "var(--gray-color)";
                        borderColor = "var(--ion-color-primary)";
                        connectorColor = "var(--gray-color)";
                        break;
                      case "A":
                        MuiIcon = CheckCircle;
                        color = "var(--ion-color-primary)";
                        borderColor = "var(--ion-color-primary)";
                        connectorColor = "var(--ion-color-primary)";
                        break;
                      case "R":
                        MuiIcon = Cancel;
                        color = "var(--red)";
                        borderColor = "var(--red)";
                        connectorColor = "var(--red)";
                        break;
                      case "C":
                        MuiIcon = Close;
                        color = "var(--red)";
                        borderColor = "var(--red)";
                        connectorColor = "var(--red)";
                        break;
                      default:
                        MuiIcon = PersonOutline;
                        color = "var(--gray-color)";
                        borderColor = "var(--gray-color)";
                        connectorColor = "var(--gray-color)";
                        break;
                    }

                    if (isStarter) {
                      MuiIcon = HowToReg;
                      color = "var(--ion-color-primary)";
                      borderColor = "var(--ion-color-primary)";
                      connectorColor = "var(--ion-color-primary)";
                    }

                    if (isRef) {
                      connectorColor = "var(--ion-color-primary)";
                    }

                    return (
                      <TimelineItem key={`time-line-item-${index}`}>
                        <TimelineSeparator>
                          <TimelineDot
                            sx={{
                              backgroundColor: color,
                              border: "2px solid",
                              borderColor: borderColor,
                              marginTop: "8px",
                              marginBottom: "4px",
                              boxShadow: "none",
                            }}
                          >
                            {MuiIcon ? <MuiIcon /> : null}
                          </TimelineDot>
                          <span
                            style={{
                              fontSize: "12px",
                              marginBottom: "8px",
                              color: borderColor,
                            }}
                          >
                            {apprLine.APPR_CNT}
                          </span>
                          {!isLast && (
                            <TimelineConnector
                              sx={{
                                backgroundColor: connectorColor,
                                minHeight: 8,
                              }}
                            />
                          )}
                        </TimelineSeparator>
                        <TimelineContent sx={{ padding: "0 22px" }}>
                          <ApprLineItem apprLine={apprLine} text={text} />
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                </Timeline>
              </SwiperSlide>
              <SwiperSlide
                style={{
                  overflow: "auto",
                  padding: "12px 21px 0 21px",
                }}
                onScroll={handleSwiperSlideScroll}
              >
                {approval.SUB.map((sub: any, index: number) => (
                  <></>
                  // <SubItem
                  //   key={sub.FLOWNO + sub.FLOWCNT + index}
                  //   selectable={P_AREA_CODE === "TODO"}
                  //   sub={sub}
                  //   isSelected={false}
                  //   onSelectionChange={() => { }}
                  //   onProfitDialogOpen={(profitData) => {
                  //     setSelectedProfitData(profitData);
                  //     // 숨김 버튼을 클릭해서 Dialog 열기
                  //     document.getElementById("profit-dialog-trigger")?.click();
                  //   }}
                  //   onAttendeeDialogOpen={(attendeeData) => {
                  //     setSelectedAttendeeData(attendeeData);
                  //     // 숨김 버튼을 클릭해서 Dialog 열기
                  //     document.getElementById("attendee-dialog-trigger")?.click();
                  //   }}
                  // />
                ))}
              </SwiperSlide>
            </Swiper>
          </div>
          {
            <SubModal
              trigger="sub-modal-trigger"
              modalTitle={selectedSubData?.modalTitle}
              subs={selectedSubData?.subs}
              initialIndex={selectedSubData?.initialIndex}
            />
          }
          {/* 승인 Modal */}
          {
            P_AREA_CODE === 'TODO' && <ApprovalModal
              apprTitle={AREA_CODE_TXT}
              title={approval.IS_SEPERATE ? "분리 승인" : "승인"}
              buttonText="승인하기"
              buttonColor="primary"
              required={false}
              trigger="approve-modal"
              selectedItems={approval.IS_SEPERATE ? approval.SUB.filter((sub: any) => selectedItems.has(sub.FLOWCNT) && sub.CHECK === 'I') : [approval]}
            />
          }
          {/* 반려 Modal */}
          {
            P_AREA_CODE === 'TODO' && <ApprovalModal
              apprTitle={AREA_CODE_TXT}
              title={approval.IS_SEPERATE ? "분리 반려" : "반려"}
              buttonText="반려하기"
              buttonColor="danger"
              required={true}
              trigger="reject-modal"
              selectedItems={approval.IS_SEPERATE ? approval.SUB.filter((sub: any) => selectedItems.has(sub.FLOWCNT) && sub.CHECK === 'I') : [approval]}
            />
          }
          {/* Sub Modal Trigger Button (숨김) */}
          <IonButton
            id="sub-modal-trigger"
            style={{ display: "none" }}
          ></IonButton>
          {/* 수익성 Dialog Trigger Button (숨김) */}
          <IonButton
            id="profit-dialog-trigger"
            style={{ display: "none" }}
          ></IonButton>
          {/* 수익성 Dialog */}
          <CustomDialog
            trigger="profit-dialog-trigger"
            onDidDismiss={() => {
              setSelectedProfitData(null);
            }}
            title="수익성 세그먼트"
            body={
              selectedProfitData && (
                <div style={{ padding: "16px 8px" }}>
                  <div className="profit-dialog-line">
                    <span>손익센터</span>
                    <span>
                      {selectedProfitData.RKE_PRCTR
                        ? selectedProfitData.RKE_PRCTR +
                        " | " +
                        selectedProfitData.RKE_PRCTR_TX
                        : "-"}
                    </span>
                  </div>
                  <div className="profit-dialog-line">
                    <span>영업조직</span>
                    <span>
                      {selectedProfitData.RKE_VKORG
                        ? selectedProfitData.RKE_VKORG +
                        " | " +
                        selectedProfitData.RKE_VKORG_TX
                        : "-"}
                    </span>
                  </div>
                  <div className="profit-dialog-line">
                    <span>제품그룹</span>
                    <span>
                      {selectedProfitData.RKE_MATKL
                        ? selectedProfitData.RKE_MATKL +
                        " | " +
                        selectedProfitData.RKE_MATKL_TX
                        : "-"}
                    </span>
                  </div>
                  <div className="profit-dialog-line">
                    <span>플랜트</span>
                    <span>
                      {selectedProfitData.RKE_WERKS
                        ? selectedProfitData.RKE_WERKS +
                        " | " +
                        selectedProfitData.RKE_WERKS_TX
                        : "-"}
                    </span>
                  </div>
                  <div className="profit-dialog-line" style={{ margin: 0 }}>
                    <span>자재</span>
                    <span>
                      {selectedProfitData.RKE_ARTNR
                        ? selectedProfitData.RKE_ARTNR +
                        " | " +
                        selectedProfitData.RKE_ARTNR_TX
                        : "-"}
                    </span>
                  </div>
                </div>
              )
            }
            singleButton={true}
            singleButtonText="닫기"
            singleButtonColor="light"
          />
          {/* 참석자 Dialog Trigger Button (숨김) */}
          <IonButton
            id="attendee-dialog-trigger"
            style={{ display: "none" }}
          ></IonButton>
          {/* 참석자 Dialog */}
          <CustomDialog
            trigger="attendee-dialog-trigger"
            onDidDismiss={() => {
              setSelectedAttendeeData(null);
            }}
            title="참석자"
            body={
              <div style={{ padding: "0 8px" }}>
                <span
                  style={{
                    color: "var(--ion-color-secondary)",
                    fontSize: "13px",
                  }}
                >
                  참석자 수: {selectedAttendeeData?.length}
                </span>
                <div
                  style={{
                    padding: "0px 0 0px 0",
                    maxHeight: "300px",
                    overflow: "auto",
                    margin: " 16px 0 8px 0",
                  }}
                >
                  {selectedAttendeeData &&
                    selectedAttendeeData.map((attend: any, index: number) => (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: index === 0 ? "0px" : "16px",
                        }}
                        key={`attendee-list-${index}`}
                      >
                        <div style={{ marginTop: "4px" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "4px",
                              marginBottom: "4px",
                              alignItems: "center",
                            }}
                          >
                            <span
                              style={{
                                padding: "2px 4px",
                                borderRadius: "6px",
                                backgroundColor:
                                  attend.GUBUN === "A"
                                    ? "var(--ion-color-success)"
                                    : "var(--ion-color-warning)",
                                color: "var(--ion-color-warning-contrast)",
                                fontSize: "10px",
                              }}
                            >
                              {attend.GUBUN === "A" ? "내부" : "외부"}
                            </span>
                            <span style={{ fontSize: "13px", fontWeight: "500" }}>
                              {attend.ATTENDEE} ({attend.ORGTX})
                            </span>
                          </div>
                          <span style={{ color: "var(--ion-color-secondary)" }}>
                            {attend.PURPOSE || "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            }
            singleButton={true}
            singleButtonText="닫기"
            singleButtonColor="light"
          />
        </IonContent >
        <IonFooter style={{
          boxShadow: 'none',
          backgroundColor: 'var(--ion-background-color)'
        }}>
          {P_AREA_CODE === "TODO" && (
            <div
              style={{
                height: "auto",
                width: "100%",
                borderTop: "1px solid var(--custom-border-color-100)",
                borderRadius: "16px 16px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 21px",
                gap: "12px",
                paddingBottom: 'calc( var(--ion-safe-area-bottom) + 12px )'
              }}
            >
              <IonButton
                mode="md"
                color="light"
                style={{
                  flex: 1,
                  height: "58px",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
                id="reject-modal"
                disabled={approval.IS_SEPERATE ? selectedItems.size < 1 : false}
              >
                <span>반려하기</span>
              </IonButton>
              <IonButton
                mode="md"
                color="primary"
                style={{
                  flex: 1,
                  height: "58px",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
                id="approve-modal"
                disabled={approval.IS_SEPERATE ? selectedItems.size < 1 : false}
              >
                <span>승인하기</span>
              </IonButton>
            </div>
          )}
        </IonFooter>
      </IonPage >
    );
};

export default Detail;

interface SubProps {
  item: any;
  sub?: any;
  selectable: boolean | undefined;
  isSelected: boolean | undefined;
  onSelectionChange: (id: string, isSelected: boolean) => void | undefined;
  onProfitDialogOpen?: (profitData: any) => void;
  onAttendeeDialogOpen?: (attendeeData: any) => void;
  onSubModalOpen?: (subs: any, index: number) => void;
  style?: React.CSSProperties;
}

// ApprovalItem 컴포넌트 - wrapper div 포함
const SubItem: React.FC<SubProps> = React.memo(
  ({
    item,
    sub,
    selectable,
    isSelected,
    onSelectionChange,
    onProfitDialogOpen,
    onAttendeeDialogOpen,
    onSubModalOpen,
    style,
  }) => {
    const titles = useAppStore((state) => state.approvals?.TITLE.TITLE_I);
    const flds = _(item)
      .pickBy((_, key) => /^FLD\d+$/.test(key))
      .toPairs()
      .sortBy(([key]) => parseInt(key.replace("FLD", ""), 10))
      .map(([_, value]) => value)
      .value();

    const handleCheckboxChange = useCallback(
      (checked: boolean) => {
        onSelectionChange(item.FLOWCNT, checked);
      },
      [item.FLOWCNT, onSelectionChange]
    );

    const titleElement = useMemo(
      () => (
        <div
          className="custom-item-title"
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{item.TITLE || item.FLD02}</span>
          <div style={{ display: "flex", gap: "4px" }}>
            {
              //? 수익성
              (item.RKE_PRCTR ||
                item.RKE_ARTNR ||
                item.RKE_MATKL ||
                item.RKE_VKORG ||
                item.RKE_WERKS) && (
                <IonButton
                  id="profitability-dialog"
                  color="tertiary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onProfitDialogOpen?.(item);
                  }}
                  style={{
                    height: "20px",
                    fontSize: "11px",
                    "--padding-top": 0,
                    "--padding-bottom": 0,
                    "--padding-start": "6px",
                    "--padding-end": "6px",
                    "--border-radius": "6px",
                  }}
                >
                  <span>수익성</span>
                </IonButton>
              )
            }
            {
              //? 참석자
              !_.isEmpty(item.CardListAttendeeList) && (
                <IonButton
                  id="attendee-dialog"
                  color="warning"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAttendeeDialogOpen?.(item.CardListAttendeeList);
                  }}
                  style={{
                    height: "20px",
                    fontSize: "11px",
                    "--padding-top": 0,
                    "--padding-bottom": 0,
                    "--padding-start": "6px",
                    "--padding-end": "6px",
                    "--border-radius": "6px",
                  }}
                >
                  <span>참석자</span>
                </IonButton>
              )
            }
          </div>
        </div>
      ),
      [item.TITLE]
    );

    const bodyElement = useMemo(
      () => (
        <div className="custom-item-body">
          {titles?.map((title, index) => {
            return (
              <div
                className="custom-item-body-line"
                key={item.FLOWNO + item.FLOWCNT + index}
              >
                <span>{title}</span>
                <span>{flds[index] || "-"}</span>
              </div>
            );
          })}
        </div>
      ),
      [titles]
    );

    const subElement = !_.isEmpty(sub) ? useMemo(
      () => (
        sub.map((item: any, index: number) =>
          <IonItem
            button
            onClick={(e) => {
              e.stopPropagation();
              onSubModalOpen?.(sub, index);
            }}
            key={`sub-${index}`}
            mode="md"
            style={{
              '--background': isSelected ? 'rgba(var(--ion-color-primary-rgb), .05)' : 'rgba(var(--ion-background-color2-rgb), .5)',
              '--border-radius': '8px',
              '--border-color': isSelected ? 'transparent' : 'var(--custom-border-color-100)',
              marginBottom: sub.length - 1 !== index ? 4 : 0
            }}>
            <div style={{
              width: '100%',
              padding: '10px 12px 10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.TITLE}</span>
              <IonIcon src={chevronForward}
                style={{
                  color: 'var(--ion-color-secondary)'
                }} />
            </div>
          </IonItem>
        )
      ),
      [titles, isSelected]
    ) : null;

    // CustomItem props 메모이제이션 - state 대신 ref 사용으로 최적화
    const customItemProps = useMemo(
      () => ({
        selectable: selectable,
        checked: isSelected,
        title: titleElement,
        body: bodyElement,
        sub: subElement,
        // onClick: handleItemClick,
        onCheckboxChange: handleCheckboxChange,
      }),
      [
        selectable,
        isSelected,
        titleElement,
        bodyElement,
        subElement,
        // handleItemClick,
        handleCheckboxChange,
      ]
    );

    return (
      <CustomItem
        {...customItemProps}
        style={{
          backgroundColor: "var(--ion-card-background2)",
          border: "1px solid var(--custom-border-color-0)",
          marginBottom: "12px",
          ...style
        }}
      />
    );
  }
);

interface ApprLineProps {
  apprLine: any;
  text: string; //결재의견
}

// ApprovalItem 컴포넌트 - wrapper div 포함
const ApprLineItem: React.FC<ApprLineProps> = React.memo(
  ({ apprLine, text }) => {
    // title 엘리먼트 메모이제이션 - 검색어가 변경될 때만 재생성
    const titleElement = useMemo(
      () => (
        <div
          style={{ width: "100%", display: "flex", flexDirection: "column" }}
        >
          <div
            className="custom-item-title"
            style={{
              width: "100%",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <span>
              {apprLine.NAME}({apprLine.ORGTX})
            </span>
            <span
              style={{
                fontSize: "11px",
                backgroundColor: "var(--custom-border-color-50)",
                border: "1px solid var(--custom-border-color-100)",
                padding: "1px 8px",
                borderRadius: "8px",
                fontWeight: "400",
              }}
            >
              {apprLine.WFIT_SUB_TEXT}
            </span>
          </div>
          {text && (
            <div style={{ display: "flex", marginTop: "4px" }}>
              <span
                style={{
                  width: "auto",
                  display: "flex",
                  padding: "4px 12px",
                  backgroundColor: "var(--approval-text-color)",
                  borderRadius: "0 12px 12px 12px",
                  fontSize: "12px",
                  boxShadow: "var(--approval-text-box-shadow)",
                }}
              >
                {text}
              </span>
            </div>
          )}
        </div>
      ),
      [apprLine.NAME, apprLine.ORGTX]
    );

    const bodyElement = useMemo(
      () => (
        <div className="custom-item-body">
          <div className="custom-item-body-line">
            <span>결재완료일</span>
            <span>{Number(apprLine.END_DATE) ? `${apprLine.END_DATE.slice(0, 4)}/${apprLine.END_DATE.slice(4, 6)}/${apprLine.END_DATE.slice(6)}` : "-"}</span>
          </div>
          <div className="custom-item-body-line">
            <span>결재완료시간</span>
            <span>{Number(apprLine.END_TIME) ? `${apprLine.END_TIME.slice(0, 2)}:${apprLine.END_TIME.slice(2, 4)}:${apprLine.END_TIME.slice(4)}` : "-"}</span>
          </div>
        </div>
      ),
      []
    );

    // CustomItem props 메모이제이션 - state 대신 ref 사용으로 최적화
    const customItemProps = useMemo(
      () => ({
        title: titleElement,
        body: bodyElement,
      }),
      [titleElement, bodyElement]
    );

    return (
      <CustomItem
        {...customItemProps}
        style={{
          backgroundColor: "var(--ion-card-background2)",
          border: "1px solid var(--custom-border-color-0)",
          marginBottom: "12px",
        }}
      />
    );
  }
);

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
} from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { useShallow } from "zustand/shallow";
import "swiper/css";
import AppBar from "../components/AppBar";
import CustomDialog from "../components/Dialog";
import "./Detail.css";
import { getFlowIcon } from "../utils";
import { useParams } from "react-router-dom";
import useAppStore from "../stores/appStore";
import { motion } from "framer-motion";
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
import { chevronCollapse, chevronExpand, person } from "ionicons/icons";
import { webviewToast } from "../webview";

const TAB_KEYS = ["tab1", "tab2", "tab3"];

const Detail: React.FC = () => {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState("tab1");
  const [profitDialogOpen, setProfitDialogOpen] = useState(false); // 수익성 Dialog
  const [selectedProfitData, setSelectedProfitData] = useState<any>(null);
  const [attendeeDialogOpen, setAttendeeDialogOpen] = useState(false); // 참석자 Dialog
  const [selectedAttendeeData, setSelectedAttendeeData] = useState<any>(null);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  // CommonAlert 상태
  const [isApprovalAlertOpen, setIsApprovalAlertOpen] = useState(false);
  const [isRejectAlertOpen, setIsRejectAlertOpen] = useState(false);

  // Refs
  const swiperRef = useRef<SwiperClass | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const headerHeightRef = useRef<number>(0);
  const router = useIonRouter();

  useLayoutEffect(() => {
    if (!headerRef.current) return;

    // 임시로 화면 밖에서 측정
    const tempElement = headerRef.current.cloneNode(true) as HTMLElement;
    tempElement.style.position = "absolute";
    tempElement.style.top = "-0";
    tempElement.style.left = "-0";
    // tempElement.style.visibility = "hidden";
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
  const { FLOWNO } = useParams<{ FLOWNO: string }>();
  const P_AREA_CODE = useAppStore(
    useShallow((state) => state.approvals?.P_AREA_CODE) || null
  );
  const P_AREA_CODE_TXT = useAppStore(
    useShallow((state) => state.approvals?.P_AREA_CODE_TXT) || null
  );
  const AREA_CODE_TXT = useAppStore(
    useShallow((state) => state.approvals?.AREA_CODE_TXT) || null
  );
  const approval = useAppStore(
    useShallow(
      (state) =>
        state.approvals?.LIST.find(
          (approval: any) => approval.FLOWNO === FLOWNO
        ) || null
    )
  );

  if (!approval) {
    setTimeout(() => {
      router.canGoBack() ? router.goBack() : router.push('/app/home', 'back', 'replace');
    }, 0);
    webviewToast('존재하지 않는 결재 건입니다.');
    return null;
  }

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

  // 승인/반려 핸들러
  const handleApproval = useCallback((comment: string) => {
    console.log("승인 처리:", comment);
    // 여기에 승인 API 호출 로직 추가
  }, []);

  const handleReject = useCallback((comment: string) => {
    console.log("반려 처리:", comment);
    // 여기에 반려 API 호출 로직 추가
  }, []);

  // 전체 선택 상태 계산
  const isAllSelected = useMemo(() => {
    if (approval.SUB.length === 0) return false;
    return approval.SUB.every((sub: any) => selectedItems.has(sub.FLOWCNT));
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

  return (
    <IonPage className="detail">
      <AppBar
        showBackButton={true}
        titleCenter={false}
        title={
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
              opacity: isHeaderCollapsed ? 1 : 0,
              transition: "opacity 0.3s",
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
              {approval.APPR_TITLE}
            </span>
            <span
              style={{ fontSize: "13px", color: "var(--ion-color-secondary)" }}
            >
              {P_AREA_CODE_TXT}
            </span>
          </div>
        }
        customEndButtons={
          <IonButton
            mode="md"
            shape="round"
            color={"medium"}
            className="app-bar-button"
            onClick={() => setIsHeaderCollapsed(!isHeaderCollapsed)}
          >
            <IonIcon
              icon={isHeaderCollapsed ? chevronExpand : chevronCollapse}
            />
          </IonButton>
        }
      />
      <IonContent scrollEvents={false} scrollY={false} scrollX={false}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            paddingBottom: "var(--ion-safe-area-bottom)",
            backgroundColor: "var(--ion-background-color)",
          }}
        >
          <motion.div
            ref={headerRef}
            animate={{
              opacity: isHeaderCollapsed ? 0 : 1,
              scale: isHeaderCollapsed ? 0.6 : 1,
            }}
            transition={{
              duration: 0.3,
            }}
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
              willChange: 'opacity scale'
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
                  {approval.APPR_TITLE}
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
                        {approval?.NAME}
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
          <motion.div
            animate={{
              height: isHeaderCollapsed ? 0 : headerHeightRef.current,
            }}
            style={{
              backgroundColor: "var(--ion-background-color2)",
              height: headerHeightRef.current,
              willChange: 'height'
            }}
            transition={{
              duration: 0.3,
            }}
          ></motion.div>
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
              flex: 1,
              width: "100%",
            }}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={handleSlideChange}
            resistanceRatio={0}
          >
            <SwiperSlide
              style={{
                overflow: "auto",
                padding: "12px 21px 0 21px",
              }}
            >
              {<div className='buttons-wrapper'>
                <IonItem button onTouchStart={handleSelectAll} mode='md' className='select-all-button'>
                  <IonCheckbox
                    mode='md'
                    checked={isAllSelected}
                    style={{ pointerEvents: 'none' }}
                  />
                  <span>전체 선택 <span style={{ color: 'var(--ion-color-primary)' }}>({selectedItems.size})</span></span>
                </IonItem>
              </div>}
              {approval.SUB.map((sub: any, index: number) => (
                <SubItem
                  key={sub.FLOWNO + sub.FLOWCNT + index}
                  selectable={P_AREA_CODE === "TODO"}
                  sub={sub}
                  isSelected={false}
                  onSelectionChange={() => { }}
                  onProfitDialogOpen={(profitData) => {
                    setSelectedProfitData(profitData);
                    document.getElementById("profit-dialog-trigger")?.click();
                  }}
                  onAttendeeDialogOpen={(attendeeData) => {
                    setSelectedAttendeeData(attendeeData);
                    document.getElementById("attendee-dialog-trigger")?.click();
                  }}
                />
              ))}
            </SwiperSlide>
            <SwiperSlide
              style={{
                overflow: "auto",
              }}
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
                {approval.LISTAPPRLINE.map((apprLine: any, index: number) => {
                  const isStarter = apprLine.WFIT_TYPE === "ST";
                  const isLast = index === approval.LISTAPPRLINE.length - 1;
                  const text = approval.TEXT.find(
                    (text: any) => text.FLOWIT === apprLine.APPR_CNT
                  )?.LTEXT;

                  let MuiIcon, color, borderColor, connectorColor;
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
                            color: color,
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
            >
              {approval.SUB.map((sub: any, index: number) => (
                <SubItem
                  key={sub.FLOWNO + sub.FLOWCNT + index}
                  selectable={P_AREA_CODE === "TODO"}
                  sub={sub}
                  isSelected={false}
                  onSelectionChange={() => { }}
                  onProfitDialogOpen={(profitData) => {
                    setSelectedProfitData(profitData);
                    // 숨김 버튼을 클릭해서 Dialog 열기
                    document.getElementById("profit-dialog-trigger")?.click();
                  }}
                  onAttendeeDialogOpen={(attendeeData) => {
                    setSelectedAttendeeData(attendeeData);
                    // 숨김 버튼을 클릭해서 Dialog 열기
                    document.getElementById("attendee-dialog-trigger")?.click();
                  }}
                />
              ))}
            </SwiperSlide>
          </Swiper>
          {P_AREA_CODE === "TODO" && (
            <div
              style={{
                height: "83px",
                width: "100%",
                borderTop: "1px solid var(--custom-border-color-100)",
                borderRadius: "16px 16px 0 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "12px 21px",
                gap: "12px",
              }}
            >
              <IonButton
                mode="md"
                color="light"
                style={{
                  flex: 1,
                  height: "100%",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
                id="reject-modal"
                // onClick={() => setIsRejectAlertOpen(true)}
              >
                <span>반려하기</span>
              </IonButton>
              <IonButton
                mode="md"
                color="primary"
                style={{
                  flex: 1,
                  height: "100%",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
                id="approve-modal"
                // onClick={() => setIsApprovalAlertOpen(true)}
              >
                <span>승인하기</span>
              </IonButton>
            </div>
          )}
        </div>
        {/* 승인 Modal */}
        <ApprovalModal
          isOpen={isApprovalAlertOpen}
          onDidDismiss={() => setIsApprovalAlertOpen(false)}
          title="승인"
          subtitle="승인 의견을 입력해주세요."
          message="승인 처리하시겠습니까?"
          placeholder="승인 의견 (선택사항)"
          cancelText="취소"
          confirmText="승인하기"
          confirmColor="primary"
          onConfirm={handleApproval}
          maxLength={300}
          required={false}
          trigger="approve-modal"
        />

        {/* 반려 Modal */}
        <ApprovalModal
          isOpen={isRejectAlertOpen}
          onDidDismiss={() => setIsRejectAlertOpen(false)}
          title="반려"
          subtitle="반려 사유를 입력해주세요."
          message="반려 처리하시겠습니까?"
          placeholder="반려 사유를 입력해주세요"
          cancelText="취소"
          confirmText="반려하기"
          confirmColor="danger"
          onConfirm={handleReject}
          maxLength={300}
          required={true}
          trigger="reject-modal"
        />
        {/* 수익성 Dialog Trigger Button (숨김) */}
        <IonButton
          id="profit-dialog-trigger"
          style={{ display: "none" }}
        ></IonButton>
        {/* 수익성 Dialog */}
        <CustomDialog
          trigger="profit-dialog-trigger"
          onDidDismiss={() => {
            setProfitDialogOpen(false);
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
            setAttendeeDialogOpen(false);
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
      </IonContent>
    </IonPage>
  );
};

export default Detail;

interface SubProps {
  sub: any;
  selectable: boolean | undefined;
  isSelected: boolean | undefined;
  onSelectionChange: (id: string, isSelected: boolean) => void | undefined;
  onProfitDialogOpen?: (profitData: any) => void;
  onAttendeeDialogOpen?: (attendeeData: any) => void;
}

// ApprovalItem 컴포넌트 - wrapper div 포함
const SubItem: React.FC<SubProps> = React.memo(
  ({
    sub,
    selectable,
    isSelected,
    onSelectionChange,
    onProfitDialogOpen,
    onAttendeeDialogOpen,
  }) => {
    const titles = useAppStore((state) => state.approvals?.TITLE.TITLE_I);
    const flds = _(sub)
      .pickBy((_, key) => /^FLD\d+$/.test(key))
      .toPairs()
      .sortBy(([key]) => parseInt(key.replace("FLD", ""), 10))
      .map(([_, value]) => value)
      .value();

    const handleCheckboxChange = useCallback(
      (checked: boolean) => {
        onSelectionChange(sub.FLOWNO, checked);
      },
      [sub.FLOWNO, onSelectionChange]
    );

    const handleItemClick = useCallback(() => {
      console.log("아이템 클릭:", sub.FLOWNO);
    }, [sub.FLOWNO]);

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
          <span>{sub.BKTXT}</span>
          <div style={{ display: "flex", gap: "4px" }}>
            {
              //? 수익성
              (sub.RKE_PRCTR ||
                sub.RKE_ARTNR ||
                sub.RKE_MATKL ||
                sub.RKE_VKORG ||
                sub.RKE_WERKS) && (
                <IonButton
                  id="profitability-dialog"
                  color="tertiary"
                  onClick={() => {
                    onProfitDialogOpen?.(sub);
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
              !_.isEmpty(sub.CardListAttendeeList) && (
                <IonButton
                  id="attendee-dialog"
                  color="warning"
                  onClick={() => {
                    onAttendeeDialogOpen?.(sub.CardListAttendeeList);
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
      [sub.BKTXT]
    );

    const bodyElement = useMemo(
      () => (
        <div className="custom-item-body">
          {titles?.map((title, index) => {
            return (
              <div
                className="custom-item-body-line"
                key={sub.FLOWNO + sub.FLOWCNT + index}
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

    // CustomItem props 메모이제이션 - state 대신 ref 사용으로 최적화
    const customItemProps = useMemo(
      () => ({
        selectable: selectable,
        checked: isSelected,
        title: titleElement,
        body: bodyElement,
        onCheckboxChange: handleCheckboxChange,
      }),
      [
        isSelected,
        titleElement,
        bodyElement,
        handleItemClick,
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
              {apprLine.WFIT_TYPE_TEXT}
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
            <span>{apprLine.END_DATE || "-"}</span>
          </div>
          <div className="custom-item-body-line">
            <span>결재완료시간</span>
            <span>{apprLine.END_TIME || "-"}</span>
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

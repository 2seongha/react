// Types
export interface AppState {
  themeMode: 'light' | 'dark' | 'system';
  user: UserModel | null;
  corp: CorpModel | null;
  areas: AreaModel[] | null;
  approvals: ApprovalModel | null;
  todoSummary: ApprovalModel | null;
  notices: NoticeModel[] | null;
  notifications: NotificationModel[] | null;
  selectedTab: number;
  notificationPopupShown: boolean;
  summaryForceRefresh: boolean;
  searchHelp: any;
  datePicker: any;
  pushAllow: any;

  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setUser: (user: UserModel) => void;
  setCorp: (user: CorpModel) => void;
  setAreas: (areas: AreaModel[] | null) => void;
  setApprovals: (approvals: ApprovalModel | null | undefined) => void;
  setTodoSummary: (todoSummary: ApprovalModel | null | undefined) => void;
  setNotices: (notices: NoticeModel[] | null) => void;
  setNotifications: (notifications: NotificationModel[] | null) => void;
  setSelectedTab: (tab: number) => void;
  setNotificationPopupShown: (shown: boolean) => void;
  setSummaryForceRefresh: (force: boolean) => void;
  setSearchHelp: (searchHelp: any) => void;
  setDatePicker: (datePicker: any) => void;
  setPushAllow: (pushAllow: any) => void;

  getUser: (LOGIN_ID: string) => Promise<void>;
  getAreas: (P_AREA_CODE: string) => Promise<void>;
  getApprovals: (P_AREA_CODE: string, AREA_CODE: string, FLOWCODE: string, FLOWNO: string) => Promise<void>;
  getTodoSummary: (P_AREA_CODE: string, AREA_CODE: string, FLOWCODE: string, FLOWNO: string) => Promise<void>;
  getNotices: () => Promise<void>;
  getNotifications: () => Promise<NotificationModel[] | undefined>;
  patchNotifications: (NOTIFY_NO: string, READ_YN: string, DELETE_YN: string) => Promise<void>;
  getNotificationPopupShown: () => boolean;
  getSummaryForceRefresh: () => boolean;
  getSearchHelp: () => boolean;
  getPushAllow: () => Promise<void>;
}

export interface UserModel {
  BUKRS?: string;
  LOGIN_ID?: string;
  NAME?: string;
  // PERNR?: string;
  ORGEH?: string;
  ORGTX?: string;
  RANK?: string;
  RANK_NAME?: string;
  // POSITIONN?: string;
  // POSITIONN_NAME?: string;
  KOSTL?: string;
  // KOSTL_NAME?: string;
  // LAND1?: string;
  MAIL?: string;
  PHONE?: string;
  // PASS?: string;
  // PASS01?: string;
  // PASS02?: string;
  // PASS03?: string;
  // PASS04?: string;
  // PASS05?: string;
  // PASS06?: string;
}

export interface NotificationModel {
  NOTIFY_NO: string;
  TITLE?: string;
  CONTENT?: string;
  TYPE?: 'START' | 'APPROVE' | 'REJECT';
  READ_YN: 'Y' | 'N';
  POPUP_YN: 'Y' | 'N';
  LINK?: string;
  ERDAT?: string;
}

export interface NoticeModel {
  ALL_MODE: string;
  ATTACH: string;
  ATTACH_ICON: string;
  CREATOR_ID: string;
  CREATOR_NAME: string;
  CRE_DATE: string;
  CRE_TIME: string;
  FDATE: string;
  LEN: string;
  LTEXT: string;
  NO: string;
  ORGEH: string;
  ORGTX: string;
  POPUP: string;
  SEQNO: string;
  TDATE: string;
  TITLE: string;
}

export interface AreaModel {
  P_AREA_CODE?: string;
  P_AREA_CODE_TXT?: string;
  AREA_CODE?: string;
  O_LTEXT?: string;
  CNT?: number;
  FLOWCODE?: string;
  CHILDREN?: AreaModel[] | undefined;
}

export interface ApprovalModel {
  LOGIN_ID: string;
  FLOWCODE: string;
  FLOWCODE_TXT: string;
  P_AREA_CODE: string;
  P_AREA_CODE_TXT: string;
  AREA_CODE: string;
  AREA_CODE_TXT: string;
  LIST: any;
  TITLE: {
    TITLE_H: string[],
    TITLE_I: string[],
    TITLE_S: string[],
  }
}

export interface ShellPadding {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface KeyboardVisibility {
  isOpen: boolean;
  height: number;
}

export interface CorpModel {
  // 필요한 corp 모델 속성들 정의
  CORP_ID: string;
  CORP_NM: string;
  SYSTEM: {
    webviewLink: string;
    apiEndpoint: string;
    apiKey: string;
  }
}

export interface DeviceInfoModel {
  [key: string]: any;
}

export type FormRef = {
  [key: string]: string | undefined | any;
};
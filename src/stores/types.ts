// Types
export interface AppState {
  themeMode: 'light' | 'dark' | 'system';
  user: User;
  menuAreas: AreaModel[] | null;
  flowList: AreaModel[] | null;
  approvals: ApprovalModel[] | null;
  notices: NoticeModel[] | null;
  todoSummary: AreaModel[] | null;
  notifications: NotificationModel[] | null;
  selectedTab: number;

  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setUser: (user: User) => void;
  setMenuAreas: (areas: AreaModel[] | null) => void;
  setFlowList: (areas: AreaModel[] | null) => void;
  setApprovals: (areas: ApprovalModel[] | null) => void;
  setNotices: (notices: NoticeModel[] | null) => void;
  setTodoSummary: (summary: AreaModel[] | null) => void;
  setNotifications: (notifications: NotificationModel[] | null) => void;
  setSelectedTab: (tab: number) => void;

  fetchMenuAreas:()=>Promise<void>;
  fetchFlowList:()=>Promise<void>;
  fetchApprovals:()=>Promise<void>;
  fetchNotices:()=>Promise<void>;
  fetchTodoSummary:()=>Promise<void>;
  fetchNotifications:()=>Promise<void>;
}

export interface User {
  name?: string;
  loginId?: string;
  bukrs?: string;
  dept?: string;
  position?: string;
}

export interface NotificationModel {
  notifyNo: string;
  title?: string;
  content?: string;
  readYn: 'Y' | 'N';
  popupYn: 'Y' | 'N';
  link?: string;
}

export interface NoticeModel {
  id: string;
  title?: string;
  content?: string;
  isNew?: boolean;
}

export interface AreaModel {
  areaCode?: string;
  flowCode?: string;
  oLtext?: string;
  cnt?: string;
  pAreaCode?: string;
}

export interface ApprovalModel {
  apprTitle: string;
  flowNo: string;
  createDate: string;
  creatorName: string;
}

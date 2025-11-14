import { AppState } from './types';
import { getApprovals, getAreas, getNotices, getNotifications, getUser, patchNotifications } from './service';
import { createWithEqualityFn } from 'zustand/traditional'
import _ from 'lodash';

// themeMode 초기값을 localStorage에서 가져오기
const getInitialThemeMode = (): 'light' | 'dark' | 'system' => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('themeMode');
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as 'light' | 'dark' | 'system';
    }
  }
  return 'system';
};

// Request ID를 관리하는 객체
const requestIds = {
  areas: 0,
  flowList: 0,
  approvals: 0,
  notices: 0,
  todoSummary: 0,
  notifications: 0,
};

const useAppStore = createWithEqualityFn<AppState>((set, get) => ({
  themeMode: getInitialThemeMode(),
  user: null,
  corp: null,
  areas: null,
  approvals: null,
  notices: null,
  notificationPopupShown: false,
  notifications: null,
  selectedTab: 0,

  setThemeMode: (mode) => {
    // localStorage에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', mode);
    }
    set({ themeMode: mode });
  },
  setUser: (user) => set({ user: user }),
  setCorp: (corp) => set({ corp: corp }),
  setAreas: (areas) => set({ areas: areas }),
  setApprovals: (approvals) => set({ approvals: approvals }),
  setNotices: (notices) => set({ notices }),
  setNotifications: (notifications) => set({ notifications }),
  setSelectedTab: (tab) => set({ selectedTab: tab }),

  getUser: async (LOGIN_ID: string) => {
    const currentRequestId = ++requestIds.areas;
    const user = await getUser(LOGIN_ID);

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.areas) {
      set({ user: user });
    }
  },
  getAreas: async (P_AREA_CODE: string) => {
    const currentRequestId = ++requestIds.areas;
    const areas = await getAreas(P_AREA_CODE);

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.areas) {
      set({ areas: areas });
    }
  },
  getApprovals: async (P_AREA_CODE: string, AREA_CODE: string, FLOWCODE: string, FLOWNO: string) => {
    const currentRequestId = ++requestIds.approvals;
    const approvals = await getApprovals(P_AREA_CODE, AREA_CODE, FLOWCODE, FLOWNO);

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.approvals) {
      set({ approvals: approvals });
    }
  },
  getNotices: async () => {
    const currentRequestId = ++requestIds.notices;
    const notices = await getNotices();

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.notices) {
      set({ notices });
    }
  },
  getNotifications: async () => {
    const currentRequestId = ++requestIds.notifications;
    const notifications = await getNotifications();
    if (_.isEqual(notifications, get().notifications)) return;
    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.notifications) {
      set({ notifications });
    }
  },

  patchNotifications: async (NOTIFY_NO: string, READ_YN: string, DELETE_YN: string) => {
    await patchNotifications(NOTIFY_NO, READ_YN, DELETE_YN);
  },
}));

export default useAppStore;
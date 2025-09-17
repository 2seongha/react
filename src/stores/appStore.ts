import { AppState, AreaModel } from './types';
import { fetchApprovals, fetchAreas, fetchNotices, fetchNotifications, fetchUser } from './service';
import { createWithEqualityFn } from 'zustand/traditional'

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

  fetchUser: async (LOGIN_ID: string) => {
    const currentRequestId = ++requestIds.areas;
    const user = await fetchUser(LOGIN_ID);

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.areas) {
      set({ user: user });
    }
  },
  fetchAreas: async (P_AREA_CODE: string) => {
    const currentRequestId = ++requestIds.areas;
    const areas = await fetchAreas(P_AREA_CODE);

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.areas) {
      set({ areas: areas });
    }
  },
  fetchApprovals: async (P_AREA_CODE: string, AREA_CODE: string) => {
    const currentRequestId = ++requestIds.approvals;
    let approvals = await fetchApprovals(P_AREA_CODE, AREA_CODE);

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.approvals) {
      set({ approvals: approvals });
    }
  },
  fetchNotices: async () => {
    const currentRequestId = ++requestIds.notices;
    const notices = await fetchNotices();

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.notices) {
      set({ notices });
    }
  },
  fetchNotifications: async () => {
    const currentRequestId = ++requestIds.notifications;
    const notifications = await fetchNotifications();

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.notifications) {
      set({ notifications });
    }
  },

}));

export default useAppStore;
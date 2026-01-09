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
  searchHelp: 0,
};

const useAppStore = createWithEqualityFn<AppState>((set, get) => ({
  themeMode: getInitialThemeMode(),
  user: null,
  corp: null,
  areas: null,
  approvals: null,
  notices: null,
  notifications: null,
  selectedTab: 0,
  notificationPopupShown: false,
  summaryForceRefresh: false,
  searchHelp: { isOpen: false },
  datePicker: { isOpen: false },

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
  setNotificationPopupShown: (shown) => set({ notificationPopupShown: shown }),
  setSummaryForceRefresh: (force) => set({ summaryForceRefresh: force }),
  setSearchHelp: (searchHelp) => set({ searchHelp: searchHelp }),
  setDatePicker: (datePicker) => set({ datePicker: datePicker }),

  getUser: async (LOGIN_ID: string) => {
    const currentRequestId = ++requestIds.areas;
    const user = await getUser(LOGIN_ID);

    if (user instanceof Error) {
      console.log(user);
      set({ user: {} });
    }

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.areas) {
      set({ user: user });
    }
  },
  getAreas: async (P_AREA_CODE: string) => {
    const currentRequestId = ++requestIds.areas;
    const areas = await getAreas(P_AREA_CODE);

    if (areas instanceof Error) {
      console.log(areas);
      set({ areas: [] });
    }

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.areas) {
      set({ areas: areas });
    }
  },
  getApprovals: async (P_AREA_CODE: string, AREA_CODE: string, FLOWCODE: string, FLOWNO: string) => {
    const currentRequestId = ++requestIds.approvals;
    const approvals = await getApprovals(P_AREA_CODE, AREA_CODE, FLOWCODE, FLOWNO);

    if (approvals instanceof Error) {
      console.log(approvals);
      set({
        approvals: {
          LOGIN_ID: '',
          FLOWCODE: '',
          FLOWCODE_TXT: '',
          P_AREA_CODE: '',
          P_AREA_CODE_TXT: '',
          AREA_CODE: '',
          AREA_CODE_TXT: '',
          LIST: '',
          TITLE: {
            TITLE_H: [],
            TITLE_I: [],
            TITLE_S: [],
          }
        }
      });
    }

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.approvals) {
      set({ approvals: approvals });
    }
  },
  getNotices: async () => {
    const currentRequestId = ++requestIds.notices;
    const notices = await getNotices();

    if (notices instanceof Error) {
      console.log(notices);
      set({ notices: [] });
    }

    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.notices) {
      set({ notices });
    }
  },
  getNotifications: async () => {
    const currentRequestId = ++requestIds.notifications;
    const notifications = await getNotifications();

    if (notifications instanceof Error) {
      console.log(notifications);
      set({ notifications: [] });
    }

    if (_.isEqual(notifications, get().notifications)) return;
    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.notifications) {
      set({ notifications });
    }
    return notifications;
  },

  patchNotifications: async (NOTIFY_NO: string, READ_YN: string, DELETE_YN: string) => {
    await patchNotifications(NOTIFY_NO, READ_YN, DELETE_YN);
  },

  getNotificationPopupShown: () => {
    return get().notificationPopupShown;
  },

  getSummaryForceRefresh: () => {
    return get().summaryForceRefresh;
  },

  getSearchHelp: () => {
    return true;
  },
}));

export default useAppStore;
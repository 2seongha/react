import { create } from 'zustand';
import { AppState } from './types';
import { fetchApprovals, fetchMenuAreas, fetchNotices, fetchNotifications } from './service';

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
  menuAreas: 0,
  flowList: 0,
  approvals: 0,
  notices: 0,
  todoSummary: 0,
  notifications: 0,
};

const useAppStore = create<AppState>((set, get) => ({
  themeMode: getInitialThemeMode(),
  user: {},
  menuAreas: null,
  flowList: null,
  approvals: null,
  notices: null,
  todoSummary: null,
  notificationPopupShown: false,
  notifications: null,

  setThemeMode: (mode) => {
    // localStorage에 저장
    if (typeof window !== 'undefined') {
      localStorage.setItem('themeMode', mode);
    }
    set({ themeMode: mode });
  },
  setUser: (user) => set({ user }),
  setMenuAreas: (areas) => set({ menuAreas: areas }),
  setFlowList: (areas) => set({ flowList: areas }),
  setApprovals: (approvals) => set({ approvals: approvals }),
  setNotices: (notices) => set({ notices }),
  setTodoSummary: (areas) => set({ todoSummary: areas }),
  setNotifications: (notifications) => set({ notifications }),

  fetchMenuAreas: async () => {
    const currentRequestId = ++requestIds.menuAreas;
    const areas = await fetchMenuAreas();
    
    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.menuAreas) {
      set({ menuAreas: areas });
    }
  },
  fetchFlowList: async () => {
    const currentRequestId = ++requestIds.flowList;
    const areas = await fetchMenuAreas();
    
    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.flowList) {
      set({ flowList: areas });
    }
  },
  fetchApprovals: async () => {
    const currentRequestId = ++requestIds.approvals;
    const approvals = await fetchApprovals();
    
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
  fetchTodoSummary: async () => {
    const currentRequestId = ++requestIds.todoSummary;
    const areas = await fetchMenuAreas();
    
    // 마지막 요청인지 확인
    if (currentRequestId === requestIds.todoSummary) {
      set({ todoSummary: areas });
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
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
    const areas = await fetchMenuAreas();
    set({ menuAreas: areas });
  },
  fetchFlowList: async () => {
    const areas = await fetchMenuAreas();
    set({ flowList: areas });
  },
  fetchApprovals: async () => {
    const approvals = await fetchApprovals();
    set({ approvals: approvals });
  },
  fetchNotices: async () => {
    const notices = await fetchNotices();
    set({ notices })
  },
  fetchTodoSummary: async () => {
    const areas = await fetchMenuAreas();
    set({ todoSummary: areas })
  },
  fetchNotifications: async () => {
    const notifications = await fetchNotifications();
    set({ notifications })
  },

}));

export default useAppStore;
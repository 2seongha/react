import { create } from 'zustand';
import { AppState } from './types';
import { fetchApprovals, fetchMenuAreas, fetchNotices, fetchNotifications } from './service';

const useAppStore = create<AppState>((set, get) => ({
  themeMode: 'system',
  user: {},
  menuAreas: null,
  flowList: null,
  approvals: null,
  notices: null,
  todoSummary: null,
  notificationPopupShown: false,
  notifications: null,

  setThemeMode: (mode) => set({ themeMode: mode }),
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
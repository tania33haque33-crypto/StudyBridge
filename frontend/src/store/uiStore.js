import { create } from 'zustand';

const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'light',
  notifications: [],
  unreadNotificationsCount: 0,
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  
  setTheme: (theme) => set({ theme }),
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadNotificationsCount: state.unreadNotificationsCount + 1,
    })),
  
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      ),
      unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1),
    })),
  
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadNotificationsCount: 0,
    })),
  
  setUnreadCount: (count) => set({ unreadNotificationsCount: count }),
  
  clearNotifications: () =>
    set({ notifications: [], unreadNotificationsCount: 0 }),
}));

export default useUIStore;
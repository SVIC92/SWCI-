import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useGlobalStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      usuariosConectados: [],

      lightThemeColor: "#ffffffff",
      setLightThemeColor: (color) => set({ lightThemeColor: color }),
      theme: "light",
      fontSize: "medium",
      density: "comfortable",
      sidebarCollapsed: false,
      showFooter: true,

      login: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setUser: (updater) =>
        set((state) => ({
          user: typeof updater === "function" ? updater(state.user) : updater,
        })),

      setUsuariosConectados: (usuarios) => set({ usuariosConectados: usuarios }),
      
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setDensity: (density) => set({ density }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setShowFooter: (show) => set({ showFooter: show }),
    }),

    {
      name: "global-storage",
    }
  )
);

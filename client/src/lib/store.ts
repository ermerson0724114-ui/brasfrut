import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  name: string;
  isAdmin: boolean;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        set({ user, token });
      },
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    { name: "brasfrut_auth" }
  )
);

interface SettingsStore {
  logoUrl: string | null;
  companyName: string;
  setLogoUrl: (url: string | null) => void;
  setCompanyName: (name: string) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      logoUrl: null,
      companyName: "Brasfrut",
      setLogoUrl: (url) => set({ logoUrl: url }),
      setCompanyName: (name) => set({ companyName: name }),
    }),
    { name: "brasfrut_settings" }
  )
);

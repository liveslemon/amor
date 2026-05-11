import { create } from "zustand";
import { User } from "../api/types";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  setAuth: (token, user) =>
    set({ token, user }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem("mingle_token");
      localStorage.removeItem("mingle_access_token");
    }
    set({
      token: null,
      user: null,
    });
  },
}));

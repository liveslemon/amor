import { create } from "zustand";

type AnswerValue =
  | string
  | number
  | string[]
  | { feet: number; inches: number };

interface MatchState {
  answers: Record<string, AnswerValue>;
  currentStep: number;
  currentPage: number;

  isWaitlistModalOpen: boolean;
  toggleWaitlistModal: () => void;
  setAnswer: (id: string, value: AnswerValue) => void;
  isUpdating: boolean;
  setIsUpdating: (val: boolean) => void;
  hydrateProfile: (
    profile: any,
    preferences: any,
    focuses: string[],
    builds: string[],
    photos: any[],
  ) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  answers: {},
  currentStep: 0,
  currentPage: 0,
  isWaitlistModalOpen: false,
  isUpdating: false,

  toggleWaitlistModal: () =>
    set((state) => ({ isWaitlistModalOpen: !state.isWaitlistModalOpen })),

  setAnswer: (id, value) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [id]: value,
      },
    })),

  setIsUpdating: (val) => set({ isUpdating: val }),

  hydrateProfile: (profile, preferences, focuses, builds, photos) =>
    set({
      answers: {
        ...profile,
        // Convert green_flag from comma-separated string to array for Step4
        green_flag: profile?.green_flag
          ? typeof profile.green_flag === "string"
            ? profile.green_flag
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : profile.green_flag
          : [],
        ...preferences,
        focuses,
        preferred_builds: builds,
        uploaded_photos: photos,
      },
    }),

  next: () =>
    set((state) => ({
      currentPage: state.currentPage + 1,
    })),

  back: () =>
    set((state) => ({
      currentPage: Math.max(state.currentPage - 1, 0),
    })),

  reset: () =>
    set({
      answers: {},
      currentStep: 0,
      currentPage: 0,
      isUpdating: false,
    }),
}));

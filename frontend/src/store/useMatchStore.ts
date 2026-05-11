import { create } from "zustand";

type AnswerValue = string | number | string[];

interface MatchState {
  answers: Record<string, AnswerValue>;
  currentStep: number;
  currentPage: number;

  isWaitlistModalOpen: boolean;
  toggleWaitlistModal: () => void;
  setAnswer: (id: string, value: AnswerValue) => void;
  next: () => void;
  back: () => void;
  reset: () => void;
}

export const useMatchStore = create<MatchState>((set) => ({
  answers: {},
  currentStep: 0,
  currentPage: 0,
  isWaitlistModalOpen: false,

  toggleWaitlistModal: () =>
    set((state) => ({ isWaitlistModalOpen: !state.isWaitlistModalOpen })),

  setAnswer: (id, value) =>
    set((state) => ({
      answers: {
        ...state.answers,
        [id]: value,
      },
    })),

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
    }),
}));
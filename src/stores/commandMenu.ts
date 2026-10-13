import { create } from "zustand";

interface CommandMenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
  /** Bumped to ask the sidebar search field to take focus. */
  focusSearch: number;
  requestSearchFocus: () => void;
}

/** UI state shared by the menu bar, the ⌘K palette and the sidebar search. */
export const useCommandMenu = create<CommandMenuState>()((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  focusSearch: 0,
  requestSearchFocus: () => set((s) => ({ focusSearch: s.focusSearch + 1 })),
}));

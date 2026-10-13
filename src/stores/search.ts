import { create } from "zustand";

interface SearchState {
  query: string;
  setQuery: (query: string) => void;
}

/** Sidebar search text. Shared with the home grid so both filter together. */
export const useSearch = create<SearchState>()((set) => ({
  query: "",
  setQuery: (query) => set({ query }),
}));

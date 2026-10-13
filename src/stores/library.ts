import { create } from "zustand";
import { persist } from "zustand/middleware";

const maxRecents = 6;

interface LibraryState {
  favorites: string[];
  recents: string[];
  /** Sidebar groups the user folded away. */
  collapsed: string[];
  toggleFavorite: (id: string) => void;
  markOpened: (id: string) => void;
  toggleCollapsed: (group: string) => void;
}

/** Which tools the user starred and opened recently. */
export const useLibrary = create<LibraryState>()(
  persist(
    (set) => ({
      favorites: [],
      recents: [],
      collapsed: [],
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      markOpened: (id) =>
        set((s) => ({ recents: [id, ...s.recents.filter((r) => r !== id)].slice(0, maxRecents) })),
      toggleCollapsed: (group) =>
        set((s) => ({
          collapsed: s.collapsed.includes(group)
            ? s.collapsed.filter((g) => g !== group)
            : [...s.collapsed, group],
        })),
    }),
    { name: "library" },
  ),
);

export const useIsFavorite = (id: string) => useLibrary((s) => s.favorites.includes(id));

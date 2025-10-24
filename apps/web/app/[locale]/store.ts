import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type GlobalStore = {
  setTheme?: (theme: 'light' | 'dark') => void;
  theme?: 'light' | 'dark';
  setIsOpen?: (isOpen: boolean) => void;
  isOpen?: boolean;
};

export const useGlobalStore = create<GlobalStore>()(
  persist(
    (set) => ({
      setTheme: (theme) => set({ theme }),
      theme: 'light',
      setIsOpen: (isOpen) => set({ isOpen }),
    }),
    {
      name: 'global-storage', // unique name for your storage item
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

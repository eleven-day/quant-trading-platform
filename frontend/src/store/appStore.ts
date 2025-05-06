import { create } from 'zustand';

interface AppState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const useAppStore = create<AppState>((set: (partial: Partial<AppState>) => void) => ({
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
  error: null,
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));

export default useAppStore;
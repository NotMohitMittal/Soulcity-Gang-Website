import { create } from "zustand";

// Shape an achievement is expected to have once the API is wired up:
// { _id, title, description, date, category }
const useAchievementsStore = create((set) => ({
  achievements: [],
  loading: false,
  error: null,

  // TODO: call GET /achievements with axios and
  // set({ achievements: res.data.achievements })
  fetchAchievements: async () => {},

  setAchievements: (achievements) => set({ achievements }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

export default useAchievementsStore;
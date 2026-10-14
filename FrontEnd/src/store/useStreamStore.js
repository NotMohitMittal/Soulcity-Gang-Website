import AxiosClient from "@/api/axios";
import { create } from "zustand";

const useStreamStore = create((set) => ({
  // states
  // null = not loaded yet, [] = loaded but nothing found
  youtubeStreams: null,
  youtubeVideos: null,

  // actions

  getYoutubeLive: async () => {
    try {
      const response = await AxiosClient.get("/youtube/live");

      set({
        youtubeStreams: response.data.streams,
      });

      return {
        success: true,
        streams: response.data.streams,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        set({ youtubeStreams: [] });
        return { success: true, streams: [] };
      }

      console.log(error);
      return { success: false };
    }
  },

  getYoutubeVideos: async () => {
    try {
      const response = await AxiosClient.get("/youtube/video");

      set({
        youtubeVideos: response.data.videos,
      });

      return {
        success: true,
        videos: response.data.videos,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        set({ youtubeVideos: [] });
        return { success: true, videos: [] };
      }

      console.log(error);
      return { success: false };
    }
  },
}));

export default useStreamStore;
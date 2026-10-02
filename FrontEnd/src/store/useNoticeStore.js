import AxiosClient from "@/api/axios";
import { create } from "zustand";

const useNoticeStore = create((set, get) => ({
  // states

  // actions

  createNotice: async ({ notice_title, notice_summary, notice_description, notice_category, notice_priority }) => {
    try {
      const response = await AxiosClient.post("/notice/create", {
        notice_title,
        notice_summary,
        notice_description,
        notice_category,
        notice_priority,
      });

      return {
        success: true,
        createdNotice: response.data.createdNotice,
      };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  },

  getNotices: async () => {
    try {
      const response = await AxiosClient.get("/notice/show");

      return {
        success: true,
        notices: response.data.notices,
      };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  },

  updateNotice: async ({
    notice_id,
    notice_title,
    notice_summary,
    notice_description,
    notice_category,
    notice_priority,
  }) => {
    try {
      const response = await AxiosClient.patch("/notice/update", {
        notice_id,
        notice_title,
        notice_summary,
        notice_description,
        notice_category,
        notice_priority,
      });

      return {
        success: true,
        updatedNotice: response.data.updatedNotice,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
      };
    }
  },

  deleteNotice: async ({ notice_id }) => {
    try {
      // NOTE: axios.delete(url, config) — a body has to go under `data`,
      // passing { notice_id } directly here was sending no body at all.
      const response = await AxiosClient.delete("/notice/remove", { data: { notice_id } });

      return {
        success: true,
        deletedNotice: response.data.deletedNotice,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
      };
    }
  },

  setCurrentNotice: async ({ notice_id }) => {
    try {
      const response = await AxiosClient.patch("/notice/set-current", { notice_id });

      return {
        success: true,
        currentNotice: response.data.currentNotice,
      };
    } catch (error) {
      console.log(error);
      return {
        success: false,
      };
    }
  },
}));

export default useNoticeStore;
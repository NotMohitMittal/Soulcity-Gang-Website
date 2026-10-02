import { create } from "zustand";
import AxiosClient from "../api/axios";
import toast from "react-hot-toast";

const useAuthStore = create((set) => ({
  // states
  authUser: null,
  isCheckingAuth: true,
  isAuthLoading: false,

  // actions

  // Validate logged-in user
  checkAuth: async () => {
    try {
      const response = await AxiosClient.get("/auth/validate/login");
      if (response.data.isAuthorized) {
        set({
          authUser: response.data.user,
        });
      }
    } catch (error) {
      console.log("Auth validation failed:", error.message);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // Register API
  registerMember: async (formData) => {
    set({ isAuthLoading: true });
    try {
      const response = await AxiosClient.post("/auth/register", formData);

      return { success: true };
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      set({ isAuthLoading: false });
    }
  },

  // Login API
  loginMember: async (formData) => {
    set({ isAuthLoading: true });
    try {
      const response = await AxiosClient.post("/auth/login", formData);

      if (response.data.user.verified) {
        set({
          authUser: response.data.user,
        });
        return { success: true };
      }

      toast.error("Gang joining pending");
      return {
        success: false,
      };
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      set({ isAuthLoading: false });
    }
  },

  logoutMember: async () => {
    try {
      await AxiosClient.get("/auth/logout");

      set({
        authUser: null,
      });

      toast.success("Logged-out successfully");
    } catch (error) {
      console.log(error);
      toast.error("Unable to logout");
    }
  },
}));

// Note: If getInventoryLogs is fetching data, it should usually be a .get() request.
// If it's actually modifying/creating logs, consider renaming it to 'updateInventoryLogs' for clarity.
export const getInventory = () => AxiosClient.get("/inventory/details");
export const getInventoryLogs = () => AxiosClient.post("/inventory/update");

export default useAuthStore;

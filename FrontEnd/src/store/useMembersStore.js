import { create } from "zustand";
import AxiosClient from "../api/axios";

const useMemberStore = create((set, get) => ({
  // states
  members: [],
  memberRequests: [],
  loading: false,
  error: null,

  // actions

  getMembers: async () => {
    set({ loading: true, error: null });
    try {
      const response = await AxiosClient.get("/member/authorized");

      set({
        members: response.data.authorizedMembers,
        loading: false,
      });

      return {
        success: true,
        authorizedMembers: response.data.authorizedMembers, // this is to be used directly to react hooks for fixing the synchronization issue
      };
    } catch (error) {
      console.log(error);
      set({ loading: false, error: error.response?.data?.message ?? "Failed to load members" });
      return { success: false };
    }
  },

  getRequests: async () => {
    try {
      const response = await AxiosClient.get("/member/requests");

      set({
        memberRequests: response.data.pendingMembers,
      });

      return {
        success: true,
        pendingMembers: response.data.pendingMembers,
      };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  },

  verifyRequest: async ({member_id}) => {
    try {
      const response = await AxiosClient.post("/member/verify", { member_id });

      // drop the member out of the pending list now that they're verified
      set({
        memberRequests: get().memberRequests.filter((m) => m._id !== member_id),
      });

      return {
        success: true,
        verifiedMember: response.data.member,
      };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  },

  changeRole: async ({ member_id, new_role }) => {
    try {
      const response = await AxiosClient.post("/member/change/role", { member_id, new_role });

      // reflect the new role in local state without a full refetch
      set({
        members: get().members.map((m) => (m._id === member_id ? response.data.user : m)),
      });

      return {
        success: true,
        changedMember: response.data.user,
      };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  },

  removeRole: async (member_id) => {
    try {
      // Same fix as verifyRequest — send { member_id }, not the raw id.
      const response = await AxiosClient.post("/member/remove/role", { member_id });

      set({
        members: get().members.filter((m) => m._id !== member_id),
      });

      return {
        success: true,
        removedMember: response.data.user,
      };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  },

  rejectRequest: async ({ member_id }) => {
    try {
      const response = await AxiosClient.post("/member/reject", { member_id });
      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  },
}));

export default useMemberStore;

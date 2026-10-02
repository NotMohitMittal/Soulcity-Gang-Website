import { create } from "zustand";
import useAuthStore from "./useAuthStore";
import AxiosClient from "../api/axios";

const useInventoryStore = create((set, get) => ({
  // states
  sharedInventory: null,

  // actions
  getInventory: async () => {
    try {
      const { authUser } = useAuthStore.getState();

      if (authUser) {
        const response = await AxiosClient.get("/inventory/details");

        set({
          sharedInventory: response.data.inventory,
        });
        return {
          success: true,
          data: response.data,
        };
      }
    } catch (error) {
      console.log(error);
    }
  },

  updateInventory: async (itemName, amount) => {
    try {
      const { authUser } = useAuthStore.getState();

      if (authUser) {
        const response = await AxiosClient.post("/inventory/update",  {itemName, amount} );
        set({
          sharedInventory: response.data.updatedInventory,
        });

        return {
          success: true,
          updatedInventory: response.data.updatedInventory,
        };
      }
    } catch (error) { 
      console.log(error);
    }
  },
}));

export default useInventoryStore;

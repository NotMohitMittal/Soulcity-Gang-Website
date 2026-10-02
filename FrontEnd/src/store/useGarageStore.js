import AxiosClient from "@/api/axios";
import { create } from "zustand";

const useGarageStore = create((set, get) => ({
  // state
  garage: [],

  // actions
  getGaragePreview: async () => {
    try {
      const response = await AxiosClient.get("/garage/preview");

      set({
        garage: response.data.vehicles,
      });

      return {
        success: true,
        vehicles: response.data.vehicles,
      };
    } catch (error) {
      console.log(error);
    }
  },

  addVehicle: async ({ vehicle_name, vehicle_owner, vehicle_class, vehicle_price, vehicle_plate, vehicle_color }) => {
    try {
      await AxiosClient.post("/garage/add/vehicle", {
        vehicle_name,
        vehicle_owner,
        vehicle_class,
        vehicle_price,
        vehicle_plate,
        vehicle_color,
      });

      return {
        success: true,
      };
    } catch (error) {
      console.log(error);
      return { success: false };
    }
  },

  deleteVehicle: async ({ vehicle_id }) => {
    try {
      await AxiosClient.post("/garage/remove/vehicle", { vehicle_id });
      return {
        success: true,
      };
    } catch (error) {
      console.log(error);
    }
  },
}));

export default useGarageStore;

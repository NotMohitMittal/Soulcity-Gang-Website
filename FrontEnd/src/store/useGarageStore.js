import AxiosClient from "@/api/axios";
import { create } from "zustand";

const useGarageStore = create((set, get) => ({
  // state
  garage: [],
  personalVehicles: [],

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

  getPersonalGarage: async () => {
    try {
      const response = await AxiosClient.get("/garage/preview/personal");

      set({
        personalVehicles: response.data.personalVehicles,
      });

      return {
        success: true,
        personalVehicles: response.data.personalVehicles,
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

  uploadVehicleImage: async (vehicle_id, file) => {
    try {
      const formData = new FormData();
      formData.append("vehicle_id", vehicle_id);
      formData.append("car_image", file);

      const response = await AxiosClient.post("/garage/model/submit", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      return {
        success: true,
        vehicle: response.data.vehicle,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: error.response?.data?.message || "Image upload failed",
      };
    }
  },
}));

export default useGarageStore;

const mongoose = require("mongoose");

const inventorySchema = mongoose.Schema(
  {
    armory: {
      weapons: {
        pistols: {
          SP45: { type: Number, default: 0 },
          X3: { type: Number, default: 0 },
          vintage: { type: Number, default: 0 },
          FNX: { type: Number, default: 0 },
          cal_50: { type: Number, default: 0 },
        },
        sub_machines: {
          MP5: { type: Number, default: 0 },
          uzi: { type: Number, default: 0 },
          Mac10: { type: Number, default: 0 },
          AP: { type: Number, default: 0 },
        },
        assault_rifles: {
          AK: { type: Number, default: 0 },
          M416: { type: Number, default: 0 },
        },
      },

      ammos: {
        pistol_ammos: { type: Number, default: 0 },
        smg_ammos: { type: Number, default: 0 },
        rifle_ammos: { type: Number, default: 0 },
      },

      armors: {
        light: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        heavy: { type: Number, default: 0 },
      },

      healings: {
        med_kits: { type: Number, default: 0 },
        bandages: { type: Number, default: 0 },
        splints: { type: Number, default: 0 },
      },
    },

    repair_kits: { type: Number, default: 0 },

    balance: {
      money: { type: Number, default: 0 },
      SVC: { type: Number, default: 0 },
      EVC: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  },
);

const inventoryModel = mongoose.model("Inventory", inventorySchema);

module.exports = inventoryModel;

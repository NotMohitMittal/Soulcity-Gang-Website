const mongoose = require("mongoose");

const garageSchema = mongoose.Schema(
  {
    vehicle_owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gang_members",
      required: true,
    },
    vehicle_name: {
      type: String,
      required: true,
      trim: true,
      uppercase : true,
    },
    vehicle_class: {
      type: String,
      enum: ["B", "A", "S", "X"],
    },
    vehicle_price: {
      type: Number,
    },
    vehicle_plate: {
      type: String,
      uppercase : true,
    },
    vehicle_color: {
      type: String,
      default: "#de425b",
    },
  },
  { timestamps: true },
);

const garageModel = mongoose.model("Garage", garageSchema);

module.exports = garageModel;

const mongoose = require("mongoose");

const situationSchema = mongoose.Schema(
  {
    situation_name: {
      type: String,
      required: true,
      trim: true,
    },
    situation_involvements: [
      {
        member_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Gang_members",
          required: true,
        },
        pov_links: {
          type: String,
          default: "",
        },
      },
    ],
  },
  { timestamps: true },
);

const situationModel = mongoose.model("Gang_situations", situationSchema);

module.exports = situationModel;

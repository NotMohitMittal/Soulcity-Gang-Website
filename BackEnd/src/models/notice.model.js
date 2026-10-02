const mongoose = require("mongoose");

const noticeSchema = mongoose.Schema(
  {
    notice_title: {
      type: String,
      uppercase: true,
      required: true,
    },
    notice_summary: {
      type: String,
      required: true,
    },
    notice_description: {
      type: String,
      required: true,
    },
    notice_author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gang_members",
      required: true,
    },
    notice_category: {
      type: String,
      enum: ["Conflict", "Air Drop", "General", "Requirement", "Tasks", "Meetings"],
      default: "General",
    },
    notice_priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Critical"],
      default: "Normal",
    },
    is_current: {
      type : Boolean,
      default : false,
    }
  },
  { timestamps: true },
);

const noticeModel = mongoose.model("Notices", noticeSchema);

module.exports = noticeModel;

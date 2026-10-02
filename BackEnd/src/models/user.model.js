const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = mongoose.Schema(
  {
    user_name: {
      type: String,
      required: true,
    },
    user_password: {
      type: String,
      required: true,
      select: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    user_email: {
      type: String,
      required: true,
      unique: true,
    },
    gang_role: {
      type: String,
      enum: ["THE BOSS", "THE UNDERBOSS/RIGHT_HAND", "ADVISOR", "CAPOS", "SOLDIER/ENFORCER", "ASSOCIATE/HANGAROUND"],
      default: "ASSOCIATE/HANGAROUND",
    },
    is_online: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// encrypting the user-password on save/first-entry only
userSchema.pre("save", async function () {
  if (!this.isModified("user_password")) {
    return;
  }
  this.user_password = await bcrypt.hash(this.user_password, 10);
});

// method to compare plain-text with cipher
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.user_password);
};

// modifying the JSON response to better outcome
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete ret.user_password;
    delete ret.__v;
    return ret;
  },
});

const userModel = mongoose.model("Gang_members", userSchema);

module.exports = userModel;

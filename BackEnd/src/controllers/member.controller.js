const userModel = require("../models/user.model");

const verifyGangMember = async (req, res) => {
  const { member_id } = req.body;

  try {
    const member = await userModel.findById(member_id);

    if (!member) {
      return res.status(401).json({
        message: "Invalid member",
      });
    }

    // This should never run, but just for extra pre-caution
    if (member.verified) {
      return res.status(400).json({
        message: "This user is already a verified gang member",
      });
    }

    member.verified = true;
    await member.save();

    res.status(200).json({
      member, // gang_member who just got verified
      message: "Member verified successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Backend error while verifying member request",
    });
  }
};

const getMemberRequest = async (req, res) => {
  try {
    const pendingMembers = await userModel.find({ verified: false });

    if (!pendingMembers) {
      return res.status(404).json({
        message: "No requests pending",
      });
    }

    res.status(200).json({
      pendingMembers,
      message: "Pending members fetched",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal database error",
    });
  }
};

const changeGangRole = async (req, res) => {
  try {
    const { member_id, new_role } = req.body;

    const user = await userModel.findById(member_id);

    if (!user) {
      return res.status(404).json({
        message: "Invalid | User not found",
      });
    }

    user.gang_role = new_role;
    await user.save();

    res.status(200).json({
      message: "Gang role updated",
      user, // name of the user who has just been changed
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while changing gang role",
    });
  }
};

const removeGangMember = async (req, res) => {
  try {
    const { member_id } = req.body;

    const user = await userModel.findById(member_id);

    if (!user) {
      return res.status(404).json({
        message: "Invalid | User not found",
      });
    }

    user.verified = false;
    await user.save();

    res.status(200).json({
      message: "Gang member has been kicked",
      user, // name of the user how just got kicked
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error, while removing gang member",
    });
  }
};

const getAuthorizedMembers = async (req, res) => {
  try {
    const authorizedMembers = await userModel.find({ verified: true });

    if (!authorizedMembers) {
      return res.status(404).json({
        message: "No authorized members, yet",
      });
    }

    res.status(200).json({
      message: "Members founds",
      authorizedMembers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while getting authorized members",
    });
  }
};

const rejectMemberRequest = async (req, res) => {
  try {
    const { member_id } = req.body;
    const user = await userModel.findByIdAndDelete(member_id);

    if (!user) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request denied and deleted", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting request" });
  }
};

module.exports = {
  verifyGangMember,
  getMemberRequest,
  changeGangRole,
  removeGangMember,
  getAuthorizedMembers,
  rejectMemberRequest,
};

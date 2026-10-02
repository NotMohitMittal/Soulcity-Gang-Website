const noticeModel = require("../models/notice.model");
const userModel = require("../models/user.model");

const createNotice = async (req, res) => {
  try {
    const { notice_title, notice_summary, notice_description, notice_category, notice_priority } = req.body;

    const createdNotice = await noticeModel.create({
      notice_title,
      notice_summary,
      notice_description,
      notice_category,
      notice_author: req.user.id,
      notice_priority,
    });

    res.status(201).json({
      message: "Notice created successfully",
      createdNotice,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error | During creating notice",
    });
  }
};

const getNotices = async (req, res) => {
  try {
    const notices = await noticeModel.find().sort({ createdAt: -1 }).populate("notice_author", "user_name gang_role");

    if (notices.length === 0) {
      return res.status(404).json({
        message: "No notices created yet",
      });
    }

    res.status(200).json({
      message: "Notices fetched",
      notices,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error | During fetching notice",
    });
  }
};

const updateNotice = async (req, res) => {
  try {
    const { notice_id, notice_title, notice_summary, notice_description, notice_category, notice_priority } = req.body;

    const valuesToUpdate = {};

    if (notice_title) valuesToUpdate.notice_title = notice_title;
    if (notice_summary) valuesToUpdate.notice_summary = notice_summary;
    if (notice_description) valuesToUpdate.notice_description = notice_description;
    if (notice_category) valuesToUpdate.notice_category = notice_category;
    if (notice_priority) valuesToUpdate.notice_priority = notice_priority;

    if (Object.keys(valuesToUpdate).length === 0) {
      return res.status(400).json({
        message: "No fields provided to update",
      });
    }

    const updatedNotice = await noticeModel.findByIdAndUpdate(notice_id, valuesToUpdate, {
      returnDocument: "after",
      runValidators: true,
    });

    if (!updatedNotice) {
      return res.status(404).json({
        message: "Unable to find the notice",
      });
    }

    res.status(200).json({
      message: "Notice updated successfully",
      updatedNotice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error while updating notice",
    });
  }
};

const deleteNotice = async (req, res) => {
  try {
    const { notice_id } = req.body;

    const deletedNotice = await noticeModel.findByIdAndDelete(notice_id);

    if (!deletedNotice) {
      return res.status(404).json({
        message: "Unable to find the notice to delete",
      });
    }

    res.status(200).json({
      message: "Notice deleted",
      deletedNotice,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error | During the deletion of Notice,",
    });
  }
};

const setCurrentNotice = async (req, res) => {
  const { notice_id } = req.body;

  try {
    const notice = await noticeModel.findById(notice_id);

    if (!notice) {
      return res.status(404).json({
        message: "Notice not found",
      });
    }

    // Only one notice can be "current" at a time
    await noticeModel.updateMany({ is_current: true }, { is_current: false });

    notice.is_current = true;
    await notice.save();

    res.status(200).json({
      message: "Current notice updated",
      currentNotice: notice,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while setting the current notice",
    });
  }
};

module.exports = { createNotice, getNotices, updateNotice, deleteNotice, setCurrentNotice };

const express = require("express");
const { body } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware.js");
const noticeController = require("../controllers/notice.controller.js");

const router = express.Router();

// make all the method ["GET", "POST", "PATCH", "DELETE"]

router.post(
  "/create",
  authMiddleware.checkUserLogin,
  [
    body("notice_title").notEmpty().withMessage("Notice title is required"),
    body("notice_summary").notEmpty().withMessage("Notice summary is required"),
    body("notice_description").notEmpty().withMessage("Notice description is required"),
    body("notice_category")
      .notEmpty()
      .withMessage("Notice category is required")
      .isIn(["Conflict", "Air Drop", "General", "Requirement", "Tasks", "Meetings"])
      .withMessage("Invalid category"),
    body("notice_priority")
      .notEmpty()
      .withMessage("Notice priority is required")
      .isIn(["Low", "Normal", "High", "Critical"])
      .withMessage("Invalid priority type"),
  ],
  authMiddleware.validateUserInput,
  authMiddleware.checkLeaderPrivilege,
  noticeController.createNotice,
);

router.get("/show", authMiddleware.checkUserLogin, noticeController.getNotices);

router.patch(
  "/update",
  authMiddleware.checkUserLogin,
  [
    body("notice_id").notEmpty().withMessage("Notice Id is required").isMongoId().withMessage("Invalid notice Id"),

    body("notice_title").optional().isString().withMessage("Title must be a string"),
    body("notice_summary").optional().isString().withMessage("Summary must be a string"),
    body("notice_description").optional().isString().withMessage("Description must be a string"),
    body("notice_category")
      .optional()
      .isIn(["Conflict", "Air Drop", "General", "Requirement", "Tasks", "Meetings"])
      .withMessage("Invalid category"),
    body("notice_priority").optional().isIn(["Low", "Normal", "High", "Critical"]).withMessage("Invalid priority type"),
  ],
  authMiddleware.validateUserInput,
  authMiddleware.checkLeaderPrivilege,
  noticeController.updateNotice,
);

router.delete(
  "/remove",
  authMiddleware.checkUserLogin,
  [body("notice_id").notEmpty().withMessage("Notice Id is required").isMongoId().withMessage("Invalid Notice Id")],
  authMiddleware.validateUserInput,
  authMiddleware.checkLeaderPrivilege,
  noticeController.deleteNotice,
);

router.patch(
  "/set-current",
  authMiddleware.checkUserLogin,
  [body("notice_id").notEmpty().withMessage("Notice Id is required").isMongoId().withMessage("Invalid notice Id")],
  authMiddleware.validateUserInput,
  authMiddleware.checkLeaderPrivilege,
  noticeController.setCurrentNotice,
);

module.exports = router;

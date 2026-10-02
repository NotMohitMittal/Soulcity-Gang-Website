const express = require("express");
const { body } = require("express-validator");

const authMiddleware = require("../middlewares/auth.middleware.js");
const memberController = require("../controllers/member.controller.js");

const router = express.Router();

router.get(
  "/requests",
  authMiddleware.checkUserLogin,
  authMiddleware.checkLeaderPrivilege,
  memberController.getMemberRequest,
);

router.get(
  "/authorized",
  // authMiddleware.checkUserLogin,
  memberController.getAuthorizedMembers,
);

router.post(
  "/verify",
  [body("member_id").notEmpty().withMessage("Member's Id is required")],
  authMiddleware.checkUserLogin,
  authMiddleware.checkLeaderPrivilege,
  memberController.verifyGangMember,
);

router.post(
  "/change/role",
  [
    body("member_id").notEmpty().withMessage("Member's Id is required"),
    body("new_role").notEmpty().withMessage("New role can't be empty"),
  ],
  authMiddleware.checkUserLogin,
  authMiddleware.checkLeaderPrivilege,
  memberController.changeGangRole,
);


// delete a gang member
router.post(
  "/remove/role",
  [body("member_id").notEmpty().withMessage("Member's Id is required")],
  authMiddleware.checkUserLogin,
  authMiddleware.checkLeaderPrivilege,
  memberController.removeGangMember,
);


router.post(
  "/reject",
  [body("member_id").notEmpty().withMessage("Member's Id is required")],
  authMiddleware.checkUserLogin,
  authMiddleware.checkLeaderPrivilege,
  memberController.rejectMemberRequest
);




module.exports = router;

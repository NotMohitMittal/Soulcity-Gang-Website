const multer = require("multer");
const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const authController = require("../controllers/user.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");


const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

// To register new user
router.post(
  "/register",
  [
    body("user_name").trim().notEmpty().withMessage("UserName is required"),
    body("user_email").trim().isEmail().withMessage("Valid email is required"),
    body("user_password").trim().isLength({ min: 6 }).withMessage("UserPassword must be at least 6 characters"),
  ],
  authMiddleware.validateUserInput,
  authController.registerUser,
);

// To login the user
router.post(
  "/login",
  [
    body("user_email").trim().isEmail().withMessage("Valid email is required"),
    body("user_password").trim().isLength({ min: 6 }).withMessage("UserPassword must be at least 6 characters"),
  ],
  authMiddleware.validateUserInput,
  authController.loginUser,
);

router.get("/validate/login", authMiddleware.checkUserLogin, authController.validateLogin);

// To logout the user
router.get("/logout", authController.logoutUser);

// To toggle online/offline
router.patch("/toggle_online", authMiddleware.checkUserLogin, authController.toggleOnline);

// To upload/update profile image
router.post(
  "/upload-profile-pic",
  authMiddleware.checkUserLogin,
  upload.single("profile_image"),
  authController.uploadProfilePicture,
);

module.exports = router;

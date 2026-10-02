const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const authController = require("../controllers/user.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

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

router.patch("/toggle_online", authMiddleware.checkUserLogin, authController.toggleOnline)

module.exports = router;

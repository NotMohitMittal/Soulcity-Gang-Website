const jwt = require("jsonwebtoken");

const { validationResult } = require("express-validator");
const userModel = require("../models/user.model");

const validateUserInput = (req, res, next) => {
  const error = validationResult(req);

  if (!error.isEmpty()) {
    return res.status(400).json({
      errors: error.array(),
    });
  }

  next();
};

const checkUserLogin = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Authentication token missing",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await userModel.findById(decoded.id);

    if (!user || !user.verified) {
      return res.status(403).json({
        message: "Access denied. Gang joining pending or member removed.",
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    console.log(error); // this is showing the terminal, but it's been handled i am confused weather to put it or not
    res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

const checkLeaderPrivilege = async (req, res, next) => {
  try {
    const leaderRoles = ["THE BOSS", "THE UNDERBOSS/RIGHT_HAND"];

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        message: "Invalid | User not found",
      });
    }

    if (leaderRoles.includes(user.gang_role) && user.verified) {
      return next();
    }

    res.status(403).json({
      message: "Access denied. This action required Leader privileges",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error while checking for privileges",
    });
  }
};







module.exports = { validateUserInput, checkUserLogin, checkLeaderPrivilege};

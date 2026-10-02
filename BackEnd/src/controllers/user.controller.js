const userModel = require("../models/user.model");

const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  const { user_name, user_password, user_email } = req.body;

  try {
    const existingUser = await userModel.findOne({ user_email });

    if (existingUser) {
      return res.status(401).json({
        message: "Existing user",
      });
    }

    const user = await userModel.create({
      user_name,
      user_password,
      user_email,
    });

    res.status(201).json({
      message: "User created successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

const loginUser = async (req, res) => {
  const { user_email, user_password } = req.body;

  try {
    const user = await userModel.findOne({ user_email }).select("+user_password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(user_password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error",
    });
  }
};

const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    res.status(200).json({
      message: "User logged-out successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to logout",
    });
  }
};

// checks for the token and it's expiry for the user to login
const validateLogin = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select("-user_password");

    if (!user) {
      return res.status(401).json({
        isAuthorized: false,
        message: "Token expires or unauthorized",
      });
    }

    return res.status(200).json({
      isAuthorized: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      isAuthorized: false,
      message: "Failed to validate login",
    });
  }
};

const toggleOnline = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized user",
      });
    }

    user.is_online = true;
    await user.save();

    res.status(200).json({
      message: "Value updated",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error | During online toggle",
    });
  }
};

module.exports = { registerUser, loginUser, logoutUser, validateLogin, toggleOnline };

const garageModel = require("../models/garage.model");
const userModel = require("../models/user.model");
const imagekit = require("../services/imageKit.service");

const previewGarage = async (req, res) => {
  try {
    const vehicles = await garageModel.find().populate("vehicle_owner", "user_name gang_role");

    res.status(200).json({
      message: vehicles.length === 0 ? "Garage is empty" : "Vehicles fetched",
      vehicles,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error, while fetching garage vehicles",
    });
  }
};

const addVehicle = async (req, res) => {
  const { vehicle_owner, vehicle_name, vehicle_class, vehicle_price, vehicle_plate, vehicle_color } = req.body;

  try {
    const privilegedRoles = ["THE BOSS", "THE UNDERBOSS/RIGHT_HAND"];
    const requestingUser = await userModel.findById(req.user.id);

    if (!requestingUser) {
      return res.status(404).json({
        message: "Invalid | User not found",
      });
    }

    const isPrivileged = privilegedRoles.includes(requestingUser.gang_role);
    const finalOwner = isPrivileged ? vehicle_owner : requestingUser._id;

    const garage = await garageModel.create({
      vehicle_owner: finalOwner,
      vehicle_name,
      vehicle_class,
      vehicle_price,
      vehicle_plate,
      vehicle_color,
    });

    res.status(201).json({
      message: "Vehicle added to garage",
      garage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Error, while adding vehicle to garage",
    });
  }
};
const removeVehicle = async (req, res) => {
  try {
    const { vehicle_id } = req.body;

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized | Token not found",
      });
    }

    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "Invalid | User not found ",
      });
    }

    const vehicle = await garageModel.findById(vehicle_id);

    if (!vehicle) {
      return res.status(404).json({
        message: "Invalid | Vehicle not found",
      });
    }

    const certifiedOwner = vehicle.vehicle_owner.equals(user._id);
    const privilegedRoles = ["THE BOSS", "THE UNDERBOSS/RIGHT_HAND"];

    if (privilegedRoles.includes(user.gang_role) || certifiedOwner) {
      const deletedVehicle = await garageModel.findByIdAndDelete(vehicle_id); // this is sure of happen cause we have checked the vehicle_id previous so no need to add the if(!garage)

      return res.status(200).json({
        message: "Vehicle removed from garage",
        deletedVehicle,
      });
    }

    res.status(403).json({
      message: "Access denied | You don't own the vehicle",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Error, while deleting the vehicle",
    });
  }
};

// this wasn't required because you could have matched the value of the vehicle_owner_id from the garageDB and and logged-in user_id from the frontend itself -> But since too much time has been invested on this, that's why we are keeping this
const previewPersonalGarage = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized | User not found",
      });
    }

    const personalVehicles = await garageModel.find({ vehicle_owner: user });

    if (!personalVehicles) {
      return res.status(404).json({
        message: "No personal vehicle found in your garage",
        personalVehicles: [],
      });
    }

    res.status(200).json({
      message: "Personal vehicles fetched",
      personalVehicles,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error while fetching personal garage",
    });
  }
};

const getCarModel = async (req, res) => {
  try {
    // 1. Require the exact vehicle ID, not the name
    const { vehicle_id } = req.body;
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!req.file || !vehicle_id) {
      return res.status(400).json({
        message: "Vehicle ID and image file are required",
      });
    }

    const fileBase64 = req.file.buffer.toString("base64");

    const uploadResponse = await imagekit.upload({
      file: fileBase64,
      fileName: `car_${vehicle_id}_${Date.now()}.jpg`,
      folder: "/car_models",
    });

    // 2. Find by unique vehicle_id AND confirm the logged-in user owns it
    const updateGarage = await garageModel.findOneAndUpdate(
      {
        _id: vehicle_id,
        vehicle_owner: req.user.id,
      },
      {
        image_url: uploadResponse.url,
        file_id: uploadResponse.fileId,
      },
      {
        returnDocument: "after",
      },
    );

    if (!updateGarage) {
      return res.status(404).json({
        message: "Vehicle not found or you do not have permission to modify it",
      });
    }

    res.status(200).json({
      message: "Car image updated successfully",
      vehicle: updateGarage,
    });
  } catch (error) {
    console.error("Error uploading car image:", error);
    res.status(500).json({
      message: "Server error during car image upload",
    });
  }
};

module.exports = { previewGarage, addVehicle, removeVehicle, previewPersonalGarage, getCarModel };

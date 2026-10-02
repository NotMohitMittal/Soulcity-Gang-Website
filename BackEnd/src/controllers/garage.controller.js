const garageModel = require("../models/garage.model");
const userModel = require("../models/user.model");

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

module.exports = { previewGarage, addVehicle, removeVehicle };

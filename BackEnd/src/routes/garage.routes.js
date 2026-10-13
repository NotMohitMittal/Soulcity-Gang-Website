const multer = require("multer");
const express = require("express");
const { body } = require("express-validator");

const garageController = require("../controllers/garage.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

router.get("/preview", garageController.previewGarage);
router.get("/preview/personal", authMiddleware.checkUserLogin, garageController.previewPersonalGarage);

router.post(
  "/add/vehicle",
  [
    body("vehicle_name").notEmpty().withMessage("Vehicle name is required"),
    body("vehicle_price").notEmpty().withMessage("Vehicle price is required"),
    body("vehicle_class")
      .notEmpty()
      .withMessage("Vehicle Type is required")
      .isIn(["B", "A", "S", "X"])
      .withMessage("Vehicle type must be among the given classes"),
    body("vehicle_owner")
      .notEmpty()
      .withMessage("Vehicle owner is required")
      .isMongoId()
      .withMessage("Invalid owner ID"),
    body("vehicle_plate").notEmpty().withMessage("Vehicle plate is required"),
    body("vehicle_color").optional().isHexColor().withMessage("Vehicle color must be a valid hex color"),
  ],
  authMiddleware.validateUserInput,
  authMiddleware.checkUserLogin,
  garageController.addVehicle,
);

router.post(
  "/remove/vehicle",
  [body("vehicle_id").notEmpty().withMessage("Vehicle ID is required").isMongoId().withMessage("Invalid MongooseID")],
  authMiddleware.validateUserInput,
  authMiddleware.checkUserLogin,
  garageController.removeVehicle,
);

router.post(
  "/model/submit",
  authMiddleware.checkUserLogin,
  [body("vehicle_id").notEmpty().withMessage("Vehicle name is required").isMongoId().withMessage("Invalid MongooseID")],
  upload.single("car_image"),
  garageController.getCarModel,
);

module.exports = router;

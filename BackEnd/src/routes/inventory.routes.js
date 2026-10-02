const express = require("express");
const { body } = require("express-validator");

const inventoryController = require("../controllers/inventory.controller.js");
const authMiddleware = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.get("/details", authMiddleware.checkUserLogin, inventoryController.getInventoryDetails);

router.post(
  "/update",
  [
    body("itemName").notEmpty().withMessage("Item path is required"),
    body("amount").isInt().withMessage("Amount is required"),
  ],
  authMiddleware.checkUserLogin,
  inventoryController.updateInventory,
);

module.exports = router;

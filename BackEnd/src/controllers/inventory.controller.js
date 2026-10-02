const inventoryModel = require("../models/inventory.model.js");

const getInventoryDetails = async (req, res) => {
  try {
    let inventory = await inventoryModel.findOne();

    if (!inventory) {
      console.log("Creating initial shared inventory");
      inventory = await inventoryModel.create({});
    }

    res.status(200).json({
      inventory,
      message: "Inventory details fetched",
    });
  } catch (error) {
    res.status(500).json({
      message: "Database error while fetching inventory",
    });
  }
};

const updateInventory = async (req, res) => {
  const { itemName, amount } = req.body;

  const itemPath = itemDictionary[itemName];

  try {
    const updatedInventory = await inventoryModel.findOneAndUpdate(
      {},
      {
        $inc: {
          [itemPath]: amount,
        },
      },
      { returnDocument: "after" },
    );

    if (!updateInventory) {
      return res.status(404).json({
        message: "Unable to find the updated inventory",
      });
    }

    res.status(200).json({
      updatedInventory,
      message: "Inventory updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Database error while updating inventory",
    });
  }
};





const itemDictionary = {
  // Pistols
  SP45: "armory.weapons.pistols.SP45",
  X3: "armory.weapons.pistols.X3",
  vintage: "armory.weapons.pistols.vintage",
  FNX: "armory.weapons.pistols.FNX",
  cal_50: "armory.weapons.pistols.cal_50",

  // Assault-rifles
  AK: "armory.weapons.assault_rifles.AK",
  M416: "armory.weapons.assault_rifles.M416",

  // Sub-machine guns
  MP5: "armory.weapons.sub_machines.MP5",
  AP: "armory.weapons.sub_machines.AP",
  Mac10: "armory.weapons.sub_machines.Mac10",
  uzi: "armory.weapons.sub_machines.uzi",

  // Ammo
  pistol_ammo: "armory.ammos.pistol_ammos",
  rifle_ammo: "armory.ammos.rifle_ammos",
  smg_ammo: "armory.ammos.smg_ammos",

  // Healing
  med_kit: "armory.healings.med_kits",
  bandage: "armory.healings.bandages",
  splint: "armory.healings.splints",

  // Armors
  light_armor: "armory.armors.light",
  medium_armor: "armory.armors.medium",
  heavy_armor: "armory.armors.heavy",

  // Economy
  money: "balance.money",
  SVC: "balance.SVC",
  EVC: "balance.EVC",
  repair_kit: "repair_kits",
};

module.exports = { getInventoryDetails, updateInventory };

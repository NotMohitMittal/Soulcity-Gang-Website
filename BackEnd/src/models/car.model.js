const mongoose = require("mongoose")

const carModelSchema = mongoose.Schema({
  
})


const carModel = mongoose.model("Car_model", carModelSchema)

module.exports = carModel;
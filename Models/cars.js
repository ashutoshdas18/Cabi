const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    carId:String
})

module.exports=mongoose.model('cars',carSchema);
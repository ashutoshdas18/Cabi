var mongoose=require("mongoose");

var vehicleSchema=new mongoose.Schema({
    name:String,
    image:String,
    vehicleno:String,
    price:String,
    description:String
    
});
module.exports=mongoose.model("vehicle",vehicleSchema);
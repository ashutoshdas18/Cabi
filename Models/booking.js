var mongoose=require("mongoose");

var bookingSchema=new mongoose.Schema({
    pickup:String,
    return1:String,
    pickupdate:String,
    returndate:String,
    pickuptime:String,
    vehicleId : String,
    userName:String
});
module.exports=mongoose.model("booking",bookingSchema);
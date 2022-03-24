var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var UserSchema=new mongoose.Schema({
        username:String,
        password:String,
        gender:String,
        mobileno:String,
        DLno:String,
        car:[]
})
var adminSchema = new mongoose.Schema({
        username:String,
        password:String
})

UserSchema.plugin(passportLocalMongoose);
adminSchema.plugin(passportLocalMongoose);


module.exports={
        User:mongoose.model("User",UserSchema),
        Admin:mongoose.model("Admin",adminSchema)
} 
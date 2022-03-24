var express=require('express');
var app=express();
const port=process.env.PORT||3000;
var ejs=require('ejs');
var bodyParser=require("body-parser");
var mongoose=require("mongoose");
var passport=require("passport");
var LocalStrategy=require("passport-local");
mongoose.connect("mongodb://127.0.0.1:27017/vehicle_rental"); 
var vehicle=require("./models/vehicle");
const {User,Admin} =require("./models/user");
const carsTaken = require('./models/cars')
var booking=require("./models/booking");
const user = require('./models/user');
// var seedDB=require("./seeds");
var id = "";

//seedDB();
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine','ejs');
app.use(express.static(__dirname +"/public"));

//passport configuration
app.use(require("express-session")({
    secret:"rusty is the cuttest dog",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use("user",new LocalStrategy(User.authenticate()));
passport.use("admin",new LocalStrategy(Admin.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use(function(req,res,next){
    res.locals.currentUser=req.user;
      next();
});



app.get("/",function(req,res){
   res.render('landing');
});

// INDEX-show all vehicles
app.get("/vehicles",isLoggedin,async function(req,res){
    //Get all vehicles from DB
    var takenVehicles = [];
    var remaining=[];
    const cars =await carsTaken.find({})
    cars.forEach(e=>{
        takenVehicles.push(e.carId)
    })
     vehicle.find({},function(err,allvehicles){
         if(err){
             console.log(err);
         }else{
             allvehicles.forEach(e=>{
                
                 if(!takenVehicles.includes(e.id))
                 {
                    remaining.push(e)
                 }
             })
             res.render('index',{vehicles:remaining,currentuser:req.user});
         }
     });
});

//CREATE-Add new vehicle to database
app.post("/vehicles", function(req,res){
   //get data from form and add to vehicle array
   var name=req.body.name;
   var image=req.body.image;
   var vehicleno=req.body.vehicleno;
   var price=req.body.price;
   var description=req.body.description;
   var newvehicle={name:name,image:image,vehicleno:vehicleno,price:price,description:description}
   //Create a new vehicle and save to database
    vehicle.create(newvehicle,function(err,newlyCreated){
          if(err){
              console.log(err)
          }else{
               //redirect back to vehicle page
                res.redirect('/vehicles');
               }
    });
});

//NEW- show form to create new vehicle
app.get("/vehicles/new", function(req,res){
     res.render('new');
});


//SHOW-shows more info about one vehicle
app.get("/vehicles/:id", function(req,res){
      //Find the route with provided ID
      vehicle.findById(req.params.id, function(err,foundvehicle){
            if(err){
                console.log(err);
            }else{
                //render show template with that vehicle
                res.render('show', {vehicle: foundvehicle});
            }
      });
});

app.get("/adminpage",function(req,res){
    res.render("adminpage");
});

//============
//Auth Routes
//============
//User Login

app.get("/register",function(req,res){
    res.render("register");
});

//handle sign up logic
app.post("/register",function(req,res){
    var newUser=new User({username:req.body.username,gender:req.body.gender,mobileno:req.body.mobileno,DLno:req.body.DLno});
    User.register(newUser, req.body.password, function(err,user){
        if(err){
            console.log(err);
            return res.render("register");
        }
          passport.authenticate("user")(req,res,function(){
               res.redirect("/");
          });
    });
});

//Login routes
app.get("/login",function(req,res){
    res.render("login");
});

app.post("/login",passport.authenticate("user",
   {
      successRedirect:"/",
      failureRedirect:"/login"
   }) ,function(req,res){
      
});

//Logout routes
app.get("/logout",function(req,res){
   req.logout();
   res.redirect("/");
});

//Admin Register
app.get("/adminregister",function(req,res){
    res.render("adminregister");
});
app.post("/adminregister",function(req,res){
    var newAdmin=new Admin({username:req.body.username});
    Admin.register(newAdmin, req.body.password, function(err,admin){
        if(err){
            console.log(err);
            return res.render("adminregister");
        }
          passport.authenticate("admin")(req,res,function(){
               res.redirect("/adminlogin");
          });
    });
});

//Admin Login
app.get("/adminlogin",function(req,res){
    res.render("adminlogin")
});

app.post("/adminlogin",passport.authenticate("admin",
{
   successRedirect:"/adminpage",
   failureRedirect:"/adminlogin"
}) ,function(req,res){
   
});

// ==============
// Booking Route
// ==============

app.get("/vehicles/:id/booking",isLoggedin, function(req,res){
    res.render("bookings",{vehicle:req.params.id});
});

app.post("/vehicles/:id/bookings",function(req,res){
    carsTaken.create({carId:req.params.id})
    var pickup=req.body.pickup;
    var return1=req.body.return;
    var pickupdate=req.body.pickupdate;
    var returndate=req.body.returndate;
    var pickuptime=req.body.pickuptime; 
    var vehicleId = req.params.id;
    var userName = req.user.username;
    var bookings={pickup:pickup,return1:return1,pickupdate:pickupdate,returndate:returndate,pickuptime:pickuptime,vehicleId:vehicleId,userName:userName}
       booking.create(bookings,function(err,newbooking){
        if(err){
            console.log(err)
        }else{
            id=newbooking.id;
            res.redirect("/bookingconfirm");
             }
  });
});
app.get("/bookingconfirm",function(req,res){
    booking.findById(id,function(err,mybookings){
        if(err){
            console.log(err)
        }else{
            res.render("bookingconfirm",{booking:mybookings});
        }
    });
    
});
app.get("/allbookings",function(req,res){
    booking.find({userName:req.user.username}).then(user=>{
        res.render("allbookings",{booking:user});
    }).catch(e=>{
        console.log(e)
    })
});

app.get("/about",function(req,res){
    res.render("about")
})

app.post('/cancel/:id',(req,res)=>{
    User.findOne({username:req.user.username}).then(user=>{
        console.log()
        const car = user.car.indexOf(req.params.id);
        user.car.splice(car,1);
        user.save();
    });
    carsTaken.findOne({carId:req.params.id}).then(car=>{
        car.remove();
    })
    booking.findOne({userName:req.user.username,vehicleId:req.params.id}).then(user=>{
        user.remove();
    }).then(res.redirect('/allbookings'))

})





function isLoggedin(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }
    
    res.redirect("/login");
    
}

app.listen(port,function(){
    console.log("The vehicle rental server started");
});


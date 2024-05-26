const port=5001;
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const jwt=require("jsonwebtoken");
const cors=require("cors");
const path=require("path");
const asyncHandler=require("express-async-handler")

app.use(express.json());
app.use(cors());

// database connection with mongodb

mongoose.connect("mongodb+srv://bharath21903:02061999@cluster0.hkawlfi.mongodb.net/e-commerce");

// api creation

app.get("/",(req,res)=>{
    res.send("App is Running")
})

// create user schema
const Users=mongoose.model("Users",{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    
    date:{
        type:Date,
        default:Date.now,
    },
})

// creating endpoint for user register

app.post("/signup",async(req,res)=>{
    let userCheck=await Users.findOne({email:req.body.email})
    if(userCheck){
        return res.status(400).json({success:false,errors:"existing user found with same email id"})
    }
   
    const user =new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        
    });
    await user.save();

    const data={
        user:{
            id:user.id
        }
    }

    const token=jwt.sign(data,"secret_token");
    res.json({token})

})

// token validation

const validateToken=asyncHandler(async(req,res,next)=>{
    let token;
    let authHeader=req.headers.Authorization || req.headers.authorization
    if(authHeader && authHeader.startsWith("Bearer")){
      token=authHeader.split(" ")[1];
      jwt.verify(token,"secret_token",(err,decoded)=>{
        if(err){
            res.status(401);
            res.json({message:"user is not Authoorized"})
        }
        req.user=decoded.user
        next()
      })
    }
})

// create end point for login in

app.post("/login",async(req,res)=>{
    let user=await Users.findOne({email:req.body.email});
    if(user){
        const passwordCheck=req.body.password === user.password;
        if(passwordCheck){
            const data={
                user:{
                    id:user.id
                }
            }
            const token=jwt.sign(data,"secret_token");
            res.json({token})
            
        }else{
            res.json({success:false,error:"wrong password"});
        }
    }else{
        res.json({error:"wrong email id"});
    }
})

// getUserDetails

app.get("/users",async(req,res)=>{
    const user= await Users.find({})
    res.send(user)
})

app.listen(port,(error)=>{
    if(!error){
     console.log("Server running on port "+port)
    }else{
     console.log("Error: "+port)
    }
 })
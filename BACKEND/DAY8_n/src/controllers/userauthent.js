const User=require("../models/user")
const validate=require('../utils/validator')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();
// const redisclient=require("./config/redis")
const redisclient=require("../config/redis")
// const redis=require("redis");
// const redisauth=require("../middleware/redisauth")
const Sumbit=require("../models/sumbission");
const register= async(req,res)=>{

    try{
            // console.log("Register fn:", register);  
        validate(req.body);
          console.log("Register fn:");    
        const {firstname,emailId,password}=req.body;
           const hashpass=await bcrypt.hash(password,10);
            const user = await User.create({
                firstname,
                emailId,
                password:hashpass,
                role:'user'
    });


           const token=jwt.sign({emailId,id:user._id,role:"user"},process.env.SECRETKEY,{expiresIn:60*60});
           res.cookie("token",token,{maxAge:60*60*1000});
        const reply={firstname:user.firstname,emailId:user.emailId,id:user._id}
         console.log("Register fn:");    
    res.status(200).json({
        user:reply,
        message:"Login Sucessfully",
    })

       

    }
     catch(err){
        res.send("Error Occured in register:"+err.message);
     }
     
     


}
const login=async(req,res)=>{
    const{password,emailId}=req.body;
    try{
    if(!emailId){
        throw new Error("Invalid Credentials");
    }
    if(!password){
        throw new Error("Invalid Credentials ");
    }
   const pepole=await User.findOne({emailId});
   
  const match= await bcrypt.compare(password,pepole.password);
  if(!match){
    throw new Error("Invalid Credential");
  }
    const token=jwt.sign({emailId:emailId,id:pepole._id,role:pepole.role},process.env.SECRETKEY,{expiresIn:60*60});
 res.cookie("token",token,{maxAge:60*60*1000});

 const reply={firstname:pepole.firstname,emailId:pepole.emailId,id:pepole._id,  role: pepole.role}
   res.status(200).json({
        user:reply,
         
      message:"Login Sucessfully",
  })
    }
    catch(err){
        res.send("Error:"+err.message);
    }
}

const logout=(async(req,res)=>{
    try{
        const {token}=req.cookies;
        const payload=jwt.decode(token);

        await redisclient.set(`token:${token}`,"Blocked");
        
        await redisclient.expireAt(`token:${token}`,payload.exp)
        res.cookie("token",null,{expires: new Date(Date.now())});
        res.send("Logout Succesfully");
    }
    catch(err){
        res.send("Error Occured:"+err.message);
    }
})




const adminregister=async(req,res)=>{
    
    try{
            console.log("Register fn:", register);  
        validate(req.body);
        const {firstname,emailId,password}=req.body;
           const hashpass=await bcrypt.hash(password,10);
            const user = await User.create({
                firstname,
                emailId,
                password:hashpass,
                role:'admin'
    });


           const token=jwt.sign({emailId,id:user._id},process.env.SECRETKEY,{expiresIn:60*60});
           res.cookie("token",token,{maxAge:60*60*1000});
           res.send("User register Succesfully");
       

    }
     catch(err){
        res.send("Error Occured in register:"+err.message);
     }
     
     


}
const deleteprofile=async(req,res)=>{
    try{
        const userId=req.result?._id;
        await User.findByIdAndDelete(userId);
        
        await Sumbit.deleteMany({userId});
        res.status(200).send("Delete Sucessfully");

    }
    catch(err){
        res.send("Server Error");
    }

}
module.exports={register,login,logout,adminregister,deleteprofile};

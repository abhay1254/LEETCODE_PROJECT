const jwt=require("jsonwebtoken");
require("dotenv").config();
const redisclient=require("../config/redis");

const User=require("../models/user")
const admin=async(req,res,next)=>{
    try{
        const {token}=req.cookies;
        if(!token){
            throw new Error("Token is not present ");
        }
        const payload=jwt.verify(token,process.env.SECRETKEY);
    

        if(payload.role!="admin"){
            throw new Error("Invalid User no permission of admin ");

        }
            const {id}=payload;
        if(!id){
            throw new Error("Invalid Tokens");
        }
        const result=await User.findById(id);
        if(!result){
            throw new Error("User doesn't exist ");

        }

        const isblocked=await redisclient.exists(`token:${token}`);
        if(isblocked){
            throw new Error("Invalid Token ")
        }
        req.result=result;
        next();


    }
    catch(err){
        res.send("Error: "+err.message);
    }



}
module.exports=admin;

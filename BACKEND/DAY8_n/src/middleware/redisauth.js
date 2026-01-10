const jwt=require("jsonwebtoken");
require("dotenv").config();
const redisclient=require("../config/redis");

const User=require("../models/user")
const redisauth = async(req, res, next) => {
    try {
        const {token} = req.cookies;
        if(!token) {
            throw new Error("Token is not present");
        }
        const payload = jwt.verify(token, process.env.SECRETKEY);
        const {id} = payload;
        if(!id) {
            throw new Error("Invalid Tokens");
        }
        const result = await User.findById(id);
        if(!result) {
            throw new Error("User doesn't exist");
        }

        const isblocked = await redisclient.exists(`token:${token}`);
        if(isblocked) {
            throw new Error("Invalid Token");
        }
        
        req.result = result;
        req.userId = result._id; // ✅ ADD THIS LINE
        // console.log(`User authenticated: ${result.firstname} (${result._id})`);
        next();
    }
    catch(err) {
        res.status(401).json({
            success: false,
            message: "Authentication failed: " + err.message
        });
    }
}
module.exports = redisauth;
const express=require("express");
const redisauth = require("../middleware/redisauth");
const sumbitRouter=express.Router();
const {usersumbission,runproblem}=require("../controllers/usersumbission");

sumbitRouter.post("/Sumbit/:id",redisauth,usersumbission);
sumbitRouter.post("/run/:id",redisauth,runproblem);
module.exports=sumbitRouter;
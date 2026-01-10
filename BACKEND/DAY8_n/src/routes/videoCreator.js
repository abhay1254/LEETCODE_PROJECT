const express = require('express');
// const adminMiddleware = require('../middleware/adminMiddleware')
// ;
const admin=require("../middleware/admin");
const videoRouter =  express.Router();
const {generateUploadSignature,saveVideoMetadata,deleteVideo} = require("../controllers/videoSection")

videoRouter.get("/create/:problemId",admin,generateUploadSignature);
videoRouter.post("/save",admin,saveVideoMetadata);
videoRouter.delete("/delete/:problemId",admin,deleteVideo);


module.exports = videoRouter;
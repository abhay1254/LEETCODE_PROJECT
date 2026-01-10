const express=require("express");
const problemRouter=express.Router();
const admin=require("../middleware/admin");
const {createProblem,sumbitproblem,updateproblem,deleteProblem,getProblemById,getAllProblem,solvedallproblem,getTopUsers,searchProblems,dislikeProblem,likeProblem,markProblemSolved}=require("../controllers/userproblem")
const redisauth=require("../middleware/redisauth")
problemRouter.post("/create",admin,createProblem);
problemRouter.put("/update/:id",admin,updateproblem);
problemRouter.delete("/delete/:id",admin,deleteProblem);
problemRouter.get("/problemsolvebyuser",redisauth,solvedallproblem);
problemRouter.get("/:id",redisauth,getProblemById);
problemRouter.get("/",redisauth,getAllProblem);
problemRouter.get("/sumbitproblem/:pid",redisauth,sumbitproblem);
problemRouter.get("/search", redisauth, searchProblems);
problemRouter.post("/:problemId/like", redisauth, likeProblem);
problemRouter.post("/:problemId/dislike", redisauth, dislikeProblem);
problemRouter.post('/:pid/solved', redisauth, markProblemSolved);
problemRouter.get('/users/top-rankers', getTopUsers);

// problemRouter.get("/user",redisauth,solvedProblem);

module.exports=problemRouter;



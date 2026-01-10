const Problem=require("../models/problem");
const User=require("../models/user");
const {getlanguageById,sumbitBatch,sumbittoken}=require("../utils/problemutility");
const Sumbit=require("../models/sumbission")
const { createExecutableCode } = require("../utils/codeTemplates");
const solutionVideo=require("../models/soluationVideo")

const createProblem = async(req, res) => {
    console.log("========== BACKEND: CREATE PROBLEM STARTED ==========");
    console.log("1. Request Body Received:", JSON.stringify(req.body, null, 2));
    console.log("2. User ID from middleware:", req.result?._id);
    
    const { title, description, difficulity, tags, visibletestcases, hiddentestcases, startcode, refrenceSoluation } = req.body;
    
    try {
        console.log("3. Starting validation...");
        
        for(const {language, completeCode} of refrenceSoluation) {
            console.log(`4. Validating ${language} solution...`);
            
            const languageId = getlanguageById(language);
            console.log(`   Language ID: ${languageId}`);
            
            const executableCode = createExecutableCode(
                completeCode, 
                language, 
                tags,  // Note: This should be a string, not array
                visibletestcases
            );
            
            console.log(`   Generated code (first 200 chars):`, executableCode.substring(0, 200));

            const submissions = visibletestcases.map((testcases) => ({
                source_code: executableCode,
                language_id: languageId,
                stdin: testcases.input,
                expected_output: testcases.output
            }));
            
            console.log(`5. Submitting ${submissions.length} test cases to Judge0...`);
            const sumbitResult = await sumbitBatch(submissions);
            console.log("6. Judge0 Response:", sumbitResult);

            const resulttoken = sumbitResult.map((value) => value.token);
            console.log("7. Tokens:", resulttoken);
            
            const testresult = await sumbittoken(resulttoken);
            console.log("8. Test Results:", testresult);
            
            for(const test of testresult) {
                if(test.status.id != 3) {
                    console.error("❌ TEST FAILED!");
                    console.error("   Status:", test.status);
                    console.error("   Compile Error:", test.compile_output);
                    console.error("   Stderr:", test.stderr);
                    
                    return res.status(400).json({
                        success: false,
                        message: "Solution validation failed",
                        error: test.status.description,
                        details: {
                            compile_output: test.compile_output,
                            stderr: test.stderr
                        }
                    });
                }
            }
            console.log(`✅ ${language} solution validated successfully`);
        }
        
        console.log("9. All validations passed! Creating problem...");
        
        const newProblem = await Problem.create({
            title,
            description,
            difficulity,
            tags,
            visibletestcases,
            hiddentestcases,
            startcode,
            refrenceSoluation,
            problemcreator: req.result._id
        });
        
        console.log("✅✅✅ PROBLEM CREATED SUCCESSFULLY! ✅✅✅");
        console.log("   Problem ID:", newProblem._id);
        console.log("========== BACKEND: END ==========");
        
        return res.status(201).json({ 
            success: true, 
            message: "Problem Saved Successfully",
            problemId: newProblem._id
        });

    } catch(err) {
        console.error("❌❌❌ BACKEND ERROR ❌❌❌");
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        
        if (err.name === 'ValidationError') {
            console.error("Validation errors:", err.errors);
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: Object.keys(err.errors).map(key => ({
                    field: key,
                    message: err.errors[key].message
                }))
            });
        }
        
        return res.status(500).json({ 
            success: false, 
            message: "Error: " + err.message
        });
    }
}








































const updateproblem=async(req,res)=>{
    const {id}=req.params;
    if(!id){
        res.status(400).send("Invalid id");
    }
try{
    const{title,description,difficulity,tags, visibletestcases,hiddentestcases, startcode,
refrenceSoluation, problemcreator}=req.body;


for(const {language,completeCode} of refrenceSoluation){
        const languageId=getlanguageById(language);
     const submissions = visibletestcases.map((testcases) => ({
            source_code: completeCode,
            language_id: languageId,
            stdin: testcases.input,
            expected_output: testcases.output
            }));  
    const sumbitResult=await sumbitBatch(submissions);
    console.log(sumbitResult);


 const resulttoken=sumbitResult.map((value)=>value.token)
  console.log(resulttoken)
  const testresult=await sumbittoken(resulttoken);
  console.log(testresult);
    for(const test of testresult){
      if(test.status.id!=3){
          return res.status(400).send("Error Occured");
      }
  }
    }

    const newproblem=await Problem.findByIdAndUpdate(id,{...req.body},{runValidators:true,new:true});
    res.status(200).send(newproblem);


    

    
  
}

catch(err){
    res.status(404).send("Error:"+err.message);
    
}

}
const deleteProblem=async(req,res)=>{
    try{
    const {id}=req.params;
    if(!id){
        return res.status(401).send("Error :Invalid Id");

    }
    const newdelete=await Problem.findOneAndDelete(id);
    if(!newdelete){
        return res.status(404).send("Problem missing");

    }
    return res.status(200).send("Sucessfully Deleted");
    }
    catch(err){
        res.send("Error Occured : "+err.message);
    }



    
}
const getProblemById=async(req,res)=>{
         const {id}=req.params;
        try{
       
        if(!id){
            return res.send("Id Is not Present");
        }

         const problems = await Problem.findById(id).select('_id title  description difficulity tags visibletestcases startcode refrenceSoluation');
      
        if(!problems){
            return res.send("Error:Problem does not exsist")
        

        }
          const videos = await solutionVideo.findOne({problemId:id});
  if(videos){   
   
  const responseData = {
   ...problems.toObject(),
   secureUrl:videos.secureUrl,
   thumbnailUrl : videos.thumbnailUrl,
   duration : videos.duration,
  } 
 
  return res.status(200).send(responseData);
  }
        
        

        res.send(problems);
        }
        catch(err){
            res.send("Error occured:" + err.message);

        }


}
const getAllProblem = async (req, res) => {
    try {
        const allproblem = await Problem.find({}).select("_id title difficulity tags description");
        
        if (allproblem.length === 0) {
            return res.status(200).json([]); // Return empty array, not 404
        }
        
        // Return array directly (your frontend expects this)
        res.status(200).json(allproblem);
        
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: "Error: " + err.message 
        });
    }
}

const solvedallproblem = async (req, res) => {
    try {
        const userId = req.result._id;
        
        const user = await User.findById(userId).populate({
            path: "problemSolved.problemId",
            select: "_id title difficulity tags description"
        });
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        
        // Get unique problems only (remove duplicates)
        const solvedProblemsMap = new Map();
        user.problemSolved.forEach(item => {
            if (item.problemId && item.problemId._id) {
                solvedProblemsMap.set(item.problemId._id.toString(), item.problemId);
            }
        });
        
        const solvedProblems = Array.from(solvedProblemsMap.values());
        
        res.status(200).json(solvedProblems);
        
    } catch (err) {
        res.status(400).json({ 
            success: false, 
            message: "Error Occurred: " + err.message 
        });
    }
}































const sumbitproblem = async (req, res) => {
    try {
        const userId = req.result._id; // Make sure this is set by your auth middleware
        const { pid } = req.params; // Get problemId from params

        // Validate inputs
        if (!userId) {
            return res.status(401).json({ 
                success: false, 
                message: "User not authenticated" 
            });
        }

        if (!pid) {
            return res.status(400).json({ 
                success: false, 
                message: "Problem ID is required" 
            });
        }

        // Fetch all submissions for this user and problem
        const submissions = await Sumbit.find({ userId, problemId: pid })
            .sort({ createdAt: -1 }); // Sort by newest first

        // If no submissions found, return empty array (not error)
        if (!submissions || submissions.length === 0) {
            return res.status(200).json([]);
        }

        // Return submissions array
        return res.status(200).json(submissions);

    } catch (err) {
        console.error('Error fetching submissions:', err);
        return res.status(500).json({ 
            success: false, 
            message: "Error fetching submission history",
            error: err.message 
        });
    }
};


const markProblemSolved = async (req, res) => {
    try {
        const userId = req.result._id;
        const { pid } = req.params;

        console.log("Marking problem as solved - User:", userId, "Problem:", pid);

        // Get the problem
        const problem = await Problem.findById(pid);
        if (!problem) {
            return res.status(404).json({ 
                success: false, 
                message: "Problem not found" 
            });
        }

        // Get the user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }

        // ✅ IMPORTANT: Check if already solved BEFORE doing anything
        const alreadySolved = user.problemSolved.some(
            p => p.problemId && p.problemId.toString() === pid
        );

        if (alreadySolved) {
            console.log("⚠️ Problem already solved, not incrementing stats");
            return res.status(200).json({ // Changed to 200, not 400
                success: true, 
                message: "Problem already solved",
                alreadySolved: true
            });
        }

        // Rest of your code stays the same...
        // Only execute if NOT already solved
        
        // Add to problemSolved array
        user.problemSolved.push({
            problemId: pid,
            solvedAt: new Date(),
            difficulity: problem.difficulity,
            timeTaken: req.body.timeTaken || 0,
            language: req.body.language || 'javascript'
        });

        // Initialize stats if not exists
        if (!user.stats) {
            user.stats = {
                easy: 0,
                medium: 0,
                hard: 0,
                totalSubmissions: 0,
                acceptanceRate: 0
            };
        }

        // Update stats based on difficulty (only once now)
        user.stats.totalSubmissions = (user.stats.totalSubmissions || 0) + 1;
        
        if (problem.difficulity === 'easy') {
            user.stats.easy = (user.stats.easy || 0) + 1;
        } else if (problem.difficulity === 'medium') {
            user.stats.medium = (user.stats.medium || 0) + 1;
        } else if (problem.difficulity === 'hard') {
            user.stats.hard = (user.stats.hard || 0) + 1;
        }

        // Calculate acceptance rate
        const totalSolved = user.stats.easy + user.stats.medium + user.stats.hard;
        user.stats.acceptanceRate = 
            ((totalSolved / user.stats.totalSubmissions) * 100).toFixed(2);

        // SAVE THE USER
        await user.save();

        // Update streak, monthly progress, and badges
        await updateUserStreak(userId);
        await updateMonthlyProgress(userId, problem.difficulity);
        const newBadges = await checkAndAwardBadges(userId);

        // Fetch updated user
        const updatedUser = await User.findById(userId).select('-password');

        res.status(200).json({
            success: true,
            message: "Problem marked as solved successfully! 🎉",
            data: {
                stats: updatedUser.stats,
                currentStreak: updatedUser.currentStreak,
                longestStreak: updatedUser.longestStreak,
                newBadges: newBadges,
                totalSolved: updatedUser.stats.easy + updatedUser.stats.medium + updatedUser.stats.hard
            }
        });

    } catch (error) {
        console.error("❌ Error in markProblemAsSolved:", error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};



const searchProblems = async (req, res) => {
    try {
        const { difficulity, tags, search, sortBy } = req.query;
        
        const query = {};
        
        // Filter by difficulty
        if (difficulity) {
            query.difficulity = difficulity;
        }
        
        // Filter by tags
        if (tags) {
            query.tags = { $in: tags.split(',') };
        }
        
        // Search by title
        if (search) {
            query.title = { $regex: search, $options: 'i' };
        }
        
        let sort = {};
        if (sortBy === 'difficulity') {
            sort = { difficulity: 1 };
        } else if (sortBy === 'acceptance') {
            sort = { acceptanceRate: -1 };
        } else {
            sort = { createdAt: -1 }; // Default: newest first
        }
        
        const problems = await Problem.find(query)
            .sort(sort)
            .select('title difficulity tags acceptanceRate totalSubmissions');
        
        res.status(200).json({
            success: true,
            data: problems
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const updateUserStreak = async (userId) => {
    try {
        const user = await User.findById(userId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastSolved = user.lastSolvedDate ? new Date(user.lastSolvedDate) : null;
        
        if (lastSolved) {
            lastSolved.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((today - lastSolved) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Same day, update streak history count
                const todayStr = today.toISOString().split('T')[0];
                const todayEntry = user.streakHistory.find(
                    entry => entry.date.toISOString().split('T')[0] === todayStr
                );
                if (todayEntry) {
                    todayEntry.problemsSolved += 1;
                } else {
                    user.streakHistory.push({
                        date: today,
                        problemsSolved: 1
                    });
                }
            } else if (diffDays === 1) {
                // Consecutive day
                user.currentStreak += 1;
                user.streakHistory.push({
                    date: today,
                    problemsSolved: 1
                });
            } else {
                // Streak broken
                user.currentStreak = 1;
                user.streakHistory.push({
                    date: today,
                    problemsSolved: 1
                });
            }
        } else {
            // First problem solved
            user.currentStreak = 1;
            user.streakHistory.push({
                date: today,
                problemsSolved: 1
            });
        }

        // Update longest streak
        if (user.currentStreak > user.longestStreak) {
            user.longestStreak = user.currentStreak;
        }

        user.lastSolvedDate = new Date();
        await user.save();
    } catch (error) {
        console.error("Error updating streak:", error);
    }
};


// Helper function to update monthly progress
const updateMonthlyProgress = async (userId, difficulity) => {
    try {
        const user = await User.findById(userId);
        const now = new Date();
        const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        const monthEntry = user.monthlyProgress.find(m => m.month === monthStr);

        if (monthEntry) {
            monthEntry.problemsSolved += 1;
            if (difficulity === 'easy') monthEntry.easy += 1;
            if (difficulity === 'medium') monthEntry.medium += 1;
            if (difficulity === 'hard') monthEntry.hard += 1;
        } else {
            user.monthlyProgress.push({
                month: monthStr,
                problemsSolved: 1,
                easy: difficulity === 'easy' ? 1 : 0,
                medium: difficulity === 'medium' ? 1 : 0,
                hard: difficulity=== 'hard' ? 1 : 0
            });
        }

        await user.save();
    } catch (error) {
        console.error("Error updating monthly progress:", error);
    }
};

// Helper function to check and award badges
const checkAndAwardBadges = async (userId) => {
    try {
        const user = await User.findById(userId);
        const badges = [];

        // First Problem Badge
        if (user.stats.easy + user.stats.medium + user.stats.hard === 1) {
            badges.push({
                name: "First Steps",
                icon: "🎯",
                description: "Solved your first problem",
                earnedAt: new Date()
            });
        }

        // 10 Problems Badge
        if (user.stats.easy + user.stats.medium + user.stats.hard === 10) {
            badges.push({
                name: "Getting Started",
                icon: "⭐",
                description: "Solved 10 problems",
                earnedAt: new Date()
            });
        }

        // 50 Problems Badge
        if (user.stats.easy + user.stats.medium + user.stats.hard === 50) {
            badges.push({
                name: "Dedicated Solver",
                icon: "🏆",
                description: "Solved 50 problems",
                earnedAt: new Date()
            });
        }

        // 100 Problems Badge
        if (user.stats.easy + user.stats.medium + user.stats.hard === 100) {
            badges.push({
                name: "Century Club",
                icon: "💯",
                description: "Solved 100 problems",
                earnedAt: new Date()
            });
        }

        // 7 Day Streak Badge
        if (user.currentStreak === 7) {
            badges.push({
                name: "Week Warrior",
                icon: "🔥",
                description: "7 day solving streak",
                earnedAt: new Date()
            });
        }

        // 30 Day Streak Badge
        if (user.currentStreak === 30) {
            badges.push({
                name: "Monthly Master",
                icon: "🎖️",
                description: "30 day solving streak",
                earnedAt: new Date()
            });
        }

        if (badges.length > 0) {
            await User.findByIdAndUpdate(userId, {
                $push: { badges: { $each: badges } }
            });
        }
    } catch (error) {
        console.error("Error checking badges:", error);
    }
};

// Like a problem
const likeProblem = async (req, res) => {
    try {
        const { problemId } = req.params;
        
        const problem = await Problem.findByIdAndUpdate(
            problemId,
            { $inc: { likes: 1 } },
            { new: true }
        );
        
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }
        
        res.status(200).json({
            success: true,
            data: { likes: problem.likes }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Dislike a problem
const dislikeProblem = async (req, res) => {
    try {
        const { problemId } = req.params;
        
        const problem = await Problem.findByIdAndUpdate(
            problemId,
            { $inc: { dislikes: 1 } },
            { new: true }
        );
        
        if (!problem) {
            return res.status(404).json({ success: false, message: "Problem not found" });
        }
        
        res.status(200).json({
            success: true,
            data: { dislikes: problem.dislikes }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};




// New function for top users leaderboard
const getTopUsers = async (req, res) => {
    try {
        const topUsers = await User.aggregate([
            {
                $project: {
                    firstname: 1,
                    lastname: 1,
                    emailId: 1,
                    problemCount: { $size: "$problemSolved" }
                }
            },
            {
                $sort: { problemCount: -1 }
            },
            {
                $limit: 5
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: topUsers
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Error occurred: " + err.message
        });
    }
};







module.exports={createProblem,updateproblem,deleteProblem,getProblemById,getAllProblem,solvedallproblem,sumbitproblem,getTopUsers,updateUserStreak,updateMonthlyProgress,checkAndAwardBadges,searchProblems,likeProblem,dislikeProblem,markProblemSolved};


const Problem = require("../models/problem");
const Sumbit = require("../models/sumbission");
const { getlanguageById, sumbitBatch, sumbittoken } = require("../utils/problemutility");
const { createExecutableCode } = require("../utils/codeTemplates");

const runproblem = async(req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;
        
        if (!userId || !code || !problemId || !language) {
            return res.status(400).send("Some Field missing");
        }
        
        if (language === "cpp") {
            language = "c++";
        }
        if (language === 'javascript') {
            language = 'js';
        }

        const problem = await Problem.findById(problemId);
        const languageId = getlanguageById(language);
        const executableCode = createExecutableCode(code, language, problem.tags[0]);
      
        // ✅ Store original test cases for later
        const originalTestCases = problem.visibletestcases.map(tc => ({
            input: tc.input,
            output: tc.output
        }));
        
        const submissions = problem.visibletestcases.map((testcases) => ({
            source_code: executableCode,
            language_id: languageId,
            stdin: testcases.input,
            expected_output: testcases.output
        }));  
        
        const sumbitResult = await sumbitBatch(submissions);
        const resulttoken = sumbitResult.map((value) => value.token);
        const testresult = await sumbittoken(resulttoken);
        
        // ✅ Merge Judge0 results with original test case data
        const decodedTestResults = testresult.map((test, index) => ({
            ...test,
            stdin: originalTestCases[index].input,           // ✅ Use original input
            expected_output: originalTestCases[index].output // ✅ Use original expected output
        }));
        
        let testCasesPassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = true;
        let errorMessage = null;
        
        for (const test of decodedTestResults) {
            if (test.status_id == 3) {
                testCasesPassed++;
                runtime = runtime + parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            } else {
                status = false;
                errorMessage = test.stderr || test.compile_output || 'Runtime Error';
            }
        }

        res.status(201).json({
            success: status,
            testCases: decodedTestResults,
            runtime,
            memory,
            error: errorMessage
        });
    } catch (err) {
        console.error("Error in runproblem:", err);
        res.status(500).json({
            success: false,
            error: "Error: " + err.message
        });
    }
}

const usersumbission = async(req, res) => {
    try {
        const userId = req.result._id;
        const problemId = req.params.id;
        let { code, language } = req.body;
        
        if (!userId || !code || !problemId || !language) {
            return res.status(400).send("Some Field missing");
        }
        
        if (language === "cpp") {
            language = "c++";
        }
        if (language === 'javascript') {
            language = 'js';
        }

        const problem = await Problem.findById(problemId);
        const sumbitresult = await Sumbit.create({
            userId,
            problemId,
            code,
            language,
            testcasespassed: 0,
            status: "Pending",
            testcasestotal: problem.hiddentestcases.length
        });

        const languageId = getlanguageById(language);
        const executableCode = createExecutableCode(code, language, problem.tags[0]);
        
        const submissions = problem.hiddentestcases.map((testcases) => ({
            source_code: executableCode,
            language_id: languageId,
            stdin: testcases.input,
            expected_output: testcases.output
        }));
        
        const sumbitResult = await sumbitBatch(submissions);
        const resulttoken = sumbitResult?.map((value) => value.token);
        const testresult = await sumbittoken(resulttoken);

        let testcasespassed = 0;
        let runtime = 0;
        let memory = 0;
        let status = "accepted";
        let errormessage = null;
        
        for (const test of testresult) {
            if (test.status_id === 3) {
                testcasespassed++;
                runtime = runtime + parseFloat(test.time);
                memory = Math.max(memory, test.memory);
            } else {
                if (test.status_id == 4) {
                    status = "error";
                    errormessage = test.stderr || test.compile_output;
                } else {
                    status = "wrong";
                    errormessage = test.stderr || "Wrong Answer";
                }
            }
        }
        
        sumbitresult.status = status;
        sumbitresult.testcasespassed = testcasespassed;
        sumbitresult.errormessage = errormessage;
        sumbitresult.runtime = runtime;
        sumbitresult.memory = memory;
        await sumbitresult.save();

       await sumbitresult.save();

// ✅ Only add to problemSolved if status is 'accepted'
if (status === 'accepted' && !req.result.problemSolved.includes(problemId)) {
    req.result.problemSolved.push(problemId);
    await req.result.save();
}

       
       
       
        
        const accepted = (status == 'accepted');
        
        res.status(201).json({
            accepted,
            testcasestotal: sumbitresult.testcasestotal,
            testcasespassed: testcasespassed,
            runtime,
            memory,
            error: errormessage
        });
    } catch (err) {
        console.error("Error in usersumbission:", err);
        res.status(500).json({
            success: false,
            error: "Error: " + err.message
        });
    }
}

module.exports = { usersumbission, runproblem };
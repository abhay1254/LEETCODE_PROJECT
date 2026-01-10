const { GoogleGenerativeAI } = require("@google/generative-ai");

const technicalInterview = async(req, res) => {
    try {
        const { messages, currentProblem, codeSubmission, interviewStats, endInterview } = req.body;
        
        console.log("Technical Interview request:", { 
            messagesCount: messages?.length,
            currentProblem,
            codeSubmission,
            problemsSolved: interviewStats?.problemsSolved,
            duration: interviewStats?.duration,
            endInterview
        });

        const apiKey = "AIzaSyBNs2mYLV0TVG37-_taa9PJjnC0R3r64VI"; // Your API key
        
        if (!apiKey) {
            return res.status(500).json({
                message: "API key not configured",
                error: "API key is missing"
            });
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp"
        });

        // Build conversation history
        const conversationHistory = messages
            .filter(msg => msg && msg.parts && msg.parts[0] && msg.parts[0].text)
            .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.parts[0].text}`)
            .join('\n\n');

        let prompt;
        let responseData = {};

        if (endInterview) {
            // Generate final technical assessment
            prompt = `You are an expert technical interviewer providing final assessment after a coding interview.

## INTERVIEW STATISTICS:
- Problems Solved: ${interviewStats.problemsSolved}
- Interview Duration: ${Math.floor(interviewStats.duration / 60)} minutes ${interviewStats.duration % 60} seconds

## CONVERSATION HISTORY:
${conversationHistory}

Please provide a comprehensive technical assessment with:

1. **Overall Performance Score**: Rate out of 10
2. **Problem-Solving Ability**: How well they approached problems
3. **Code Quality**: Clean code, readability, best practices
4. **Time & Space Complexity**: Understanding of algorithmic efficiency
5. **Communication**: How well they explained their thought process
6. **Areas of Strength**: 3-4 specific strengths
7. **Areas for Improvement**: 2-3 specific areas to work on
8. **Recommended Topics to Study**: Based on weaknesses observed
9. **Final Verdict**: Strong Hire / Hire / Consider / No Hire
10. **Next Steps**: Actionable advice for interview preparation

Be constructive, specific, and encouraging.`;

        } else if (codeSubmission) {
            // Evaluate submitted code
            prompt = `You are an expert technical interviewer evaluating a code submission.

## CURRENT PROBLEM:
${currentProblem}

## INTERVIEW PROGRESS:
- Problems Solved: ${interviewStats.problemsSolved}
- Duration: ${Math.floor(interviewStats.duration / 60)} minutes

## CONVERSATION & CODE SUBMISSION:
${conversationHistory}

Please evaluate this code submission:

1. **Correctness**: Does it solve the problem? Any bugs?
2. **Edge Cases**: Does it handle edge cases properly?
3. **Time Complexity**: Analyze and explain
4. **Space Complexity**: Analyze and explain
5. **Code Quality**: Readability, naming, structure
6. **Optimization**: Can it be improved? How?
7. **Testing**: Suggest test cases

After evaluation:
- If code is CORRECT and reasonably optimal: Praise them, explain complexity, and move to NEXT problem (medium/hard difficulty)
- If code has MINOR issues: Point them out gently and ask if they want to fix or move on
- If code has MAJOR issues: Provide hints and ask them to revise

Based on your evaluation, respond naturally and conversationally.

If moving to next problem, introduce a NEW problem that's slightly harder than the previous one. Choose from: Arrays, Strings, Linked Lists, Trees, Graphs, Dynamic Programming, etc.`;

            // Check if problem was solved to update stats
            responseData.problemSolved = conversationHistory.toLowerCase().includes('correct') || 
                                         conversationHistory.toLowerCase().includes('well done');

        } else {
            // Handle regular conversation (questions, hints, approach discussion)
            prompt = `You are an experienced technical interviewer conducting a coding interview.

## YOUR ROLE:
1. **Guide Problem Solving**: Help candidates think through problems
2. **Provide Strategic Hints**: Don't give away solutions, guide thinking
3. **Encourage Best Practices**: Prompt for edge cases, complexity analysis
4. **Assess Communication**: See how well they explain their approach
5. **Be Supportive**: Create a positive interview environment

## CURRENT PROBLEM:
${currentProblem}

## INTERVIEW PROGRESS:
- Problems Solved: ${interviewStats.problemsSolved}
- Duration: ${Math.floor(interviewStats.duration / 60)} minutes

## CONVERSATION HISTORY:
${conversationHistory}

## RESPONSE GUIDELINES:

**If candidate asks clarifying questions:**
- Answer clearly and provide additional context if needed
- Encourage this behavior - it shows good problem-solving habits

**If candidate explains their approach:**
- Validate if approach is correct
- Point out any issues gently
- Ask about time/space complexity
- Encourage them to code it up

**If candidate asks for hints:**
- Give progressive hints (don't reveal full solution)
- Start with high-level hints, then get more specific if needed
- Examples: "Think about using a hash map", "Consider a two-pointer approach"

**If candidate is stuck:**
- Ask guiding questions: "What if we used X data structure?"
- Relate to similar problems they might know
- Break the problem into smaller parts

**If candidate asks about edge cases:**
- Discuss relevant edge cases
- Ask them how they'd handle them

**If candidate completed explaining approach:**
- Ask them to implement it in code
- Remind them they can use the code editor

Keep responses conversational, encouraging, and educational. Format code examples in markdown code blocks.`;
        }

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        // Try to detect if a new problem was introduced
        const newProblemMatch = text.match(/\*\*Problem[:\s]+([^\n]+)/i);
        if (newProblemMatch && !endInterview) {
            responseData.newProblem = newProblemMatch[1].trim();
        }
        
        console.log("✅ Technical Interview response generated");
        
        res.status(200).json({
            message: text,
            ...responseData
        });

    } catch(err) {
        console.error("❌ Technical Interview Error:", err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

module.exports = technicalInterview;
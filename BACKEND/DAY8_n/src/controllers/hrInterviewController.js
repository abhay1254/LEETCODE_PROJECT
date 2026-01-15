const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const hrInterview = async(req, res) => {
    console.log("=== HR INTERVIEW REQUEST STARTED ===");
    
    try {
        const { messages, interviewStats, endInterview } = req.body;
        
        console.log("1. Request body received:", {
            messagesCount: messages?.length,
            questionsAsked: interviewStats?.questionsAsked,
            duration: interviewStats?.duration,
            endInterview,
            hasMessages: !!messages,
            hasInterviewStats: !!interviewStats
        });

        // Log first message structure
        if (messages && messages.length > 0) {
            console.log("2. First message structure:", JSON.stringify(messages[0], null, 2));
        }

        const apiKey = process.env.GOOGLE_API_KEY;
        console.log("3. API Key check:", {
            exists: !!apiKey,
            length: apiKey?.length,
            starts: apiKey?.substring(0, 10)
        });
        
        if (!apiKey) {
            console.error("❌ API key missing!");
            return res.status(500).json({
                message: "API key not configured",
                error: "API key is missing" 
            });
        }
        
        console.log("4. Creating GoogleGenerativeAI instance...");
        const genAI = new GoogleGenerativeAI(apiKey);
        
        console.log("5. Getting model...");
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash"
        });
        console.log("6. Model created successfully");

        // Build conversation history
        console.log("7. Building conversation history...");
        const conversationHistory = messages
            .filter(msg => {
                const valid = msg && msg.parts && msg.parts[0] && msg.parts[0].text;
                if (!valid) {
                    console.log("Filtered out invalid message:", msg);
                }
                return valid;
            })
            .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.parts[0].text}`)
            .join('\n\n');

        console.log("8. Conversation history built:", {
            length: conversationHistory.length,
            preview: conversationHistory.substring(0, 100)
        });

        let prompt;

        if (endInterview) {
            console.log("9. Building END INTERVIEW prompt...");
            prompt = `You are an expert HR interviewer providing final feedback after an interview session.

## INTERVIEW STATISTICS:
- Total Questions Asked: ${interviewStats.questionsAsked}
- Interview Duration: ${Math.floor(interviewStats.duration / 60)} minutes ${interviewStats.duration % 60} seconds

## CONVERSATION HISTORY:
${conversationHistory}

Please provide a comprehensive interview summary with:

1. **Overall Performance Score**: Rate the candidate out of 10
2. **Strengths**: 3-4 key strengths observed
3. **Areas for Improvement**: 2-3 specific areas to work on
4. **Communication Skills**: Assess clarity, structure (STAR method), and confidence
5. **Specific Examples Quality**: How well they provided concrete examples
6. **Final Recommendation**: Hire / Consider / Needs more practice
7. **Next Steps**: Actionable advice for improvement

Be encouraging but honest. Provide specific, actionable feedback.`;

        } else {
            console.log("9. Building REGULAR INTERVIEW prompt...");
            prompt = `You are an experienced HR interviewer conducting a behavioral interview.

## YOUR RESPONSIBILITIES:
1. **Ask Relevant Questions**: Focus on behavioral and situational questions
2. **Evaluate Responses**: Listen carefully and ask thoughtful follow-ups
3. **Guide the Candidate**: If answers are vague, ask for specific examples
4. **Build Rapport**: Be professional but friendly and encouraging
5. **Use STAR Method**: Encourage candidates to use Situation, Task, Action, Result format

## INTERVIEW PROGRESS:
- Questions Asked So Far: ${interviewStats.questionsAsked}
- Interview Duration: ${Math.floor(interviewStats.duration / 60)} minutes

## CONVERSATION SO FAR:
${conversationHistory}

## QUESTION CATEGORIES (rotate through these):
- Self-introduction and career goals
- Teamwork and collaboration
- Conflict resolution
- Leadership and initiative
- Problem-solving abilities
- Adaptability and learning
- Strengths and weaknesses
- Time management and prioritization
- Handling pressure and deadlines
- Cultural fit and values

## RESPONSE GUIDELINES:
1. If this is early in the interview (< 3 questions), ask foundational questions
2. If candidate gave a good answer, acknowledge it positively and move to next question
3. If answer was vague, ask a follow-up like "Can you give me a specific example?"
4. If answer was too short, ask "Can you elaborate on that?"
5. After 7-8 questions, start wrapping up
6. Keep your responses conversational and natural
7. Format important parts in **bold** for emphasis

Now, based on the conversation, provide your next question or follow-up. Be natural and conversational.`;
        }

        console.log("10. Prompt created, length:", prompt.length);
        console.log("11. Calling Gemini API...");
        
        const result = await model.generateContent(prompt);
        
        console.log("12. Gemini API responded");
        const response = result.response;
        const text = response.text();
        
        console.log("13. Response text extracted, length:", text.length);
        console.log("✅ HR Interview response generated successfully");
        
        res.status(200).json({
            message: text
        });

    } catch(err) {
        console.error("=== HR INTERVIEW ERROR ===");
        console.error("Error name:", err.name);
        console.error("Error message:", err.message);
        console.error("Error stack:", err.stack);
        console.error("Full error object:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        
        res.status(500).json({
            message: "Internal server error",
            error: err.message,
            errorName: err.name,
            errorStack: err.stack
        });
    }
}

module.exports = hrInterview;
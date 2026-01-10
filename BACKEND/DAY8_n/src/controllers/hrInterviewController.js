const { GoogleGenerativeAI } = require("@google/generative-ai");

const hrInterview = async(req, res) => {
    try {
        const { messages, interviewStats, endInterview } = req.body;
        
        console.log("HR Interview request:", { 
            messagesCount: messages?.length,
            questionsAsked: interviewStats?.questionsAsked,
            duration: interviewStats?.duration,
            endInterview
        });

        const apiKey = "AIzaSyBNs2mYLV0TVG37-_taa9PJjnC0R3r64VI"; // Use your API key
        
        if (!apiKey) {
            return res.status(500).json({
                message: "API key not configured",
                error: "API key is missing"
            });
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash-exp"  // or "gemini-1.5-pro"
        });

        // Build conversation history
        const conversationHistory = messages
            .filter(msg => msg && msg.parts && msg.parts[0] && msg.parts[0].text)
            .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.parts[0].text}`)
            .join('\n\n');

        let prompt;

        if (endInterview) {
            // Generate final feedback and summary
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
            // Generate next interview question
            prompt = `You are an experienced HR interviewer conducting a behavioral interview. Your role is to:

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

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        console.log("✅ HR Interview response generated");
        
        res.status(200).json({
            message: text
        });

    } catch(err) {
        console.error("❌ HR Interview Error:", err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

module.exports = hrInterview;
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const hrInterview = async(req, res) => {
  try {
    const { messages, interviewStats, endInterview } = req.body;
    
    console.log("HR Interview request:", {
      messagesCount: messages?.length,
      questionsAsked: interviewStats?.questionsAsked,
      duration: interviewStats?.duration,
      endInterview
    });

    // Validate API key
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      console.error("❌ API key not configured");
      return res.status(500).json({
        message: "API key not configured",
        error: "GOOGLE_API_KEY is missing in environment variables"
      });
    }

    // Validate messages
    if (!messages || messages.length === 0) {
      return res.status(400).json({
        message: "No messages provided",
        error: "Messages array is empty"
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use stable model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash", // Changed from experimental model
      generationConfig: {
        temperature: 0.9,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    });

    // Build conversation history with better validation
    const conversationHistory = messages
      .filter(msg => {
        const isValid = msg && 
                       msg.parts && 
                       Array.isArray(msg.parts) && 
                       msg.parts[0] && 
                       msg.parts[0].text &&
                       msg.parts[0].text.trim().length > 0;
        if (!isValid) {
          console.warn("Filtered out invalid message:", msg);
        }
        return isValid;
      })
      .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.parts[0].text}`)
      .join('\n\n');

    if (!conversationHistory || conversationHistory.trim().length === 0) {
      console.error("❌ No valid conversation history after filtering");
      return res.status(400).json({
        message: "Invalid conversation history",
        error: "No valid messages found"
      });
    }

    console.log("Conversation history length:", conversationHistory.length);

    let prompt;
    if (endInterview) {
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
      prompt = `You are an experienced HR interviewer conducting a behavioral interview.

## INTERVIEW PROGRESS:
- Questions Asked So Far: ${interviewStats.questionsAsked}
- Interview Duration: ${Math.floor(interviewStats.duration / 60)} minutes

## CONVERSATION SO FAR:
${conversationHistory}

## YOUR RESPONSIBILITIES:
1. Ask relevant behavioral/situational questions
2. Evaluate responses and ask thoughtful follow-ups
3. Guide candidates to provide specific examples
4. Be professional but friendly
5. Encourage STAR method (Situation, Task, Action, Result)

## QUESTION CATEGORIES (rotate through):
- Self-introduction and career goals
- Teamwork and collaboration
- Conflict resolution
- Leadership and initiative
- Problem-solving abilities
- Adaptability and learning
- Strengths and weaknesses
- Time management
- Handling pressure
- Cultural fit

## RESPONSE GUIDELINES:
- Early interview (< 3 questions): Ask foundational questions
- Good answer: Acknowledge positively and move to next question
- Vague answer: Ask "Can you give me a specific example?"
- Short answer: Ask "Can you elaborate on that?"
- After 7-8 questions: Start wrapping up
- Keep responses natural and conversational
- Use **bold** for emphasis

Provide your next question or follow-up. Be natural and conversational.`;
    }

    console.log("Sending prompt to Gemini...");
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text || text.trim().length === 0) {
      throw new Error("Empty response from Gemini API");
    }

    console.log("✅ HR Interview response generated successfully");
    console.log("Response length:", text.length);

    res.status(200).json({ message: text });

  } catch(err) {
    console.error("❌ HR Interview Error:", err);
    console.error("Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack,
      response: err.response?.data
    });

    res.status(500).json({
      message: "Failed to generate interview response",
      error: err.message,
      details: err.response?.data || err.toString()
    });
  }
};

module.exports = hrInterview;
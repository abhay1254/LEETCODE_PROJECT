const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const solveDoubt = async(req, res) => {
    try {
        const {messages, title, description, testCases, startCode} = req.body;
        
        console.log("Received request:", { 
            messagesCount: messages?.length, 
            title, 
            hasDescription: !!description,
            hasTestCases: !!testCases,
            hasStartCode: !!startCode
        });

        // ✅ FIXED: API key wrapped in quotes
        const apiKey = process.env.GOOGLE_API_KEY;
        
        if (!apiKey) {
            return res.status(500).json({
                message: "API key not configured",
                error: "API key is missing"
            });
        }
        
        const genAI = new GoogleGenerativeAI(apiKey);
        
        // ✅ FIXED: Using correct model name
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash"  // Changed from "gemini-pro"
        });

        // Build conversation context
        const conversationHistory = messages
            .filter(msg => msg && msg.parts && msg.parts[0] && msg.parts[0].text)
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.parts[0].text}`)
            .join('\n\n');

        const prompt = `You are an expert Data Structures and Algorithms (DSA) tutor specializing in helping users solve coding problems. Your role is strictly limited to DSA-related assistance only.

## CURRENT PROBLEM CONTEXT:
**Problem Title:** ${title}
**Description:** ${description}
**Test Cases:** ${JSON.stringify(testCases, null, 2)}
**Starter Code:** ${JSON.stringify(startCode, null, 2)}

## YOUR CAPABILITIES:
1. **Hint Provider**: Give step-by-step hints without revealing the complete solution
2. **Code Reviewer**: Debug and fix code submissions with explanations
3. **Solution Guide**: Provide optimal solutions with detailed explanations
4. **Complexity Analyzer**: Explain time and space complexity trade-offs
5. **Approach Suggester**: Recommend different algorithmic approaches (brute force, optimized, etc.)
6. **Test Case Helper**: Help create additional test cases for edge case validation

## RESPONSE FORMAT:
- Use clear, concise explanations
- Format code with proper syntax highlighting using markdown code blocks
- Use examples to illustrate concepts
- Break complex explanations into digestible parts
- Always relate back to the current problem context
- Always respond in the language user is comfortable with

## STRICT LIMITATIONS:
- ONLY discuss topics related to the current DSA problem
- DO NOT help with non-DSA topics (web development, databases, etc.)
- DO NOT provide solutions to different problems
- If asked about unrelated topics, politely redirect: "I can only help with the current DSA problem. What specific aspect of this problem would you like assistance with?"

## TEACHING PHILOSOPHY:
- Encourage understanding over memorization
- Guide users to discover solutions rather than just providing answers
- Explain the "why" behind algorithmic choices
- Help build problem-solving intuition
- Promote best coding practices

## CONVERSATION SO FAR:
${conversationHistory}

Please provide a helpful, educational response focused on this DSA problem. Keep your response concise and focused.`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        console.log("✅ Successfully generated response");
        
        res.status(200).json({
            message: text
        });

    } catch(err) {
        console.error("❌ Gemini API Error:", err);
        console.error("Error message:", err.message);
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

module.exports = solveDoubt;
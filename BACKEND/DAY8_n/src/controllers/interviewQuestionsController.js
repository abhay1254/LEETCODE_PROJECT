const { GoogleGenerativeAI } = require("@google/generative-ai");

const interviewQuestions = async(req, res) => {
    try {
        const { action, questionsCount, stats, answers, questions } = req.body;
        
        console.log("Interview Questions request:", { 
            action,
            questionsCount,
            correctAnswers: stats?.correctAnswers,
            totalTime: stats?.totalTime
        });

        const apiKey = "AIzaSyBNs2mYLV0TVG37-_taa9PJjnC0R3r64VI";
        
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

        if (action === 'generate') {
            // Generate interview questions
            const prompt = `You are an expert interview question generator. Generate exactly ${questionsCount} multiple-choice interview questions.

## REQUIREMENTS:
1. Mix of difficulty levels: Easy (30%), Medium (50%), Hard (20%)
2. Cover diverse topics: HR/Behavioral, Technical Concepts, Problem-Solving, Situational
3. Each question must have:
   - Clear, professional wording
   - Exactly 4 options (A, B, C, D)
   - One correct answer
   - Realistic distractors (wrong options that seem plausible)
4. Questions should test real interview skills and knowledge
5. Avoid trick questions - focus on practical understanding

## CATEGORIES TO INCLUDE:
- Behavioral (Tell me about a time when...)
- Technical Knowledge (Programming concepts, CS fundamentals)
- Problem Solving (Logic, algorithms, system design basics)
- Soft Skills (Communication, teamwork, conflict resolution)
- Industry Knowledge (Best practices, methodologies)

## OUTPUT FORMAT:
Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "category": "Behavioral",
    "difficulty": "Easy",
    "explanation": "Brief explanation of why this answer is correct"
  }
]

CRITICAL: 
- correctAnswer must be the INDEX (0-3) of the correct option
- Return ONLY the JSON array, no other text
- Ensure exactly ${questionsCount} questions
- Make questions realistic and practical

Generate the questions now:`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            let text = response.text();
            
            // Clean up response to extract JSON
            text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            
            try {
                const generatedQuestions = JSON.parse(text);
                
                // Validate questions
                if (!Array.isArray(generatedQuestions) || generatedQuestions.length !== questionsCount) {
                    throw new Error('Invalid questions format');
                }

                // Validate each question structure
                generatedQuestions.forEach((q, index) => {
                    if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
                        typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
                        throw new Error(`Invalid question format at index ${index}`);
                    }
                });
                
                console.log(`✅ Generated ${generatedQuestions.length} questions`);
                
                res.status(200).json({
                    questions: generatedQuestions
                });
            } catch (parseError) {
                console.error("JSON Parse Error:", parseError);
                console.log("Raw response:", text.substring(0, 500));
                
                // Return fallback questions if generation fails
                const fallbackQuestions = generateFallbackQuestions(questionsCount);
                res.status(200).json({
                    questions: fallbackQuestions
                });
            }

        } else if (action === 'evaluate') {
            // Generate personalized feedback
            const score = ((stats.correctAnswers / questionsCount) * 100).toFixed(1);
            const accuracy = stats.correctAnswers / (questionsCount - stats.skipped) * 100 || 0;
            
            // Build question performance summary
            const performanceSummary = answers.map((ans, idx) => {
                const q = questions[idx];
                return `Q${idx + 1} [${q.category}]: ${ans.wasSkipped ? 'Skipped' : (ans.isCorrect ? 'Correct' : 'Wrong')} (${ans.timeTaken}s)`;
            }).join('\n');

            const prompt = `You are an expert interview coach providing personalized feedback after a quiz.

## QUIZ PERFORMANCE:
- Questions: ${questionsCount}
- Score: ${score}%
- Correct: ${stats.correctAnswers}
- Wrong: ${stats.wrongAnswers}
- Skipped: ${stats.skipped}
- Total Time: ${Math.floor(stats.totalTime / 60)}m ${stats.totalTime % 60}s
- Accuracy (excluding skipped): ${accuracy.toFixed(1)}%

## QUESTION-BY-QUESTION BREAKDOWN:
${performanceSummary}

## YOUR TASK:
Provide a comprehensive, encouraging, and actionable performance analysis with:

1. **Overall Performance Assessment**
   - Rate their performance honestly but constructively
   - Acknowledge their strengths

2. **Score Interpretation**
   - What does their score mean?
   - How do they compare to typical candidates?

3. **Time Management Analysis**
   - Did they use time well?
   - Any patterns in time spent vs accuracy?

4. **Strengths Identified**
   - Which categories did they excel in?
   - What skills are well-developed?

5. **Areas for Improvement**
   - Which categories need work?
   - Specific topics to study

6. **Actionable Next Steps**
   - 3-5 concrete recommendations
   - Resources or topics to focus on
   - How to improve for real interviews

7. **Motivation & Encouragement**
   - End on a positive, motivating note
   - Realistic optimism about their progress

## TONE:
- Professional yet warm and supportive
- Honest but never discouraging
- Specific and actionable
- Focus on growth mindset

Keep the feedback concise (300-400 words) but comprehensive. Use a natural, conversational tone like a mentor would use.`;

            const result = await model.generateContent(prompt);
            const response = result.response;
            const feedback = response.text();
            
            console.log("✅ Feedback generated");
            
            res.status(200).json({
                feedback
            });
        } else {
            res.status(400).json({
                message: "Invalid action",
                error: "Action must be 'generate' or 'evaluate'"
            });
        }

    } catch(err) {
        console.error("❌ Interview Questions Error:", err);
        res.status(500).json({
            message: "Internal server error",
            error: err.message
        });
    }
}

// Fallback questions in case AI generation fails
function generateFallbackQuestions(count) {
    const questionBank = [
        {
            question: "Tell me about a time when you faced a challenging deadline. How did you handle it?",
            options: [
                "I always meet deadlines, so I've never faced this situation",
                "I prioritized tasks, communicated with stakeholders, and worked extra hours to deliver on time",
                "I asked for an extension immediately",
                "I delegated everything to my team members"
            ],
            correctAnswer: 1,
            category: "Behavioral",
            difficulty: "Easy",
            explanation: "This answer demonstrates time management, communication, and commitment"
        },
        {
            question: "What is the time complexity of binary search?",
            options: [
                "O(n)",
                "O(n log n)",
                "O(log n)",
                "O(1)"
            ],
            correctAnswer: 2,
            category: "Technical",
            difficulty: "Easy",
            explanation: "Binary search divides the search space in half each iteration, resulting in O(log n)"
        },
        {
            question: "How do you handle conflicts with team members?",
            options: [
                "I avoid conflicts at all costs",
                "I listen to their perspective, find common ground, and focus on the team goal",
                "I escalate to my manager immediately",
                "I prove them wrong with data"
            ],
            correctAnswer: 1,
            category: "Soft Skills",
            difficulty: "Medium",
            explanation: "This shows emotional intelligence, collaboration, and problem-solving"
        },
        {
            question: "Which of these is NOT a principle of Object-Oriented Programming?",
            options: [
                "Encapsulation",
                "Inheritance",
                "Compilation",
                "Polymorphism"
            ],
            correctAnswer: 2,
            category: "Technical",
            difficulty: "Easy",
            explanation: "Compilation is a process, not an OOP principle. The four main principles are Encapsulation, Inheritance, Polymorphism, and Abstraction"
        },
        {
            question: "A customer is angry about a product defect. What's your first response?",
            options: [
                "Explain that it's not your department's fault",
                "Apologize, acknowledge their frustration, and ask how you can help resolve it",
                "Offer a discount immediately",
                "Explain the technical reasons for the defect"
            ],
            correctAnswer: 1,
            category: "Situational",
            difficulty: "Medium",
            explanation: "Empathy and solution-focus are key in customer service situations"
        },
        {
            question: "What is the main difference between TCP and UDP?",
            options: [
                "TCP is faster than UDP",
                "UDP is connection-oriented, TCP is connectionless",
                "TCP is reliable and connection-oriented, UDP is faster but unreliable",
                "They are the same"
            ],
            correctAnswer: 2,
            category: "Technical",
            difficulty: "Medium",
            explanation: "TCP ensures reliable delivery with error checking, while UDP prioritizes speed"
        },
        {
            question: "Describe a situation where you had to learn a new technology quickly.",
            options: [
                "I prefer to stick with what I know",
                "I researched documentation, took an online course, and built a small project to practice",
                "I copied code from Stack Overflow",
                "I asked others to do it for me"
            ],
            correctAnswer: 1,
            category: "Behavioral",
            difficulty: "Medium",
            explanation: "Shows initiative, learning ability, and practical application"
        },
        {
            question: "In Agile methodology, what is a sprint?",
            options: [
                "A fast running exercise",
                "A time-boxed iteration for completing work (typically 1-4 weeks)",
                "The final phase of project delivery",
                "A type of project management tool"
            ],
            correctAnswer: 1,
            category: "Industry Knowledge",
            difficulty: "Easy",
            explanation: "Sprints are fixed time periods where teams complete planned work in Agile"
        },
        {
            question: "What would you do if you discovered a critical bug in production at 5 PM on a Friday?",
            options: [
                "Wait until Monday to address it",
                "Fix it yourself without telling anyone",
                "Immediately notify relevant stakeholders, assess impact, and coordinate a fix",
                "Hope nobody notices"
            ],
            correctAnswer: 2,
            category: "Situational",
            difficulty: "Medium",
            explanation: "Shows responsibility, communication, and crisis management skills"
        },
        {
            question: "Which data structure uses LIFO (Last In, First Out)?",
            options: [
                "Queue",
                "Stack",
                "Array",
                "Tree"
            ],
            correctAnswer: 1,
            category: "Technical",
            difficulty: "Easy",
            explanation: "Stack follows LIFO principle, like a stack of plates"
        },
        {
            question: "Your manager asks you to do something unethical. What do you do?",
            options: [
                "Do it to keep my job",
                "Refuse respectfully and explain my concerns, escalate if necessary",
                "Ignore the request",
                "Complain to coworkers"
            ],
            correctAnswer: 1,
            category: "Behavioral",
            difficulty: "Hard",
            explanation: "Shows integrity, professionalism, and knowledge of proper escalation"
        },
        {
            question: "What is the purpose of a foreign key in a database?",
            options: [
                "To encrypt data",
                "To establish a relationship between two tables",
                "To speed up queries",
                "To store large files"
            ],
            correctAnswer: 1,
            category: "Technical",
            difficulty: "Easy",
            explanation: "Foreign keys maintain referential integrity between related tables"
        },
        {
            question: "You're assigned to a project with unclear requirements. What's your approach?",
            options: [
                "Start coding and figure it out later",
                "Schedule meetings with stakeholders to clarify requirements and document them",
                "Wait for someone to tell me exactly what to do",
                "Work on something else"
            ],
            correctAnswer: 1,
            category: "Problem Solving",
            difficulty: "Medium",
            explanation: "Shows proactive communication and requirements gathering skills"
        },
        {
            question: "What is the space complexity of a recursive Fibonacci function?",
            options: [
                "O(1)",
                "O(n)",
                "O(n^2)",
                "O(log n)"
            ],
            correctAnswer: 1,
            category: "Technical",
            difficulty: "Hard",
            explanation: "The call stack grows to depth n, making space complexity O(n)"
        },
        {
            question: "How do you prioritize tasks when everything seems urgent?",
            options: [
                "Work on whatever is easiest first",
                "Assess impact and urgency, communicate with stakeholders, then prioritize accordingly",
                "Do everything at once",
                "Let my manager decide"
            ],
            correctAnswer: 1,
            category: "Soft Skills",
            difficulty: "Medium",
            explanation: "Shows strategic thinking and stakeholder management"
        },
        {
            question: "What does REST stand for in web APIs?",
            options: [
                "Representational State Transfer",
                "Remote Execution of System Tasks",
                "Rapid Execution System Technology",
                "Resource Encoded System Transfer"
            ],
            correctAnswer: 0,
            category: "Technical",
            difficulty: "Easy",
            explanation: "REST (Representational State Transfer) is an architectural style for web services"
        },
        {
            question: "You made a mistake that affected the team. What do you do?",
            options: [
                "Hide it and hope nobody finds out",
                "Blame external factors",
                "Admit the mistake, apologize, explain what you learned, and present a solution",
                "Make excuses"
            ],
            correctAnswer: 2,
            category: "Behavioral",
            difficulty: "Medium",
            explanation: "Shows accountability, maturity, and commitment to improvement"
        },
        {
            question: "In version control, what is a 'merge conflict'?",
            options: [
                "When two developers argue",
                "When changes to the same part of code cannot be automatically merged",
                "When the code doesn't compile",
                "When a branch is deleted"
            ],
            correctAnswer: 1,
            category: "Technical",
            difficulty: "Easy",
            explanation: "Merge conflicts occur when Git cannot automatically resolve differences between branches"
        },
        {
            question: "Your team is resistant to a change you're proposing. How do you proceed?",
            options: [
                "Force the change anyway",
                "Give up immediately",
                "Present data/evidence, listen to concerns, find compromise, and build consensus",
                "Complain to management"
            ],
            correctAnswer: 2,
            category: "Soft Skills",
            difficulty: "Hard",
            explanation: "Shows leadership, influence, and collaboration skills"
        },
        {
            question: "What is the difference between authentication and authorization?",
            options: [
                "They are the same thing",
                "Authentication verifies identity, authorization determines access rights",
                "Authorization verifies identity, authentication determines access rights",
                "Neither deals with security"
            ],
            correctAnswer: 1,
            category: "Technical",
            difficulty: "Medium",
            explanation: "Authentication confirms who you are, authorization confirms what you can access"
        }
    ];

    // Return the requested number of questions
    return questionBank.slice(0, Math.min(count, questionBank.length));
}

module.exports = interviewQuestions;
import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axios';
import { 
  Send, ArrowLeft, Code, Clock, MessageSquare, 
  Sparkles, User, Bot, CheckCircle2, Play,
  Target, Award, AlertCircle, Terminal, Zap,
  Brain, TrendingUp
} from 'lucide-react';

function TechnicalInterviewPage() {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [interviewStats, setInterviewStats] = useState({
    problemsSolved: 0,
    startTime: null,
    duration: 0
  });

  const messagesEndRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (interviewStarted && interviewStats.startTime) {
      timerRef.current = setInterval(() => {
        setInterviewStats(prev => ({
          ...prev,
          duration: Math.floor((Date.now() - prev.startTime) / 1000)
        }));
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [interviewStarted, interviewStats.startTime]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = async () => {
    setInterviewStarted(true);
    setInterviewStats({
      problemsSolved: 0,
      startTime: Date.now(),
      duration: 0
    });

    const welcomeMessage = {
      role: 'model',
      parts: [{ text: "Hello! I'm your AI Technical Interviewer. I'm excited to assess your problem-solving and coding skills today!\n\n**Here's how this interview will work:**\n\n1. I'll present you with coding problems of varying difficulty\n2. You can ask clarifying questions about the problem\n3. Share your approach and thought process\n4. Write your code solution\n5. I'll provide feedback and hints if needed\n6. We'll discuss time/space complexity\n\n**Let's start with a warm-up question:**\n\n**Problem: Two Sum**\n\nGiven an array of integers `nums` and an integer `target`, return indices of the two numbers that add up to `target`.\n\n**Example:**\n```\nInput: nums = [2,7,11,15], target = 9\nOutput: [0,1]\nExplanation: nums[0] + nums[1] = 2 + 7 = 9\n```\n\n**Constraints:**\n- Each input has exactly one solution\n- You cannot use the same element twice\n\nHow would you approach this problem? Feel free to ask clarifying questions or share your initial thoughts!" }]
    };

    setMessages([welcomeMessage]);
    setCurrentProblem("Two Sum");
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const newMessage = { 
      role: 'user', 
      parts: [{ text: inputValue }] 
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setInputValue('');

    try {
      const response = await axiosClient.post("/ai/technical-interview", {
        messages: updatedMessages,
        currentProblem: currentProblem,
        interviewStats: {
          problemsSolved: interviewStats.problemsSolved,
          duration: interviewStats.duration
        }
      });

      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: response.data.message }] 
      }]);

      // Check if new problem was introduced
      if (response.data.newProblem) {
        setCurrentProblem(response.data.newProblem);
      }

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: `I apologize for the technical difficulty. Let's continue - could you please share your approach again?` }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!codeInput.trim() || isLoading) return;

    const codeMessage = { 
      role: 'user', 
      parts: [{ text: `Here's my code solution:\n\n\`\`\`\n${codeInput}\n\`\`\`` }] 
    };
    
    const updatedMessages = [...messages, codeMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setShowCodeEditor(false);
    setCodeInput('');

    try {
      const response = await axiosClient.post("/ai/technical-interview", {
        messages: updatedMessages,
        currentProblem: currentProblem,
        codeSubmission: true,
        interviewStats: interviewStats
      });

      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: response.data.message }] 
      }]);

      if (response.data.problemSolved) {
        setInterviewStats(prev => ({
          ...prev,
          problemsSolved: prev.problemsSolved + 1
        }));
      }

      if (response.data.newProblem) {
        setCurrentProblem(response.data.newProblem);
      }

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: `Error evaluating code. Let's try again.` }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const endInterview = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/ai/technical-interview", {
        messages: [...messages, {
          role: 'user',
          parts: [{ text: '[SYSTEM: Request interview summary and technical assessment]' }]
        }],
        interviewStats: interviewStats,
        endInterview: true
      });

      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: response.data.message }] 
      }]);
    } catch (error) {
      console.error("Error ending interview:", error);
    } finally {
      setIsLoading(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        {/* Background */}
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Navigation */}
        <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <NavLink to="/interview" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Interview Hub</span>
            </NavLink>
          </div>
        </nav>

        {/* Pre-Interview Screen */}
        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mb-6 shadow-2xl">
              <Code className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Technical Interview Practice
            </h1>
            <p className="text-xl text-slate-400">
              Solve coding problems with real-time AI feedback
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-purple-400" />
              What to Expect
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-purple-400" />
                  Interview Format
                </h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2"></div>
                    <span>3-5 coding problems of increasing difficulty</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2"></div>
                    <span>Real-time code evaluation and feedback</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2"></div>
                    <span>Average duration: 45-60 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2"></div>
                    <span>Complexity analysis and optimization tips</span>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  Tips for Success
                </h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Think out loud - explain your approach</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Start with brute force, then optimize</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Ask clarifying questions about edge cases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Test your code with examples</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 text-center">
                <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-white mb-1">Problem Solving</div>
                <div className="text-xs text-slate-400">Approach & Logic</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                <Code className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-white mb-1">Clean Code</div>
                <div className="text-xs text-slate-400">Syntax & Style</div>
              </div>
              <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4 text-center">
                <Zap className="w-8 h-8 text-pink-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-white mb-1">Optimization</div>
                <div className="text-xs text-slate-400">Time & Space</div>
              </div>
            </div>

            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-white">Pro Tip:</span> This is a safe space to make mistakes and learn. 
                    Don't worry about getting everything perfect - focus on demonstrating your problem-solving process and 
                    willingness to learn!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button 
              onClick={startInterview}
              className="group relative inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-lg shadow-2xl shadow-purple-500/50 hover:shadow-purple-500/75 hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-6 h-6" />
              <span>Start Technical Interview</span>
              <ArrowLeft className="w-6 h-6 rotate-180 group-hover:translate-x-2 transition-transform" />
            </button>
            <p className="text-slate-400 text-sm mt-4">Ready to code? Let's begin!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Technical Interview</div>
                  <div className="text-xs text-slate-400">{currentProblem || "AI Coding Session"}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">{formatTime(interviewStats.duration)}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">{interviewStats.problemsSolved} Solved</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCodeEditor(!showCodeEditor)}
                className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 text-purple-400 rounded-lg font-semibold hover:bg-purple-500/30 transition-all text-sm flex items-center gap-2"
              >
                <Terminal className="w-4 h-4" />
                {showCodeEditor ? "Hide" : "Show"} Code Editor
              </button>
              <button 
                onClick={endInterview}
                className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all text-sm"
              >
                End Interview
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat Area */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Messages */}
            <div className="h-[calc(100vh-350px)] overflow-y-auto p-6 space-y-6">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                    msg.role === "user" 
                      ? "bg-gradient-to-br from-blue-500 to-cyan-500" 
                      : "bg-gradient-to-br from-purple-500 to-pink-500"
                  }`}>
                    {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                  </div>

                  {/* Message Bubble */}
                  <div className={`flex-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                    <div className={`inline-block max-w-[85%] px-6 py-4 rounded-2xl ${
                      msg.role === "user" 
                        ? "bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30" 
                        : "bg-slate-800/50 border border-slate-700"
                    }`}>
                      <p className="text-slate-100 whitespace-pre-wrap leading-relaxed">
                        {msg.parts[0].text}
                      </p>
                    </div>
                    <div className="text-xs text-slate-500 mt-2 px-2">
                      {msg.role === "user" ? "You" : "AI Interviewer"}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-800 p-6 bg-slate-900/50">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <textarea
                    placeholder="Ask questions, explain your approach, or request hints..."
                    className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none"
                    rows={2}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isLoading}
                  />
                </div>
                <button 
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-purple-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputValue.trim() || isLoading}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className={`bg-slate-900/30 border border-slate-800 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl transition-all ${showCodeEditor ? 'opacity-100' : 'opacity-50'}`}>
            <div className="border-b border-slate-800 p-4 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-purple-400" />
                <span className="font-semibold text-white">Code Editor</span>
              </div>
              <button 
                onClick={handleSubmitCode}
                disabled={!codeInput.trim() || isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg font-semibold text-white text-sm shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-4 h-4" />
                Submit Code
              </button>
            </div>
            <div className="p-6">
              <textarea
                placeholder="// Write your code here...\n// You can use any programming language\n\nfunction solution(input) {\n    // Your code\n}"
                className="w-full h-[calc(100vh-450px)] px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-xl text-emerald-400 placeholder-slate-600 focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 transition-all resize-none font-mono text-sm"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                disabled={!showCodeEditor || isLoading}
              />
              <p className="text-xs text-slate-500 mt-3">Press "Submit Code" when ready for AI review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TechnicalInterviewPage;
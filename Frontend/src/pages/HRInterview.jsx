import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axios';
import { 
  Send, ArrowLeft, Briefcase, Clock, MessageSquare, 
  Sparkles, User, Bot, Mic, Volume2, CheckCircle2,
  Target, TrendingUp, Award, AlertCircle
} from 'lucide-react';

function HRInterviewPage() {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [interviewStats, setInterviewStats] = useState({
    questionsAsked: 0,
    startTime: null,
    duration: 0
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
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
      questionsAsked: 0,
      startTime: Date.now(),
      duration: 0
    });

    const welcomeMessage = {
      role: 'model',
      parts: [{ text: "Hello! I'm your AI HR interviewer today. I'm excited to get to know you better!\n\nBefore we begin, let me explain how this will work:\n- I'll ask you behavioral and situational questions\n- Take your time to think before answering\n- Use the STAR method (Situation, Task, Action, Result) when relevant\n- Be honest and authentic in your responses\n\nLet's start with a classic question:\n\n**Tell me about yourself and why you're interested in this position.**" }]
    };

    setMessages([welcomeMessage]);
  };

  const onSubmit = async (data) => {
    if (!data.message.trim()) return;

    const newMessage = { 
      role: 'user', 
      parts: [{ text: data.message }] 
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    reset();

    try {
      const response = await axiosClient.post("/ai/hr-interview", {
        messages: updatedMessages,
        interviewStats: {
          questionsAsked: interviewStats.questionsAsked,
          duration: interviewStats.duration
        }
      });

      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: response.data.message }] 
      }]);

      setInterviewStats(prev => ({
        ...prev,
        questionsAsked: prev.questionsAsked + 1
      }));

    } catch (error) {
      console.error("API Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        parts: [{ text: `I apologize, but I'm experiencing technical difficulties. Let's try that again. Could you please repeat your answer?` }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const endInterview = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post("/ai/hr-interview", {
        messages: [...messages, {
          role: 'user',
          parts: [{ text: '[SYSTEM: Request interview summary and feedback]' }]
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
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
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
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-3xl mb-6 shadow-2xl">
              <Briefcase className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              HR Interview Practice
            </h1>
            <p className="text-xl text-slate-400">
              Practice behavioral questions with our AI interviewer
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-400" />
              What to Expect
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-400" />
                  Interview Format
                </h3>
                <ul className="space-y-2 text-slate-300 text-sm">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                    <span>Conversational Q&A with AI interviewer</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                    <span>5-10 behavioral questions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                    <span>Average duration: 20-30 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2"></div>
                    <span>Instant feedback at the end</span>
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
                    <span>Use the STAR method (Situation, Task, Action, Result)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Be specific with real examples</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Stay positive and confident</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                    <span>Take your time to think before answering</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-slate-300">
                    <span className="font-semibold text-white">Pro Tip:</span> Treat this like a real interview. 
                    Find a quiet space, sit up straight, and give thoughtful, detailed answers. The more you practice, 
                    the more confident you'll become!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <div className="text-center">
            <button 
              onClick={startInterview}
              className="group relative inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl font-bold text-lg shadow-2xl shadow-blue-500/50 hover:shadow-blue-500/75 hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-6 h-6" />
              <span>Start Interview</span>
              <ArrowLeft className="w-6 h-6 rotate-180 group-hover:translate-x-2 transition-transform" />
            </button>
            <p className="text-slate-400 text-sm mt-4">Click when you're ready to begin</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Header */}
      <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">HR Interview</div>
                  <div className="text-xs text-slate-400">AI Practice Session</div>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">{formatTime(interviewStats.duration)}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/50 border border-slate-800 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold text-white">{interviewStats.questionsAsked} Questions</span>
                </div>
              </div>
            </div>

            <button 
              onClick={endInterview}
              className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-400 rounded-lg font-semibold hover:bg-red-500/30 transition-all text-sm"
            >
              End Interview
            </button>
          </div>
        </div>
      </nav>

      {/* Chat Area */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-slate-900/30 border border-slate-800 rounded-2xl backdrop-blur-xl overflow-hidden shadow-2xl">
          {/* Messages */}
          <div className="h-[calc(100vh-300px)] overflow-y-auto p-6 space-y-6">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  msg.role === "user" 
                    ? "bg-gradient-to-br from-purple-500 to-pink-500" 
                    : "bg-gradient-to-br from-blue-500 to-cyan-500"
                }`}>
                  {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
                </div>

                {/* Message Bubble */}
                <div className={`flex-1 ${msg.role === "user" ? "text-right" : "text-left"}`}>
                  <div className={`inline-block max-w-[85%] px-6 py-4 rounded-2xl ${
                    msg.role === "user" 
                      ? "bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30" 
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
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="inline-block px-6 py-4 rounded-2xl bg-slate-800/50 border border-slate-700">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form 
            onSubmit={handleSubmit(onSubmit)} 
            className="border-t border-slate-800 p-6 bg-slate-900/50"
          >
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <textarea
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                  rows="3"
                  {...register("message", { 
                    required: true, 
                    minLength: 1,
                    validate: value => value.trim().length > 0
                  })}
                  disabled={isLoading}
                />
                {errors.message && (
                  <p className="text-red-400 text-xs mt-2">Please enter your answer</p>
                )}
              </div>
              <button 
                type="submit" 
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl font-semibold text-white shadow-lg hover:shadow-blue-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={errors.message || isLoading}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default HRInterviewPage;
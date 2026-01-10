import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router';
import axiosClient from '../utils/axios';
import { 
  ArrowLeft, Clock, Trophy, Target, Zap, CheckCircle2,
  XCircle, Award, TrendingUp, Brain, AlertCircle, ChevronRight,
  Star, BarChart3, Timer, RefreshCw
} from 'lucide-react';

function InterviewQuestionsPage() {
  const [stage, setStage] = useState('setup'); // setup, quiz, results
  const [questionsCount, setQuestionsCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizStats, setQuizStats] = useState({
    startTime: null,
    totalTime: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    skipped: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (stage === 'quiz' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleNextQuestion(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await axiosClient.post('/ai/interview-questions', {
        action: 'generate',
        questionsCount
      });

      setQuestions(response.data.questions);
      setStage('quiz');
      setTimeLeft(60); // 60 seconds per question
      setQuizStats({
        startTime: Date.now(),
        totalTime: 0,
        correctAnswers: 0,
        wrongAnswers: 0,
        skipped: 0
      });
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (optionIndex) => {
    setSelectedAnswer(optionIndex);
  };

  const handleNextQuestion = (autoSkip = false) => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const wasSkipped = autoSkip || selectedAnswer === null;

    // Record answer
    setAnswers([...answers, {
      questionIndex: currentQuestionIndex,
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      isCorrect: !wasSkipped && isCorrect,
      wasSkipped,
      timeTaken: 60 - timeLeft
    }]);

    // Update stats
    setQuizStats(prev => ({
      ...prev,
      correctAnswers: prev.correctAnswers + (isCorrect && !wasSkipped ? 1 : 0),
      wrongAnswers: prev.wrongAnswers + (!isCorrect && !wasSkipped ? 1 : 0),
      skipped: prev.skipped + (wasSkipped ? 1 : 0)
    }));

    // Move to next question or finish
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setTimeLeft(60);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const totalTime = Math.floor((Date.now() - quizStats.startTime) / 1000);
    const finalStats = {
      ...quizStats,
      totalTime
    };

    setQuizStats(finalStats);
    setStage('results');
    setIsLoading(true);

    try {
      const response = await axiosClient.post('/ai/interview-questions', {
        action: 'evaluate',
        stats: finalStats,
        answers,
        questions,
        questionsCount
      });

      setFeedback(response.data.feedback);
    } catch (error) {
      console.error('Error getting feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const restartQuiz = () => {
    setStage('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setAnswers([]);
    setTimeLeft(0);
    setQuizStats({
      startTime: null,
      totalTime: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      skipped: 0
    });
    setFeedback(null);
  };

  // Setup Screen
  if (stage === 'setup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <NavLink to="/interview" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Interview Hub</span>
            </NavLink>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl mb-6 shadow-2xl">
              <Brain className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Interview Questions Quiz
            </h1>
            <p className="text-xl text-slate-400">
              Test your knowledge with timed multiple choice questions
            </p>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8 backdrop-blur-xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Target className="w-6 h-6 text-emerald-400" />
              Quiz Settings
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-3">
                  Number of Questions
                </label>
                <div className="flex gap-4">
                  {[10, 20].map(count => (
                    <button
                      key={count}
                      onClick={() => setQuestionsCount(count)}
                      className={`flex-1 px-6 py-4 rounded-xl font-bold text-lg transition-all ${
                        questionsCount === count
                          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg shadow-emerald-500/50'
                          : 'bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50'
                      }`}
                    >
                      {count} Questions
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Timer className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-slate-300">
                      <span className="font-semibold text-white">Time Limit:</span> You'll have 60 seconds 
                      per question. Questions will auto-submit when time runs out.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white">Duration</span>
                  </div>
                  <p className="text-slate-400">~{questionsCount} minutes</p>
                </div>
                <div className="bg-slate-800/30 border border-slate-700 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    <span className="font-semibold text-white">Difficulty</span>
                  </div>
                  <p className="text-slate-400">Mixed (Easy to Hard)</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <button 
              onClick={startQuiz}
              disabled={isLoading}
              className="group relative inline-flex items-center gap-3 px-12 py-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl font-bold text-lg shadow-2xl shadow-emerald-500/50 hover:shadow-emerald-500/75 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-6 h-6" />
              <span>{isLoading ? 'Loading Questions...' : 'Start Quiz'}</span>
              <ChevronRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Screen
  if (stage === 'quiz' && questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Header */}
        <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-sm font-bold text-white">
                  Question {currentQuestionIndex + 1} / {questions.length}
                </div>
                <div className="h-2 w-32 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${
                timeLeft <= 10 
                  ? 'bg-red-500/20 border-2 border-red-500 text-red-400 animate-pulse' 
                  : 'bg-slate-900/50 border border-slate-700 text-white'
              }`}>
                <Clock className="w-5 h-5" />
                <span className="text-lg">{formatTime(timeLeft)}</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Question */}
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-semibold mb-4">
                <Target className="w-4 h-4" />
                {currentQuestion.category}
              </div>
              <h2 className="text-2xl font-bold text-white leading-relaxed">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full text-left px-6 py-4 rounded-xl transition-all ${
                    selectedAnswer === index
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 border-2 border-emerald-400 shadow-lg'
                      : 'bg-slate-800/50 border-2 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                      selectedAnswer === index
                        ? 'bg-white text-emerald-600'
                        : 'bg-slate-700 text-slate-400'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-slate-100">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => handleNextQuestion(true)}
                className="px-6 py-3 bg-slate-800/50 border border-slate-700 text-slate-400 rounded-xl font-semibold hover:bg-slate-800 hover:text-white transition-all"
              >
                Skip Question
              </button>
              <button
                onClick={() => handleNextQuestion(false)}
                disabled={selectedAnswer === null}
                className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                <ChevronRight className="w-5 h-5 inline ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Screen
  if (stage === 'results') {
    const score = ((quizStats.correctAnswers / questionsCount) * 100).toFixed(1);
    const accuracy = quizStats.correctAnswers / (questionsCount - quizStats.skipped) * 100 || 0;
    
    let performanceLevel = '';
    let performanceColor = '';
    if (score >= 80) {
      performanceLevel = 'Excellent';
      performanceColor = 'text-emerald-400';
    } else if (score >= 60) {
      performanceLevel = 'Good';
      performanceColor = 'text-blue-400';
    } else if (score >= 40) {
      performanceLevel = 'Average';
      performanceColor = 'text-yellow-400';
    } else {
      performanceLevel = 'Needs Improvement';
      performanceColor = 'text-red-400';
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
        <div className="fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <nav className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <NavLink to="/interview" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Interview Hub</span>
            </NavLink>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Score Card */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full mb-6 shadow-2xl">
              <Trophy className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-5xl font-black mb-2">Quiz Complete!</h1>
            <p className={`text-2xl font-bold ${performanceColor}`}>{performanceLevel}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
              <div className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                {score}%
              </div>
              <div className="text-sm text-slate-400">Score</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-black text-emerald-400 mb-2">
                <CheckCircle2 className="w-8 h-8" />
                {quizStats.correctAnswers}
              </div>
              <div className="text-sm text-slate-400">Correct</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-black text-red-400 mb-2">
                <XCircle className="w-8 h-8" />
                {quizStats.wrongAnswers}
              </div>
              <div className="text-sm text-slate-400">Wrong</div>
            </div>
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 text-center">
              <div className="flex items-center justify-center gap-2 text-3xl font-black text-slate-400 mb-2">
                <Clock className="w-8 h-8" />
                {formatTime(quizStats.totalTime)}
              </div>
              <div className="text-sm text-slate-400">Time</div>
            </div>
          </div>

          {/* AI Feedback */}
          {isLoading ? (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl text-center">
              <div className="inline-flex items-center gap-3 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating personalized feedback...
              </div>
            </div>
          ) : feedback && (
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-xl mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Star className="w-6 h-6 text-yellow-400" />
                AI Performance Analysis
              </h2>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {feedback}
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={restartQuiz}
              className="flex-1 px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all"
            >
              <RefreshCw className="w-5 h-5 inline mr-2" />
              Try Again
            </button>
            <NavLink
              to="/interview"
              className="flex-1 px-8 py-4 bg-slate-800/50 border border-slate-700 rounded-xl font-bold text-center hover:bg-slate-800 transition-all"
            >
              Back to Hub
            </NavLink>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default InterviewQuestionsPage;
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuth } from '../authslice';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from "../utils/axios";
import SubmissionHistory from "../components/SumbissionHistory";
import ChatAi from '../components/ChatAI';
import Editorial from '../components/Editorial';
import TopUsersLeaderboard from "./TopUsersLeaderboard";
import { 
  ThumbsUp, ThumbsDown, Bookmark, Share2, ChevronDown, 
  Play, Send, Settings, Maximize2, RotateCcw, Copy,
  CheckCircle, XCircle, Clock, Zap, TrendingUp, Award,
  FileText, MessageSquare, Users, BookOpen, Code2
} from 'lucide-react';

const ProblemPage = () => {
  const dispatch = useDispatch();
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeBottomTab, setActiveBottomTab] = useState('testcase');
  const [showTestCases, setShowTestCases] = useState(true);
  const [fontSize, setFontSize] = useState(14);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const editorRef = useRef(null);
  let {id} = useParams();

  // ❌ REMOVE THIS LINE
  // const { handleSubmit } = useForm();

  useEffect(() => {
    const fetchProblem = async () => {
      setLoading(true);
      try {
        const response = await axiosClient.get(`/problem/${id}`);
        setProblem(response.data);
        
        if (response.data.startcode && response.data.startcode.length > 0) {
          const initialCode = response.data.startcode.find((sc) => {
            if (sc.language === "C++" && selectedLanguage === 'cpp') return true;
            if (sc.language === "Java" && selectedLanguage === 'java') return true;
            if (sc.language === "JavaScript" && selectedLanguage === 'javascript') return true;
            return false;
          });
          setCode(initialCode?.intialcode || initialCode?.initialCode || '');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching problem:', error);
        setLoading(false);
      }
      console.log('Fetched problem data:', problem)
    };

    if (id) {
      fetchProblem();
    }
  }, [id]);

  useEffect(() => {
    if (problem && problem.startcode && problem.startcode.length > 0) {
      const codeForLanguage = problem.startcode.find(sc => {
        if (sc.language === "C++" && selectedLanguage === 'cpp') return true;
        if (sc.language === "Java" && selectedLanguage === 'java') return true;
        if (sc.language === "JavaScript" && selectedLanguage === 'javascript') return true;
        return false;
      });
      setCode(codeForLanguage?.intialcode || codeForLanguage?.initialCode || '');
    }
  }, [selectedLanguage, problem]);

  const handleEditorChange = (value) => {
    setCode(value || '');
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
  };

  const handleRun = async () => {
    setLoading(true);
    setRunResult(null);
    
    try {
      const response = await axiosClient.post(`/sumbit/run/${id}`, {
        code: code,
        language: selectedLanguage
      });

      setRunResult(response.data);
      setLoading(false);
      setShowTestCases(true);
      setActiveBottomTab('testcase');
    } catch (error) {
      console.error('Error running code:', error);
      setRunResult({
        success: false,
        error: 'Internal server error'
      });
      setLoading(false);
      setShowTestCases(true);
      setActiveBottomTab('testcase');
    }
  };

  // ✅ FIXED VERSION
  
const handleSubmitCode = async () => {
  console.log('🔵 1. Submit button clicked - START');
  console.log('🔵 Current submitResult:', submitResult);
  console.log('🔵 Current activeBottomTab:', activeBottomTab);
  
  setLoading(true);
  setSubmitResult(null);
  
  try {
    console.log('🔵 2. Sending POST request...');
    const response = await axiosClient.post(`/sumbit/Sumbit/${id}`, {
      code: code,
      language: selectedLanguage
    });
    
    console.log('🔵 3. Response received:', response.data);
    
    console.log('🔵 4. Setting submitResult state...');
    setSubmitResult(response.data);
    
    console.log('🔵 5. Setting loading to false...');
    setLoading(false);
    
    console.log('🔵 6. Setting showTestCases to true...');
    setShowTestCases(true);
    
    console.log('🔵 7. Setting activeBottomTab to result...');
    setActiveBottomTab('result');
    
    console.log('🔵 8. All states set. Result should be visible now.');

    if (response.data.accepted) {
      console.log('🔵 9. Problem accepted, calling /solved endpoint...');
      
      axiosClient.post(`/problem/${id}/solved`, {
        timeTaken: 0,
        language: selectedLanguage
      }).then(() => {
        console.log('🔵 10. Stats updated successfully - NO checkAuth called');
      }).catch(err => {
        console.warn('⚠️ Stats update failed:', err);
      });
    } else {
      console.log('🔵 9. Problem not accepted, skipping /solved endpoint');
    }
    
    console.log('🔵 11. handleSubmitCode COMPLETE - function ended');
    
  } catch (error) {
    console.error('❌ Error submitting code:', error);
    setSubmitResult({
      accepted: false,
      error: error.response?.data?.error || 'Submission failed'
    });
    setLoading(false);
    setShowTestCases(true);
    setActiveBottomTab('result');
  }
};





















































  const getLanguageForMonaco = (lang) => {
    switch (lang) {
      case 'javascript': return 'javascript';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: return 'javascript';
    }
  };

  const getDifficultyColor = (difficulity) => {
    switch (difficulity) {
      case 'easy': return 'text-emerald-500';
      case 'medium': return 'text-amber-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (loading && !problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading problem...</p>
        </div>
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-600 dark:text-slate-400">Problem not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-slate-950">
      {/* ... rest of your JSX stays exactly the same ... */}
      {/* I'm keeping the rest identical to save space */}
      
      {/* Just make sure your submit button looks like this: */}
      {/* 
      <button
        onClick={handleSubmitCode}
        disabled={loading}
        className="px-4 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send className="w-3.5 h-3.5 inline mr-1.5" />
        {loading ? 'Submitting...' : 'Submit'}
      </button>
      */}
      
      {/* TOP NAVIGATION (copy from your original) */}
      <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-sm font-medium text-slate-900 dark:text-white">Problem List</h1>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Maximize2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - Keep all your existing code */}
      {/* Copy the rest from your original file */}
      {/* I'm truncating here to focus on the fix */}
    </div>
  );
};

export default ProblemPage;
import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { checkAuth } from '../authslice';
import { useForm } from 'react-hook-form';
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

  const { handleSubmit } = useForm();

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

  // ✅ FIXED - Removed dispatch(checkAuth()) to prevent page refresh
  const handleSubmitCode = async () => {
    setLoading(true);
    setSubmitResult(null);
    
    try {
      const response = await axiosClient.post(`/sumbit/Sumbit/${id}`, {
        code: code,
        language: selectedLanguage
      });
      
      setSubmitResult(response.data);
      setLoading(false);
      setShowTestCases(true);
      setActiveBottomTab('result');

      if (response.data.accepted) {
        try {
          await axiosClient.post(`/problem/${id}/solved`, {
            timeTaken: 0,
            language: selectedLanguage
          });
          
          // ✅ FIXED: Call checkAuth in background after delay so result stays visible
          setTimeout(() => {
            dispatch(checkAuth());
          }, 2000);
          
          // console.log("✅ Problem marked as solved and stats will update!");
          
        } catch (solveError) {
          console.error('Error marking problem as solved:', solveError);
        }
      }
      
    } catch (error) {
      console.error('Error submitting code:', error);
      setSubmitResult({
        accepted: false,
        error: error.response?.data?.error || 'Submission failed',
        testcasespassed: 0,
        testcasestotal: 0
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
      {/* Top Navigation Bar */}
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

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Problem Description */}
        <div className="w-[45%] flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
          {/* Tabs */}
          <div className="flex items-center h-11 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 gap-1">
            {[
              { id: 'description', label: 'Description', icon: FileText },
              { id: 'editorial', label: 'Editorial', icon: BookOpen },
              { id: 'solutions', label: 'Solutions', icon: Code2 },
              { id: 'submissions', label: 'Submissions', icon: TrendingUp },
              { id: 'chatAI', label: 'AI Help', icon: MessageSquare },
              { id: 'leaderboard', label: 'Leaderboard', icon: Award }
            ].map(tab => (
              <button
                key={tab.id}
                className={`px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                  activeLeftTab === tab.id
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
                onClick={() => setActiveLeftTab(tab.id)}
              >
                <tab.icon className="w-3.5 h-3.5 inline mr-1.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {problem && activeLeftTab === 'description' && (
              <div className="space-y-6">
                {/* Title and Actions */}
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
                    {problem.title}
                  </h1>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${getDifficultyColor(problem.difficulity)}`}>
                        {problem.difficulity.charAt(0).toUpperCase() + problem.difficulity.slice(1)}
                      </span>
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setLiked(!liked)}
                          className={`flex items-center gap-1 ${liked ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'} hover:text-blue-500`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="text-xs">124</span>
                        </button>
                        <button 
                          onClick={() => setDisliked(!disliked)}
                          className={`flex items-center gap-1 ${disliked ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'} hover:text-red-500`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                          <span className="text-xs">12</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setBookmarked(!bookmarked)}
                        className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 ${bookmarked ? 'text-yellow-500' : 'text-slate-500 dark:text-slate-400'}`}
                      >
                        <Bookmark className="w-4 h-4" fill={bookmarked ? "currentColor" : "none"} />
                      </button>
                      <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {problem.tags && (
                    <div className="flex flex-wrap gap-2">
                      {typeof problem.tags === 'string' && problem.tags.split(',').map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                      {Array.isArray(problem.tags) && problem.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded">
                          {typeof tag === 'string' ? tag : tag.name || ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {problem.description}
                  </p>
                </div>

                {/* Examples */}
                <div className="space-y-4">
                  {problem.visibletestcases && problem.visibletestcases.length > 0 && problem.visibletestcases.map((example, index) => (
                    <div key={index} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800">
                      <div className="font-semibold text-sm text-slate-900 dark:text-white mb-3">
                        Example {index + 1}:
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Input: </span>
                          <code className="text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {example.input}
                          </code>
                        </div>
                        <div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">Output: </span>
                          <code className="text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                            {example.output}
                          </code>
                        </div>
                        {example.explaination && (
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">Explanation: </span>
                            <span className="text-slate-600 dark:text-slate-400">{example.explaination}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Constraints */}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white mb-2">Constraints:</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <li>All test cases are valid.</li>
                    <li>Follow-up: Can you solve it in O(n) time complexity?</li>
                  </ul>
                </div>
              </div>
            )}

            {activeLeftTab === 'editorial' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Editorial</h2>
                <Editorial 
                  secureUrl={problem?.secureUrl} 
                  thumbnailUrl={problem?.thumbnailUrl} 
                  duration={problem?.duration}
                />
              </div>
            )}

            {activeLeftTab === 'solutions' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Solutions</h2>
                {problem?.refrenceSoluation?.map((solution, index) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="px-4 py-3 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                      <h3 className="font-medium text-sm text-slate-900 dark:text-white">{solution?.language}</h3>
                    </div>
                    <pre className="p-4 text-xs overflow-x-auto">
                      <code className="text-slate-700 dark:text-slate-300">{solution?.completeCode}</code>
                    </pre>
                  </div>
                )) || <p className="text-slate-500 text-center py-8">Solutions available after solving.</p>}
              </div>
            )}

            {activeLeftTab === 'submissions' && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">My Submissions</h2>
                <SubmissionHistory problemId={id} />
              </div>
            )}

            {activeLeftTab === 'chatAI' && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">AI Assistant</h2>
                <ChatAi problem={problem} />
              </div>
            )}

            {activeLeftTab === 'leaderboard' && (
              <TopUsersLeaderboard />
            )}
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="flex-1 flex flex-col bg-slate-950">
          {/* Editor Header */}
          <div className="h-11 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <select 
                value={selectedLanguage}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 text-white rounded hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="javascript">JavaScript</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                <Copy className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white">
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setFontSize(prev => Math.max(10, prev - 2))}
                className="px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded"
              >
                A-
              </button>
              <button 
                onClick={() => setFontSize(prev => Math.min(20, prev + 2))}
                className="px-2 py-1 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded"
              >
                A+
              </button>
            </div>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1">
            <Editor
              height="100%"
              language={getLanguageForMonaco(selectedLanguage)}
              value={code}
              onChange={handleEditorChange}
              onMount={handleEditorDidMount}
              theme="vs-dark"
              options={{
                fontSize: fontSize,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                lineNumbers: 'on',
                folding: true,
                renderLineHighlight: 'line',
                selectOnLineNumbers: true,
                padding: { top: 16, bottom: 16 },
              }}
            />
          </div>

          {/* Bottom Console Area */}
          {showTestCases && (
            <div className="h-64 border-t border-slate-800 bg-slate-900 flex flex-col">
              {/* Console Tabs */}
              <div className="h-10 flex items-center justify-between px-4 border-b border-slate-800">
                <div className="flex items-center gap-1">
                  {[
                    { id: 'testcase', label: 'Testcase' },
                    { id: 'result', label: 'Result' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                        activeBottomTab === tab.id
                          ? 'bg-slate-800 text-white'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                      }`}
                      onClick={() => setActiveBottomTab(tab.id)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setShowTestCases(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* Console Content */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {activeBottomTab === 'testcase' && runResult && (
                  <div className="space-y-3">
                    {runResult.error && (
                      <div className="bg-red-900/20 border border-red-500 rounded p-3 mb-3">
                        <div className="flex items-center gap-2 text-red-400 mb-2">
                          <XCircle className="w-5 h-5" />
                          <span className="font-semibold">Compilation/Runtime Error</span>
                        </div>
                        <pre className="text-xs text-red-300 whitespace-pre-wrap">{runResult.error}</pre>
                      </div>
                    )}
                    {runResult.success ? (
                      <>
                        <div className="flex items-center gap-2 text-emerald-400 mb-3">
                          <CheckCircle className="w-5 h-5" />
                          <span className="font-semibold">All Tests Passed</span>
                        </div>
                        {runResult.testCases.map((tc, i) => (
                          <div key={i} className="bg-slate-950 rounded p-3 text-xs space-y-2">
                            <div className="flex justify-between text-slate-400">
                              <span>Test Case {i + 1}</span>
                              <span className="text-emerald-400">✓ Passed</span>
                            </div>
                            <div>
                              <div className="text-slate-500">Input:</div>
                              <div className="text-white font-mono">{tc.stdin}</div>
                            </div>
                            <div>
                              <div className="text-slate-500">Output:</div>
                              <div className="text-white font-mono">{tc.stdout}</div>
                            </div>
                            <div>
                              <div className="text-slate-500">Expected:</div>
                              <div className="text-white font-mono">{tc.expected_output}</div>
                            </div>
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-red-400 mb-3">
                          <XCircle className="w-5 h-5" />
                          <span className="font-semibold">Wrong Answer</span>
                        </div>
                        {runResult?.testCases?.map((tc, i) => (
                          <div key={i} className={`bg-slate-950 rounded p-3 text-xs space-y-2 ${tc.status_id != 3 ? 'border-l-2 border-red-500' : ''}`}>
                            <div className="flex justify-between text-slate-400">
                              <span>Test Case {i + 1}</span>
                              <span className={tc.status_id == 3 ? 'text-emerald-400' : 'text-red-400'}>
                                {tc.status_id == 3 ? '✓ Passed' : '✗ Failed'}
                              </span>
                            </div>
                            <div>
                              <div className="text-slate-500">Input:</div>
                              <div className="text-white font-mono">{tc.stdin}</div>
                            </div>
                            <div>
                              <div className="text-slate-500">Output:</div>
                              <div className="text-white font-mono">{tc.stdout}</div>
                            </div>
                            <div>
                              <div className="text-slate-500">Expected:</div>
                              <div className="text-white font-mono">{tc.expected_output}</div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {activeBottomTab === 'result' && submitResult && (
                  <div>
                    {submitResult.accepted ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-emerald-400 text-lg">
                          <CheckCircle className="w-6 h-6" />
                          <span className="font-bold">Accepted</span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-slate-950 rounded-lg p-3 text-center">
                            <div className="text-slate-400 text-xs mb-1">Runtime</div>
                            <div className="text-white font-semibold">{submitResult.runtime} ms</div>
                          </div>
                          <div className="bg-slate-950 rounded-lg p-3 text-center">
                            <div className="text-slate-400 text-xs mb-1">Memory</div>
                            <div className="text-white font-semibold">{submitResult.memory} KB</div>
                          </div>
                          <div className="bg-slate-950 rounded-lg p-3 text-center">
                            <div className="text-slate-400 text-xs mb-1">Test Cases</div>
                            <div className="text-white font-semibold">{submitResult.testcasespassed}/{submitResult.testcasestotal}</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-red-400 text-lg">
                          <XCircle className="w-6 h-6" />
                          <span className="font-bold">{submitResult.error || 'Wrong Answer'}</span>
                        </div>
                        <div className="bg-slate-950 rounded-lg p-3">
                          <div className="text-slate-400 text-xs mb-1">Test Cases Passed</div>
                          <div className="text-white font-semibold">{submitResult.testcasespassed}/{submitResult.testcasestotal}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeBottomTab === 'testcase' && !runResult && (
                  <div className="text-center text-slate-500 py-8">
                    <p className="text-sm">Run your code to see test results</p>
                  </div>
                )}

                {activeBottomTab === 'result' && !submitResult && (
                  <div className="text-center text-slate-500 py-8">
                    <p className="text-sm">Submit your code to see results</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="h-12 bg-slate-900 border-t border-slate-800 flex items-center justify-between px-4">
            <button 
              onClick={() => setShowTestCases(!showTestCases)}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${showTestCases ? 'rotate-180' : ''}`} />
              Console
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRun}
                disabled={loading}
                className="px-4 py-1.5 text-sm font-medium bg-slate-800 hover:bg-slate-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Play className="w-3.5 h-3.5 inline mr-1.5" />
                {loading ? 'Running...' : 'Run'}
              </button>
              <button
                type="button"
                onClick={handleSubmitCode}
                disabled={loading}
                className="px-4 py-1.5 text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-3.5 h-3.5 inline mr-1.5" />
                {loading ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemPage;
import { Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Signup from './pages/signup';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from './authslice';
import { useEffect } from 'react';
import ProblemPage from './pages/problempage';
import Admin from './pages/Admin';
import Home from "./pages/homepage"
import AdminPanel from "./components/AdminPannel"
import AdminDelete from "./components/AdminDelete";
import AdminUpload from "./components/AdminUpload"
import AdminVideo from './components/AdminVideo';
import Profile from './pages/Profile';
import TrackProgress from './pages/TrackProgress';
import Community from './pages/Community';
import CompetitionLobby from './pages/CompetitionLobby';
import DSAVisualizer from './pages/DSAVisualizer';
import CompetitionRoom from './pages/CompetitionRoom';
import Contests from './pages/contests';
import InterviewPage from './pages/Interview';
import HRInterviewPage from "./pages/HRInterview"
import TechnicalInterviewPage from "./pages/technicalInterview"
import InterviewQuestionsPage from "./pages/Interview_Q"
import LandingPage from './pages/landingpage'

// ✅ CLIPBOARD POLYFILL - Add this before the component
if (!window.navigator.clipboard) {
  console.warn('⚠️ Clipboard API not available (likely HTTP instead of HTTPS). Using fallback.');
  window.navigator.clipboard = {
    writeText: (text) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.left = '-999999px';
      textarea.style.top = '-999999px';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      
      return new Promise((resolve, reject) => {
        try {
          const successful = document.execCommand('copy');
          document.body.removeChild(textarea);
          if (successful) {
            resolve();
          } else {
            reject(new Error('Copy command failed'));
          }
        } catch (err) {
          document.body.removeChild(textarea);
          reject(err);
        }
      });
    },
    
    readText: () => {
      return Promise.reject(new Error('Clipboard read requires HTTPS'));
    },
    
    write: (data) => {
      // Monaco Editor sometimes calls this
      return Promise.resolve();
    },
    
    read: () => {
      return Promise.reject(new Error('Clipboard read requires HTTPS'));
    }
  };
}

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);
 
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Landing Page - Public */}
        <Route path="/landing" element={<LandingPage />} />
        
        {/* Public Routes - Only accessible when NOT authenticated */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/" /> : <Signup />} />
        
        {/* Protected Routes - Only accessible when authenticated */}
        <Route path="/" element={isAuthenticated ? <Home /> : <Navigate to="/landing" />} />
        
        {/* Admin Routes - Only for authenticated admins */}
        <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/landing" />} />
        <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/landing" />} />
        <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/landing" />} />
        <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/landing" />} />
        <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/landing" />} />
        
        {/* Problem Routes - Protected */}
        <Route path='/problem/:id' element={isAuthenticated ? <ProblemPage /> : <Navigate to="/landing" />} />
        
        {/* Profile Routes - Protected */}
        <Route path="/profile/:userId" element={isAuthenticated ? <Profile /> : <Navigate to="/landing" />} />
        <Route path="/profile/:userId/progress" element={isAuthenticated ? <TrackProgress /> : <Navigate to="/landing" />} />
        
        {/* Community - Protected */}
        <Route path="/community" element={isAuthenticated ? <Community /> : <Navigate to="/landing" />} />
        
        {/* Competition Routes - Protected */}
        <Route path="/competition" element={isAuthenticated ? <CompetitionLobby /> : <Navigate to="/landing" />} />
        <Route path="/competition/:roomId" element={isAuthenticated ? <CompetitionRoom /> : <Navigate to="/landing" />} />
        
        {/* DSA Visualizer - Protected */}
        <Route path="/visualizer" element={isAuthenticated ? <DSAVisualizer /> : <Navigate to="/landing" />} />

        {/* Practice & Interview Routes - Protected */}
        <Route path="/contests" element={isAuthenticated ? <Contests /> : <Navigate to="/landing" />} />
        <Route path="/interview" element={isAuthenticated ? <InterviewPage /> : <Navigate to="/landing" />} />
        <Route path="/hr-interview" element={isAuthenticated ? <HRInterviewPage /> : <Navigate to="/landing" />} />
        <Route path="/technical-interview" element={isAuthenticated ? <TechnicalInterviewPage /> : <Navigate to="/landing" />} />
        <Route path="/interview-questions" element={isAuthenticated ? <InterviewQuestionsPage /> : <Navigate to="/landing" />} />
        
        {/* Catch all - redirect to landing if not authenticated, home if authenticated */}
        <Route path="*" element={isAuthenticated ? <Navigate to="/" /> : <Navigate to="/landing" />} />
      </Routes>
    </>
  )
}

export default App;
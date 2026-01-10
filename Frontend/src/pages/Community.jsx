import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosClient from '../utils/axios';
import PostCard from "../components/PostCards"
import CreatePost from "../components/CreatePost";

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    fetchPosts();
  }, [activeTab, page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get(`/api/community/posts?page=${page}&limit=10`);
      
      console.log('Posts Response:', response.data);
      
      if (response.data.success) {
        setPosts(response.data.data);
        setHasMore(response.data.pagination?.hasMore || false);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  const handleCreatePost = async (postData) => {
    try {
      const response = await axiosClient.post('/api/community/posts', postData);
      console.log('Create Post Response:', response.data);
      
      if (response.data.success) {
        setPosts([response.data.data, ...posts]);
        setShowCreatePost(false);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await axiosClient.post(`/api/community/posts/${postId}/like`);
      console.log('Like Response:', response.data);
      
      if (response.data.success) {
        setPosts(posts.map(post => 
          post._id === postId 
            ? { ...post, likes: response.data.data.isLiked 
                ? [...(post.likes || []), user._id] 
                : (post.likes || []).filter(id => id !== user._id) }
            : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await axiosClient.delete(`/api/community/posts/${postId}`);
      console.log('Delete Response:', response.data);
      
      if (response.data.success) {
        setPosts(posts.filter(post => post._id !== postId));
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  // ✅ ADD THIS NEW FUNCTION
  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <div className="border-b border-slate-800/50 backdrop-blur-xl bg-slate-950/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              👥 Community
            </h1>
          </div>
          <button 
            onClick={() => setShowCreatePost(true)}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold hover:from-blue-600 hover:to-purple-600 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Post
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl border border-slate-800 p-2 flex gap-2">
              {[
                { id: 'all', label: 'All Posts', icon: '🌐' },
                { id: 'following', label: 'Following', icon: '👥' },
                { id: 'myPosts', label: 'My Posts', icon: '📝' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setPage(1);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Posts Feed */}
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-900/50 rounded-xl p-6 border border-slate-800 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-slate-800 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-slate-800 rounded w-32 mb-2"></div>
                        <div className="h-3 bg-slate-800 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-20 bg-slate-800 rounded"></div>
                  </div>
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-slate-900/50 rounded-xl p-16 border border-slate-800 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
                <p className="text-slate-400 mb-6">Be the first to share your thoughts with the community!</p>
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all"
                >
                  Create Your First Post
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUser={user}
                    onLike={handleLikePost}
                    onDelete={handleDeletePost}
                    onUserClick={handleUserClick} // ✅ ADD THIS PROP
                  />
                ))}
              </div>
            )}

            {/* Load More */}
            {hasMore && !loading && posts.length > 0 && (
              <button
                onClick={() => setPage(page + 1)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium transition-all"
              >
                Load More Posts
              </button>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* User Profile Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-slate-800">
              <div className="flex items-center gap-4 mb-4">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.firstname}`}
                  alt="Profile"
                  className="w-16 h-16 rounded-full border-2 border-blue-500/30"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{user?.firstname} {user?.lastname}</h3>
                  <p className="text-sm text-slate-400">@{user?.firstname?.toLowerCase()}</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/profile/${user?._id}`)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 font-medium transition-all"
              >
                View Profile
              </button>
            </div>

            {/* Stats Card */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📊</span>
                Your Activity
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Posts Created</span>
                  <span className="text-white font-semibold">{posts.filter(p => p.author._id === user?._id).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Total Likes Given</span>
                  <span className="text-white font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Comments</span>
                  <span className="text-white font-semibold">0</span>
                </div>
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🔥</span>
                Trending Topics
              </h3>
              <div className="space-y-3">
                {['Array', 'Dynamic Programming', 'Graphs', 'Trees', 'Binary Search'].map(tag => (
                  <button
                    key={tag}
                    className="w-full text-left px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-all flex items-center justify-between group"
                  >
                    <span>#{tag}</span>
                    <span className="text-xs text-slate-500 group-hover:text-slate-400">
                      {Math.floor(Math.random() * 50) + 10} posts
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-slate-800">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>⚡</span>
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full text-left px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Post
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full text-left px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Back to Problems
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onCreate={handleCreatePost}
        />
      )}
    </div>
  );
};

export default Community;
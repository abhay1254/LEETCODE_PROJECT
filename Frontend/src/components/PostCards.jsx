// src/components/community/PostCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, currentUser, onLike, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  
  const isLiked = post.likes?.includes(currentUser?._id);
  const isAuthor = post.author._id === currentUser?._id;

  const handleAuthorClick = () => {
    navigate(`/profile/${post.author._id}`);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={handleAuthorClick}
        >
          <img
            src={post.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.firstname}`}
            alt={post.author.firstname}
            className="w-12 h-12 rounded-full border-2 border-slate-700 group-hover:border-blue-500 transition-colors"
          />
          <div>
            <h4 className="text-white font-semibold group-hover:text-blue-400 transition-colors">
              {post.author.firstname} {post.author.lastname}
            </h4>
            <p className="text-sm text-slate-400">
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
              {post.isEdited && <span className="ml-2">(edited)</span>}
            </p>
          </div>
        </div>

        {/* Menu */}
        {isAuthor && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-800 rounded-lg transition-all"
            >
              <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
              </svg>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10">
                <button
                  onClick={() => {
                    onDelete(post._id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-slate-700 rounded-lg transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title */}
      {post.title && (
        <h3 className="text-xl font-bold text-white mb-3 hover:text-blue-400 cursor-pointer transition-colors">
          {post.title}
        </h3>
      )}

      {/* Content */}
      <p className="text-slate-300 mb-4 whitespace-pre-wrap leading-relaxed">
        {post.content}
      </p>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-sm border border-blue-500/30 hover:bg-blue-500/20 cursor-pointer transition-all"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-slate-800">
        {/* Like Button */}
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center gap-2 transition-all ${
            isLiked 
              ? 'text-red-400' 
              : 'text-slate-400 hover:text-red-400'
          }`}
        >
          <svg 
            className="w-5 h-5" 
            fill={isLiked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
            />
          </svg>
          <span className="font-medium">{post.likes?.length || 0}</span>
        </button>

        {/* Comment Button */}
        <button
          className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
            />
          </svg>
          <span className="font-medium">{post.comments?.length || 0}</span>
        </button>

        {/* Share Button */}
        <button className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-all ml-auto">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
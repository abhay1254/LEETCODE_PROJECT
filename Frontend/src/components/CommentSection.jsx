// src/components/community/CommentSection.jsx
import { useState } from 'react';

const CommentSection = ({ postId, comments, currentUser, onAddComment, onDeleteComment, onLikeComment }) => {
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setLoading(true);
    await onAddComment({
      content: commentText.trim(),
      parentComment: replyTo
    });
    setCommentText('');
    setReplyTo(null);
    setLoading(false);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-slate-800">
      <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Comments ({comments?.length || 0})
      </h3>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-6">
        {replyTo && (
          <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
            <span>Replying to comment</span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-red-400 hover:text-red-300"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <img
            src={currentUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.firstname}`}
            alt="Your avatar"
            className="w-10 h-10 rounded-full border-2 border-slate-700"
          />
          <div className="flex-1">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows="3"
              maxLength={2000}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-slate-500">{commentText.length}/2000</span>
              <button
                type="submit"
                disabled={loading || !commentText.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting...' : 'Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <CommentCard
              key={comment._id}
              comment={comment}
              currentUser={currentUser}
              onDelete={onDeleteComment}
              onLike={onLikeComment}
              onReply={() => setReplyTo(comment._id)}
            />
          ))
        ) : (
          <div className="text-center py-8 text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No comments yet. Be the first to comment!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CommentCard = ({ comment, currentUser, onDelete, onLike, onReply }) => {
  const isAuthor = comment.author._id === currentUser?._id;
  const isLiked = comment.likes?.includes(currentUser?._id);

  return (
    <div className="flex gap-3 group">
      <img
        src={comment.author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.firstname}`}
        alt={comment.author.firstname}
        className="w-10 h-10 rounded-full border-2 border-slate-700"
      />
      <div className="flex-1">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="font-semibold text-white">{comment.author.firstname} {comment.author.lastname}</span>
              <span className="text-sm text-slate-400 ml-2">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            {isAuthor && (
              <button
                onClick={() => onDelete(comment._id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/10 rounded text-red-400 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-slate-300 whitespace-pre-wrap">{comment.content}</p>
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-4 mt-2 ml-4">
          <button
            onClick={() => onLike(comment._id)}
            className={`text-sm transition-all ${
              isLiked ? 'text-red-400' : 'text-slate-400 hover:text-red-400'
            }`}
          >
            ❤️ {comment.likes?.length || 0}
          </button>
          <button
            onClick={onReply}
            className="text-sm text-slate-400 hover:text-blue-400 transition-all"
          >
            Reply
          </button>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 ml-6 space-y-3">
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply._id}
                comment={reply}
                currentUser={currentUser}
                onDelete={onDelete}
                onLike={onLike}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
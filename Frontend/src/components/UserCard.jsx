// src/components/community/UserCard.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const UserCard = ({ user, currentUser, onFollow }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleFollow = async () => {
    setLoading(true);
    await onFollow(user._id);
    setIsFollowing(!isFollowing);
    setLoading(false);
  };

  const isCurrentUser = user._id === currentUser?._id;

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl rounded-xl p-6 border border-slate-800 hover:border-slate-700 transition-all">
      <div className="flex items-start gap-4">
        <img
          src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.firstname}`}
          alt={user.firstname}
          className="w-16 h-16 rounded-full border-2 border-slate-700 cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => navigate(`/profile/${user._id}`)}
        />
        <div className="flex-1">
          <h3 
            className="text-lg font-bold text-white hover:text-blue-400 cursor-pointer transition-colors"
            onClick={() => navigate(`/profile/${user._id}`)}
          >
            {user.firstname} {user.lastname}
          </h3>
          <p className="text-sm text-slate-400 mb-3">
            @{user.firstname?.toLowerCase()}
          </p>
          {user.bio && (
            <p className="text-sm text-slate-300 mb-3 line-clamp-2">{user.bio}</p>
          )}
          
          {/* Stats */}
          <div className="flex gap-4 text-sm mb-3">
            <div>
              <span className="font-semibold text-white">{user.followers?.length || 0}</span>
              <span className="text-slate-400 ml-1">Followers</span>
            </div>
            <div>
              <span className="font-semibold text-white">{user.following?.length || 0}</span>
              <span className="text-slate-400 ml-1">Following</span>
            </div>
          </div>

          {/* Action Button */}
          {!isCurrentUser && (
            <button
              onClick={handleFollow}
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                isFollowing
                  ? 'bg-slate-800 text-white hover:bg-slate-700'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
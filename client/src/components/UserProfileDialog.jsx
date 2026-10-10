import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { fetchUserProfile } from '../services/profile.service';
import { getDisplayName } from '../utils/conversation';
import { getErrorMessage } from '../utils/getErrorMessage';
import { formatLastSeen } from '../utils/formatLastSeen';
import Avatar from './Avatar';
import Modal from './Modal';

// Somebody else's profile card. `onMessage` adds a "Send message" button.
export default function UserProfileDialog({ userId, onClose, onMessage }) {
  const { user: me } = useAuth();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    fetchUserProfile(userId)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err) => {
        if (!cancelled) setError(getErrorMessage(err));
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  let presence = '';

  if (profile) {
    if (!profile.showsPresence) presence = 'Last seen is hidden';
    else if (profile.isOnline) presence = 'Online';
    else presence = formatLastSeen(profile.lastSeen);
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString([], { month: 'long', year: 'numeric' })
    : '';

  return (
    <Modal title="Profile" onClose={onClose}>
      {!profile && !error && <p className="text-sm text-slate-400">Loading...</p>}

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {profile && (
        <div className="flex flex-col items-center text-center">
          <Avatar name={getDisplayName(profile)} src={profile.avatar} size="xl" />
          <h3 className="mt-3 text-lg font-semibold">{getDisplayName(profile)}</h3>
          <p className="text-sm text-slate-400">@{profile.username}</p>

          {profile.status && <p className="mt-2 text-sm text-emerald-300">{profile.status}</p>}
          {presence && (
            <p className={`mt-1 text-xs ${profile.isOnline ? 'text-emerald-400' : 'text-slate-400'}`}>
              {presence}
            </p>
          )}

          {profile.bio && (
            <p className="mt-4 whitespace-pre-wrap break-words text-sm text-slate-200">{profile.bio}</p>
          )}

          {memberSince && <p className="mt-4 text-xs text-slate-500">Member since {memberSince}</p>}

          {onMessage && profile._id !== me._id && (
            <button
              type="button"
              onClick={() => {
                onMessage(profile._id);
                onClose();
              }}
              className="mt-5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold hover:bg-emerald-500"
            >
              Send message
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}
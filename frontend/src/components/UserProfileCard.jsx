import { useState, useRef, useEffect } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { useAuth, ROLE_LABELS } from '../context/AuthContext';
import { useNavigation } from '../context/NavigationContext';
import StatusBadge from './StatusBadge';
import './UserProfileCard.css';

const getInitials = (name) =>
  name
    .replace(/^Dr\.?\s+/i, '')
    .replace(/^Mr\.?\s+/i, '')
    .replace(/^Ms\.?\s+/i, '')
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const UserProfileCard = () => {
  const { role, user } = useAuth();
  const { navigate } = useNavigation();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name ? getInitials(user.name) : '--';
  const displayName = user?.name ?? ROLE_LABELS[role] ?? 'User';
  const displayRole = ROLE_LABELS[role] ?? '';

  return (
    <div className="topbar-user-wrap" ref={wrapRef}>
      <button
        type="button"
        className="topbar-user"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={`${displayName}, ${displayRole}`}
      >
        <div className="topbar-avatar" aria-hidden="true">{initials}</div>
        <div className="topbar-user-info">
          <span className="topbar-username">{displayName}</span>
          <span className="topbar-role">{displayRole}</span>
        </div>
      </button>

      {open && (
        <div className="profile-card" role="menu">
          <div className="profile-card-avatar" aria-hidden="true">{initials}</div>
          <div className="profile-card-name">{displayName}</div>
          <div className="profile-card-email">{user?.email}</div>
          <StatusBadge status={role} customLabel={displayRole} />

          <button
            type="button"
            className="profile-card-settings-btn"
            onClick={() => { setOpen(false); navigate('settings'); }}
          >
            <SettingsIcon size={15} aria-hidden="true" />
            Account Settings
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;

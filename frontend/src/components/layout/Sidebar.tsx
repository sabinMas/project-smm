import { NavLink, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuthStore } from '@/store/authStore';

const nav = [
  { to: '/compose', label: 'Compose', icon: '✏️' },
  { to: '/calendar', label: 'Calendar', icon: '📅' },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
  { to: '/connections', label: 'Connections', icon: '🔗' },
  { to: '/post-types', label: 'Post Types', icon: '🏷️' },
  { to: '/workflows', label: 'Workflows', icon: '⚡' },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex flex-col w-60 bg-surface-1 border-r border-white/10">
      <div className="px-5 py-5 border-b border-white/10">
        <span className="text-lg font-bold tracking-tight text-white">
          <span className="text-brand-500">SMM</span>
          <span className="text-white/40 font-normal ml-1 text-sm">dashboard</span>
        </span>
      </div>
      <nav className="flex flex-col gap-1 px-3 py-4 flex-1" aria-label="Main navigation">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive
                  ? 'bg-brand-500/20 text-brand-500 font-medium'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              )
            }
          >
            <span aria-hidden="true">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="w-7 h-7 rounded-full object-cover"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-500">
              {user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-white/40 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Sign out"
            className="text-white/30 hover:text-white/70 transition-colors text-sm"
          >
            ↪
          </button>
        </div>
      </div>
    </aside>
  );
}

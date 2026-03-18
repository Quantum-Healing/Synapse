import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, StickyNote, Calendar, ChevronLeft, ChevronRight, Brain, LogOut
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function GoogleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853" />
      <path d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z" fill="#FBBC05" />
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335" />
    </svg>
  );
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/flashcards', icon: BookOpen, label: 'Flashcards' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, requestSignIn, signOut } = useAuth();
  const { syncStatus } = useApp();

  const syncLabel = { loading: 'Loading…', saving: 'Saving…', error: 'Sync error', synced: 'Synced' }[syncStatus];
  const syncColor = { loading: 'text-slate-400', saving: 'text-amber-400', error: 'text-red-400', synced: 'text-emerald-400' }[syncStatus];

  return (
    <aside
      className={`${collapsed ? 'w-16' : 'w-56'} shrink-0 flex flex-col bg-white border-r border-slate-100 transition-all duration-300 min-h-screen`}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-slate-100 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center shrink-0">
          <Brain size={16} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-bold text-slate-800 text-lg tracking-tight">Synapse</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label, exact }) => {
          const active = exact ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && label}
            </NavLink>
          );
        })}
      </nav>

      {/* User / Sign-in section */}
      {CLIENT_ID && (
        <div className={`mx-2 mb-2 ${collapsed ? '' : ''}`}>
          {user ? (
            <div className={`flex items-center gap-2.5 px-2 py-2 rounded-xl group`}>
              <img
                src={user.picture}
                alt={user.name}
                className="w-8 h-8 rounded-full shrink-0 object-cover"
                referrerPolicy="no-referrer"
              />
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-700 truncate">{user.name}</p>
                  <p className={`text-[10px] truncate ${syncStatus !== 'idle' ? syncColor : 'text-slate-400'}`}>
                    {syncStatus !== 'idle' ? syncLabel : user.email}
                  </p>
                </div>
              )}
              <button
                onClick={signOut}
                title="Sign out"
                className={`p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all ${collapsed ? 'mx-auto' : 'opacity-0 group-hover:opacity-100'}`}
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={requestSignIn}
              title="Sign in with Google"
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all ${collapsed ? 'justify-center' : ''}`}
            >
              <GoogleIcon />
              {!collapsed && <span>Sign in</span>}
            </button>
          )}
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-2 mb-4 flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all text-xs font-medium"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /><span>Collapse</span></>}
      </button>
    </aside>
  );
}

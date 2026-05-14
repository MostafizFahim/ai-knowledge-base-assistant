import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { label: 'Dashboard', href: '/' },
  { label: 'Documents', href: '/documents' },
  { label: 'Add Document', href: '/documents/new' },
  { label: 'Chat', href: '/chat' },
  { label: 'History', href: '/history' }
];

export default function Navbar() {
  const { email, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container-shell flex flex-col gap-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Knowledge Base</p>
          <h1 className="text-lg font-semibold text-slate-950">AI Assistant Workspace</h1>
        </div>

        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                [
                  'rounded-md px-3 py-2 text-sm font-medium transition',
                  isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          <span className="max-w-56 truncate text-sm text-slate-500">{email}</span>
          <button className="btn-secondary" type="button" onClick={handleLogout}>
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}

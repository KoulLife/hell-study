import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Users, BookOpen, Menu, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname.startsWith(path)
      ? 'text-orange-400'
      : 'text-muted-foreground hover:text-foreground';

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/course" className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(234,88,12,0.5)]" />
          <span className="font-semibold text-sm">
            <span className="text-orange-400">Hell</span> Study
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/course" className={`flex items-center gap-1.5 transition-colors ${isActive('/course')}`}>
            <BookOpen className="w-4 h-4" />
            코스
          </Link>

          {currentUser?.role === 'SUPER_ADMIN' && (
            <Link
              to="/admin/users/pending"
              className={`flex items-center gap-1.5 transition-colors ${isActive('/admin/users')}`}
            >
              <Users className="w-4 h-4" />
              회원 관리
            </Link>
          )}
        </nav>

        {/* Right: user + logout */}
        <div className="hidden md:flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {currentUser?.name}
            {currentUser?.role === 'SUPER_ADMIN' && (
              <span className="ml-1.5 text-xs text-orange-400 font-medium bg-orange-400/10 px-1.5 py-0.5 rounded-full">
                SUPER ADMIN
              </span>
            )}
            {currentUser?.role === 'ADMIN' && (
              <span className="ml-1.5 text-xs text-blue-400 font-medium bg-blue-400/10 px-1.5 py-0.5 rounded-full">
                ADMIN
              </span>
            )}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut className="w-4 h-4" />
            로그아웃
          </button>
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-3 text-sm font-medium">
          <Link to="/course" onClick={() => setMenuOpen(false)} className={`flex items-center gap-2 ${isActive('/course')}`}>
            <BookOpen className="w-4 h-4" /> 코스
          </Link>
          {currentUser?.role === 'SUPER_ADMIN' && (
            <Link to="/admin/users/pending" onClick={() => setMenuOpen(false)} className={`flex items-center gap-2 ${isActive('/admin/users')}`}>
              <Users className="w-4 h-4" /> 회원 관리
            </Link>
          )}
          <button onClick={handleLogout} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" /> 로그아웃
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;

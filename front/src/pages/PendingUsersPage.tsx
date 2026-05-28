import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, RefreshCw, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { superAdmin } from '@/lib/api';
import type { User } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

type ActionState = { userId: number; type: 'approve' | 'reject' } | null;

const PendingUsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<ActionState>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await superAdmin.getPendingUsers();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '목록을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (userId: number, type: 'approve' | 'reject') => {
    setActionInProgress({ userId, type });
    try {
      if (type === 'approve') await superAdmin.approveUser(userId);
      else await superAdmin.rejectUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="course-page">
      {/* Navbar — same style as CoursePage */}
      <nav className="course-nav">
        <div className="course-nav-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }} onClick={() => navigate('/course')}>
            <img src="/logo.png" alt="Hell Study" className="course-nav-logo" />
            <span className="course-nav-title">
              <span className="course-nav-hell">Hell</span> Study
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/course" style={{ fontSize: '0.875rem', color: 'var(--color-gray-light)', textDecoration: 'none' }}>
            코스
          </Link>
          <Link to="/admin/users/pending" style={{ fontSize: '0.875rem', color: 'var(--clr-orange)', textDecoration: 'none', fontWeight: 600 }}>
            회원 관리
          </Link>
        </div>
        <div className="course-nav-right">
          {currentUser && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-light)', opacity: 0.6 }}>
              {currentUser.name}
              <span style={{ marginLeft: '0.5rem', color: 'var(--clr-orange)', fontSize: '0.6875rem', fontWeight: 700 }}>SUPER ADMIN</span>
            </span>
          )}
          <button className="course-nav-logout" onClick={handleLogout}>로그아웃</button>
        </div>
      </nav>

    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-orange-400" />
          <h1 className="text-xl font-semibold">회원가입 승인 대기</h1>
          {!isLoading && (
            <span className="text-sm text-muted-foreground bg-foreground/5 px-2 py-0.5 rounded-full">
              {users.length}명
            </span>
          )}
        </div>
        <button
          onClick={load}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          새로고침
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
          불러오는 중...
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground">
          <Users className="w-10 h-10 opacity-30" />
          <p className="text-sm">승인 대기 중인 회원이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {users.map(u => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-2xl border border-border bg-foreground/5 px-5 py-4"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-medium text-sm">{u.name}</span>
                <span className="text-xs text-muted-foreground">{u.loginId} · {u.email}</span>
                <span className="text-xs text-muted-foreground">
                  가입 신청일: {new Date(u.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAction(u.id, 'approve')}
                  disabled={actionInProgress?.userId === u.id}
                  className="flex items-center gap-1.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 hover:bg-green-500/20 px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  {actionInProgress?.userId === u.id && actionInProgress.type === 'approve' ? '처리 중...' : '승인'}
                </button>
                <button
                  onClick={() => handleAction(u.id, 'reject')}
                  disabled={actionInProgress?.userId === u.id}
                  className="flex items-center gap-1.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4" />
                  {actionInProgress?.userId === u.id && actionInProgress.type === 'reject' ? '처리 중...' : '거절'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </div>
  );
};

export default PendingUsersPage;

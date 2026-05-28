import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw, Users, ChevronRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { course as courseApi, enrollment as enrollmentApi } from '@/lib/api';
import type { Course, Enrollment, EnrollmentStatus } from '@/lib/api';

type FilterTab = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const STATUS_LABEL: Record<EnrollmentStatus, string> = {
  PENDING: '대기 중',
  APPROVED: '수락됨',
  REJECTED: '거절됨',
};

const EnrollmentManagePage = () => {
  const { courseId = '' } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const [courseData, setCourseData] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionId, setActionId] = useState<number | null>(null);
  const [filter, setFilter] = useState<FilterTab>('PENDING');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const load = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    setError(null);
    try {
      const [c, e] = await Promise.all([
        courseApi.getById(parseInt(courseId, 10)),
        enrollmentApi.getEnrollments(parseInt(courseId, 10)),
      ]);
      setCourseData(c);
      setEnrollments(e.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      setError(err instanceof Error ? err.message : '목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (enrollmentId: number) => {
    setActionId(enrollmentId);
    setError(null);
    try {
      const updated = await enrollmentApi.approve(enrollmentId);
      setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status: updated.status } : e));
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (enrollmentId: number) => {
    setActionId(enrollmentId);
    setError(null);
    try {
      const updated = await enrollmentApi.reject(enrollmentId);
      setEnrollments(prev => prev.map(e => e.id === enrollmentId ? { ...e, status: updated.status } : e));
    } catch (err) {
      setError(err instanceof Error ? err.message : '처리 중 오류가 발생했습니다.');
    } finally {
      setActionId(null);
    }
  };

  const counts: Record<FilterTab, number> = {
    ALL: enrollments.length,
    PENDING: enrollments.filter(e => e.status === 'PENDING').length,
    APPROVED: enrollments.filter(e => e.status === 'APPROVED').length,
    REJECTED: enrollments.filter(e => e.status === 'REJECTED').length,
  };

  const filtered = filter === 'ALL' ? enrollments : enrollments.filter(e => e.status === filter);

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'PENDING', label: '대기 중' },
    { key: 'APPROVED', label: '수락됨' },
    { key: 'REJECTED', label: '거절됨' },
    { key: 'ALL', label: '전체' },
  ];

  return (
    <div className="course-page">
      {/* Navbar */}
      <nav className="course-nav">
        <div className="course-nav-left" onClick={() => navigate('/course')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Hell Study" className="course-nav-logo" />
          <span className="course-nav-title">
            <span className="course-nav-hell">Hell</span> Study
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link to="/course" style={{ fontSize: '0.875rem', color: 'var(--color-gray-light)', textDecoration: 'none' }}>
            코스
          </Link>
          {currentUser?.role === 'SUPER_ADMIN' && (
            <Link to="/admin/users/pending" style={{ fontSize: '0.875rem', color: 'var(--color-gray-light)', textDecoration: 'none' }}>
              회원 관리
            </Link>
          )}
        </div>

        <div className="course-nav-right">
          {currentUser && (
            <span style={{ fontSize: '0.8125rem', color: 'var(--color-gray-light)', opacity: 0.6 }}>
              {currentUser.name}
              {currentUser.role === 'SUPER_ADMIN' && (
                <span style={{ marginLeft: '0.5rem', color: 'var(--clr-orange)', fontSize: '0.6875rem', fontWeight: 700 }}>SUPER ADMIN</span>
              )}
              {currentUser.role === 'ADMIN' && (
                <span style={{ marginLeft: '0.5rem', color: '#60a5fa', fontSize: '0.6875rem', fontWeight: 700 }}>ADMIN</span>
              )}
            </span>
          )}
          <button className="course-nav-logout" onClick={handleLogout}>로그아웃</button>
        </div>
      </nav>

      <main className="course-main">
        {/* Breadcrumb */}
        <div className="enroll-breadcrumb">
          <span className="enroll-breadcrumb-link" onClick={() => navigate('/course')}>코스 목록</span>
          <ChevronRight size={13} style={{ opacity: 0.4 }} />
          {courseData && (
            <>
              <span className="enroll-breadcrumb-link" onClick={() => navigate(`/course/${courseId}`)}>
                {courseData.title}
              </span>
              <ChevronRight size={13} style={{ opacity: 0.4 }} />
            </>
          )}
          <span style={{ color: 'rgba(255,255,255,0.6)' }}>수강 신청 관리</span>
        </div>

        {/* Header */}
        <div className="enroll-page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <Users size={18} style={{ color: 'var(--clr-orange)' }} />
            <h1 className="enroll-page-title">수강 신청 관리</h1>
            {courseData && (
              <span className="enroll-course-name-badge">{courseData.title}</span>
            )}
          </div>
          <button
            className="enroll-refresh-btn"
            onClick={load}
            disabled={loading}
          >
            <RefreshCw size={14} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            새로고침
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="enroll-error">{error}</div>
        )}

        {/* Filter tabs */}
        <div className="enroll-tabs">
          {tabs.map(t => (
            <button
              key={t.key}
              className={`enroll-tab${filter === t.key ? ' enroll-tab--active' : ''}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
              <span className={`enroll-tab-count${filter === t.key ? ' active' : ''}`}>
                {counts[t.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="enroll-empty">불러오는 중...</div>
        ) : filtered.length === 0 ? (
          <div className="enroll-empty">
            <Users size={36} style={{ opacity: 0.2, marginBottom: '0.75rem' }} />
            <p>{filter === 'PENDING' ? '대기 중인 신청이 없습니다.' : '해당 항목이 없습니다.'}</p>
          </div>
        ) : (
          <div className="enroll-list">
            {filtered.map(e => (
              <div key={e.id} className="enroll-item">
                <div className="enroll-item-info">
                  <span className="enroll-item-name">{e.applicantName}</span>
                  <span className="enroll-item-date">
                    신청일: {new Date(e.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                  <span className={`enroll-status-badge enroll-status-${e.status.toLowerCase()}`}>
                    {STATUS_LABEL[e.status]}
                  </span>
                </div>

                {e.status === 'PENDING' && (
                  <div className="enroll-item-actions">
                    <button
                      className="enroll-btn-approve"
                      onClick={() => handleApprove(e.id)}
                      disabled={actionId === e.id}
                    >
                      <CheckCircle size={14} />
                      {actionId === e.id ? '처리 중...' : '수락'}
                    </button>
                    <button
                      className="enroll-btn-reject"
                      onClick={() => handleReject(e.id)}
                      disabled={actionId === e.id}
                    >
                      <XCircle size={14} />
                      {actionId === e.id ? '처리 중...' : '거절'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default EnrollmentManagePage;

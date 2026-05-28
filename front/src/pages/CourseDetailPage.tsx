import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronDown, ChevronRight, HelpCircle, LogOut, Flame,
  Upload, RotateCcw, MessageSquare, CheckSquare, Plus, Pencil, Save, X, CheckCircle, Users, Menu,
} from 'lucide-react';
import BaljaeEditor from '@/components/ui/baljae-editor';
import { course as courseApi, assignment as assignmentApi, enrollment as enrollmentApi, submission as submissionApi, ApiError } from '@/lib/api';
import type { Course, Assignment, Submission, SubmissionStatus } from '@/lib/api';

// ── Countdown hook ───────────────────────────────────────────────
function useCountdown(deadline: Date | null) {
  const [text, setText] = useState('');
  useEffect(() => {
    if (!deadline) return;
    const tick = () => {
      const diff = deadline.getTime() - Date.now();
      if (diff <= 0) { setText('마감됨'); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setText(`${d}일 ${h}시간 ${m}분 남음`);
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [deadline]);
  return text;
}

// ── Baljae post (local) ──────────────────────────────────────────
interface Post { id: string; round: number; title: string; content: string; date: string; }

// ── Component ────────────────────────────────────────────────────
const CourseDetailPage = () => {
  const { id = '1' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  // API data
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [completeLoading, setCompleteLoading] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  // 수강 권한 차단 팝업
  type GateReason = 'NOT_ENROLLED' | 'PENDING' | 'REJECTED';
  const [enrollGate, setEnrollGate] = useState<GateReason | null>(null);
  const [gateApplyLoading, setGateApplyLoading] = useState(false);
  const [gateApplyDone, setGateApplyDone] = useState(false);
  const [gateApplyError, setGateApplyError] = useState<string | null>(null);

  const handleGateApply = async () => {
    setGateApplyLoading(true);
    setGateApplyError(null);
    try {
      await enrollmentApi.apply(parseInt(id, 10));
      setGateApplyDone(true);
      setEnrollGate('PENDING');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '신청 중 오류가 발생했습니다.';
      if (msg.includes('이미') || msg.includes('already')) {
        setGateApplyDone(true);
        setEnrollGate('PENDING');
      } else {
        setGateApplyError(msg);
      }
    } finally {
      setGateApplyLoading(false);
    }
  };

  const detectGateReason = (message: string): GateReason => {
    if (message.includes('대기') || message.includes('pending')) return 'PENDING';
    if (message.includes('거절') || message.includes('reject')) return 'REJECTED';
    return 'NOT_ENROLLED';
  };

  // Enrollment state (for USER role)
  type EnrollStatus = 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
  const [enrollStatus, setEnrollStatus] = useState<EnrollStatus>('NONE');
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const handleEnroll = async () => {
    setEnrollLoading(true);
    setEnrollError(null);
    try {
      await enrollmentApi.apply(parseInt(id, 10));
      setEnrollStatus('PENDING');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '신청 중 오류가 발생했습니다.';
      setEnrollError(msg);
      if (msg.includes('이미')) setEnrollStatus('PENDING');
    } finally {
      setEnrollLoading(false);
    }
  };

  useEffect(() => {
    const courseId = parseInt(id, 10);
    setLoading(true);
    Promise.allSettled([
      courseApi.getById(courseId),
      assignmentApi.getByCourse(courseId),
    ]).then(([courseResult, assignResult]) => {
      if (courseResult.status === 'fulfilled') {
        setCourseData(courseResult.value);
      }
      if (assignResult.status === 'fulfilled') {
        const sorted = [...assignResult.value].sort((x, y) => x.roundNumber - y.roundNumber);
        setAssignments(sorted);
        // 각 과제에 대한 내 제출 기록 로드
        Promise.all(sorted.map(a => submissionApi.getMy(a.id))).then(results => {
          const map = new Map<number, Submission>();
          results.forEach((s, i) => { if (s) map.set(sorted[i].id, s); });
          setMySubmissions(map);
        }).catch(() => {});
      }

      // 403 감지 → 수강 신청 게이트 표시
      const errors = [courseResult, assignResult]
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map(r => r.reason);

      const blocked = errors.find(e => e instanceof ApiError && e.status === 403);
      if (blocked) {
        setEnrollGate(detectGateReason((blocked as ApiError).message));
      } else if (courseResult.status === 'rejected') {
        navigate('/course');
      } else if (assignResult.status === 'fulfilled') {
        // 과제 API까지 정상 응답 = 수강 승인된 상태
        setEnrollStatus('APPROVED');
      }
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCompleteRound = async () => {
    if (!courseData) return;
    setCompleteLoading(true);
    setCompleteError(null);
    try {
      const updated = await courseApi.completeRound(courseData.id);
      setCourseData(updated);
    } catch (err) {
      setCompleteError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setCompleteLoading(false);
    }
  };

  const loadSubmissionList = async (assignmentId: number) => {
    setSubmissionListLoading(true);
    try {
      const list = await submissionApi.getByAssignment(assignmentId);
      setSubmissionList(list);
    } catch {
      setSubmissionList([]);
    } finally {
      setSubmissionListLoading(false);
    }
  };

  const toggleSubmissionList = () => {
    if (!currentAssignment) return;
    if (!submissionListOpen) {
      loadSubmissionList(currentAssignment.id);
    }
    setSubmissionListOpen(v => !v);
  };

  const openFeedbackModal = (s: Submission) => {
    setFeedbackTarget(s);
    setFeedbackText(s.feedback ?? '');
    setFeedbackStatus(s.status === 'SUBMITTED' ? null : s.status as 'PASSED' | 'FAILED');
    setFeedbackError(null);
  };

  const handleEvaluate = async () => {
    if (!feedbackTarget || !feedbackStatus) return;
    setFeedbackLoading(true);
    setFeedbackError(null);
    try {
      const updated = await submissionApi.evaluate(feedbackTarget.id, feedbackStatus, feedbackText);
      setSubmissionList(prev => prev.map(s => s.id === updated.id ? updated : s));
      setFeedbackTarget(null);
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : '평가 중 오류가 발생했습니다.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const openAssignModal = () => {
    setAssignTitle('');
    setAssignDesc('');
    setAssignDeadline('');
    setAssignError(null);
    setAssignModalOpen(true);
  };

  const handleCreateAssignment = async () => {
    if (!assignTitle.trim() || !assignDeadline) return;
    setAssignLoading(true);
    setAssignError(null);
    try {
      // datetime-local 값을 ISO 8601로 변환 (서버가 LocalDateTime 기대)
      const deadlineIso = new Date(assignDeadline).toISOString().slice(0, 19);
      const created = await assignmentApi.create(parseInt(id, 10), {
        title: assignTitle.trim(),
        description: assignDesc.trim(),
        deadline: deadlineIso,
        roundNumber: activeRound,
      });
      setAssignments(prev => {
        const updated = [...prev];
        updated[activeRound - 1] = created;
        return updated;
      });
      setAssignModalOpen(false);
    } catch (err) {
      setAssignError(err instanceof Error ? err.message : '등록 중 오류가 발생했습니다.');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!currentAssignment || !submitLink.trim()) return;
    setSubmitLoading(true);
    setSubmitError(null);
    try {
      const result = await submissionApi.submit(currentAssignment.id, submitLink.trim());
      setMySubmissions(prev => new Map(prev).set(currentAssignment.id, result));
      setSubmitModalOpen(false);
      setSubmitLink('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : '제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const totalRounds = courseData?.totalRounds ?? 0;
  const completedRounds = courseData?.completedRounds ?? 0;

  // Page state
  type ActivePage = 'assignment' | 'baljae' | 'feedback';
  const [activePage, setActivePage] = useState<ActivePage>('assignment');

  // Assignment state
  const [activeRound, setActiveRound] = useState(0);
  const [mySubmissions, setMySubmissions] = useState<Map<number, Submission>>(new Map());

  // Submit modal state (수강자 과제 제출)
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitLink, setSubmitLink] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Admin 과제등록 모달 state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  // Admin 제출 목록 + 피드백 state
  const [submissionListOpen, setSubmissionListOpen] = useState(false);
  const [submissionList, setSubmissionList] = useState<Submission[]>([]);
  const [submissionListLoading, setSubmissionListLoading] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState<Submission | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState<'PASSED' | 'FAILED' | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  // Set activeRound to current active round after data loads
  useEffect(() => {
    if (courseData) {
      setActiveRound(courseData.completedRounds < courseData.totalRounds
        ? courseData.completedRounds + 1
        : courseData.completedRounds);
    }
  }, [courseData]);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [roundOpen, setRoundOpen] = useState(true);
  const [baljaeOpen, setBaljaeOpen] = useState(false);

  // Baljae state
  const [baljaeRound, setBaljaeRound] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isNewPost, setIsNewPost] = useState(false);

  // Feedback state
  const [feedbackRound, setFeedbackRound] = useState(1);

  // Derived
  const currentAssignment: Assignment | null = activeRound > 0
    ? (assignments.find(a => a.roundNumber === activeRound) ?? null)
    : null;
  const currentDeadline = currentAssignment ? new Date(currentAssignment.deadline) : null;
  const countdown = useCountdown(currentDeadline);

  const formatDeadline = (d: Date) => {
    const h = d.getHours();
    const ampm = h >= 12 ? '오후' : '오전';
    const h12 = h % 12 || 12;
    return `${d.getMonth() + 1}월 ${d.getDate()}일 ${ampm} ${h12}시 ${String(d.getMinutes()).padStart(2, '0')}분`;
  };

  const roundTabs = [
    { id: 0, label: 'Ready' },
    ...Array.from({ length: totalRounds }, (_, i) => ({ id: i + 1, label: `Round ${i + 1}` })),
  ];

  const roundList = Array.from({ length: totalRounds }, (_, i) => i + 1);

  // Baljae helpers
  const filteredPosts = posts.filter(p => p.round === baljaeRound);

  const startEdit = (post: Post) => {
    setSelectedPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setIsEditing(true);
    setIsNewPost(false);
  };

  const startNew = () => {
    const newPost: Post = {
      id: `r${baljaeRound}-${Date.now()}`,
      round: baljaeRound,
      title: '',
      content: '',
      date: new Date().toISOString().slice(0, 10),
    };
    setSelectedPost(newPost);
    setEditTitle('');
    setEditContent('');
    setIsEditing(true);
    setIsNewPost(true);
  };

  const savePost = () => {
    if (!selectedPost) return;
    const saved: Post = { ...selectedPost, title: editTitle || '제목 없음', content: editContent };
    if (isNewPost) {
      setPosts(prev => [...prev, saved]);
    } else {
      setPosts(prev => prev.map(p => p.id === saved.id ? saved : p));
    }
    setSelectedPost(saved);
    setIsEditing(false);
    setIsNewPost(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    if (isNewPost) setSelectedPost(null);
  };

  const breadcrumbSection = activePage === 'baljae' ? '발제'
    : activePage === 'feedback' ? '피드백'
    : isAdmin ? '과제등록' : '발제자료, 과제제출';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-gray-very-dark)', color: 'rgba(255,255,255,0.4)', fontSize: '0.9375rem' }}>
        불러오는 중...
      </div>
    );
  }

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="cd-layout">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && <div className="cd-sidebar-backdrop" onClick={closeSidebar} />}

      {/* Mobile top bar */}
      <div className="cd-mobile-topbar">
        <div className="cd-mobile-topbar-left">
          <button className="cd-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="메뉴">
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <img src="/logo.png" alt="logo" className="cd-logo-img" style={{ width: 24, height: 24 }} />
            <span className="cd-logo-text" style={{ fontSize: '0.9rem' }}>
              <span className="cd-logo-hell">Hell</span> Study
            </span>
          </div>
        </div>
        <div className="cd-mobile-topbar-right">
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>{currentUser?.name}</span>
          <button
            style={{ display: 'flex', alignItems: 'center', background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', padding: '0.25rem' }}
            onClick={handleLogout}
            aria-label="로그아웃"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside className={`cd-sidebar${sidebarOpen ? ' cd-sidebar--open' : ''}`}>
        <div className="cd-sidebar-top">
          <div className="cd-logo-row" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="logo" className="cd-logo-img" />
            <span className="cd-logo-text"><span className="cd-logo-hell">Hell</span> Study</span>
          </div>
          <div className="cd-user-greeting">
            안녕하세요 {currentUser?.name ?? '수강생'}님
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', padding: '0 0 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.375rem' }}>
            <Link
              to="/course"
              onClick={closeSidebar}
              style={{ padding: '0.4rem 1.125rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
            >
              ← 코스 목록
            </Link>
            {currentUser?.role === 'SUPER_ADMIN' && (
              <Link
                to="/admin/users/pending"
                onClick={closeSidebar}
                style={{ padding: '0.4rem 1.125rem', fontSize: '0.875rem', color: 'var(--clr-orange)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem' }}
              >
                회원 관리
              </Link>
            )}
          </div>

          <nav className="cd-nav">
            {/* 발제 */}
            <button
              className="cd-nav-item cd-nav-collapsible"
              onClick={() => { setBaljaeOpen(v => !v); setActivePage('baljae'); setSelectedPost(null); setIsEditing(false); closeSidebar(); }}
            >
              <span>발제</span>
              {baljaeOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {baljaeOpen && (
              <div className="cd-nav-sub">
                {roundList.map(r => (
                  <button
                    key={r}
                    className={`cd-nav-subitem${activePage === 'baljae' && baljaeRound === r ? ' cd-nav-subitem--active' : ''}`}
                    onClick={() => { setActivePage('baljae'); setBaljaeRound(r); setSelectedPost(null); setIsEditing(false); closeSidebar(); }}
                  >
                    Round {r} 발제
                  </button>
                ))}
              </div>
            )}

            {/* Round */}
            <button className="cd-nav-item cd-nav-collapsible" onClick={() => setRoundOpen(v => !v)}>
              <span>Round</span>
              {roundOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {roundOpen && (
              <div className="cd-nav-sub">
                <button
                  className={`cd-nav-subitem${activePage === 'assignment' ? ' cd-nav-subitem--active' : ''}`}
                  onClick={() => { setActivePage('assignment'); closeSidebar(); }}
                >
                  {isAdmin ? '과제등록' : '발제자료, 과제제출'}
                </button>
              </div>
            )}

            <button
              className={`cd-nav-item${activePage === 'feedback' ? ' cd-nav-item--active' : ''}`}
              onClick={() => { setActivePage('feedback'); closeSidebar(); }}
            >
              피드백
            </button>

            {isAdmin && (
              <Link
                to={`/admin/courses/${id}/enrollments`}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.125rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-white)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
              >
                <Users size={13} />
                수강 신청 관리
              </Link>
            )}
          </nav>
        </div>

        <div className="cd-sidebar-bottom">
          <button className="cd-bottom-item"><HelpCircle size={14} /><span>운영진에게 문의하기</span></button>
          <button className="cd-bottom-item">릴리스 노트</button>
          <button className="cd-bottom-item" onClick={handleLogout}><LogOut size={14} /><span>로그아웃</span></button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="cd-main">
        {/* 수강 권한 게이트 팝업 */}
        {enrollGate && (
          <div className="enroll-gate-overlay">
            <div className="enroll-gate-modal">
              {enrollGate === 'NOT_ENROLLED' && (
                <>
                  <div className="enroll-gate-icon not-enrolled">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="enroll-gate-title">수강 신청이 필요합니다</h2>
                  <p className="enroll-gate-desc">
                    이 코스에 접근하려면 수강 신청 후<br />관리자의 승인이 필요합니다.
                  </p>
                  {gateApplyDone ? (
                    <p className="enroll-gate-success">신청이 완료되었습니다. 승인을 기다려주세요.</p>
                  ) : (
                    <>
                      {gateApplyError && <p className="enroll-gate-error">{gateApplyError}</p>}
                      <div className="enroll-gate-actions">
                        <button className="enroll-gate-btn-primary" onClick={handleGateApply} disabled={gateApplyLoading}>
                          {gateApplyLoading ? '신청 중...' : '수강 신청하기'}
                        </button>
                        <button className="enroll-gate-btn-secondary" onClick={() => navigate('/course')}>
                          코스 목록으로
                        </button>
                      </div>
                    </>
                  )}
                  {gateApplyDone && (
                    <button className="enroll-gate-btn-secondary" onClick={() => navigate('/course')} style={{ marginTop: '0.75rem' }}>
                      코스 목록으로
                    </button>
                  )}
                </>
              )}

              {enrollGate === 'PENDING' && (
                <>
                  <div className="enroll-gate-icon pending">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="enroll-gate-title">승인 대기 중입니다</h2>
                  <p className="enroll-gate-desc">
                    수강 신청이 완료되었습니다.<br />관리자의 승인 후 이 코스에 접근할 수 있습니다.
                  </p>
                  <button className="enroll-gate-btn-secondary" onClick={() => navigate('/course')}>
                    코스 목록으로
                  </button>
                </>
              )}

              {enrollGate === 'REJECTED' && (
                <>
                  <div className="enroll-gate-icon rejected">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="28" height="28">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="enroll-gate-title">수강 신청이 거절되었습니다</h2>
                  <p className="enroll-gate-desc">
                    이 코스의 수강 신청이 거절되었습니다.<br />자세한 사항은 관리자에게 문의해주세요.
                  </p>
                  <button className="enroll-gate-btn-secondary" onClick={() => navigate('/course')}>
                    코스 목록으로
                  </button>
                </>
              )}
            </div>
          </div>
        )}
        {/* 과제 제출 모달 */}
        {submitModalOpen && currentAssignment && (
          <div className="submit-modal-overlay" onClick={() => setSubmitModalOpen(false)}>
            <div className="submit-modal" onClick={e => e.stopPropagation()}>
              <div className="submit-modal-header">
                <h3 className="submit-modal-title">과제 제출 — Round {activeRound}</h3>
                <button className="submit-modal-close" onClick={() => setSubmitModalOpen(false)}><X size={16} /></button>
              </div>
              <p className="submit-modal-desc">{currentAssignment.title}</p>
              <label className="submit-modal-label">과제 링크</label>
              <textarea
                className="submit-modal-textarea"
                placeholder="GitHub, Notion, 구글 드라이브 등 과제 링크를 입력하세요"
                value={submitLink}
                onChange={e => setSubmitLink(e.target.value)}
                rows={4}
              />
              {submitError && <p className="submit-modal-error">{submitError}</p>}
              <div className="submit-modal-actions">
                <button
                  className="submit-modal-btn-primary"
                  onClick={handleSubmitAssignment}
                  disabled={submitLoading || !submitLink.trim()}
                >
                  {submitLoading ? '제출 중...' : '제출하기'}
                </button>
                <button className="submit-modal-btn-secondary" onClick={() => setSubmitModalOpen(false)}>
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 어드민 과제등록 모달 */}
        {assignModalOpen && (
          <div className="submit-modal-overlay" onClick={() => setAssignModalOpen(false)}>
            <div className="submit-modal assign-modal" onClick={e => e.stopPropagation()}>
              <div className="submit-modal-header">
                <h3 className="submit-modal-title">과제 등록 — Round {activeRound}</h3>
                <button className="submit-modal-close" onClick={() => setAssignModalOpen(false)}><X size={16} /></button>
              </div>
              <div className="assign-modal-fields">
                <label className="submit-modal-label">제목 <span className="assign-required">*</span></label>
                <input
                  className="assign-modal-input"
                  placeholder="과제 제목을 입력하세요"
                  value={assignTitle}
                  onChange={e => setAssignTitle(e.target.value)}
                />
                <label className="submit-modal-label">설명</label>
                <div className="assign-editor-wrap">
                  <BaljaeEditor
                    key={`assign-editor-${assignModalOpen}`}
                    content=""
                    editable
                    placeholder="과제 설명을 입력하세요. 요구사항, 제출 형식, 참고 자료 등을 작성할 수 있습니다."
                    onUpdate={setAssignDesc}
                  />
                </div>
                <label className="submit-modal-label">제출 마감일 <span className="assign-required">*</span></label>
                <input
                  className="assign-modal-input"
                  type="datetime-local"
                  value={assignDeadline}
                  onChange={e => setAssignDeadline(e.target.value)}
                />
              </div>
              {assignError && <p className="submit-modal-error">{assignError}</p>}
              <div className="submit-modal-actions">
                <button
                  className="submit-modal-btn-primary"
                  onClick={handleCreateAssignment}
                  disabled={assignLoading || !assignTitle.trim() || !assignDeadline}
                >
                  {assignLoading ? '등록 중...' : '등록하기'}
                </button>
                <button className="submit-modal-btn-secondary" onClick={() => setAssignModalOpen(false)}>
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 피드백 모달 */}
        {feedbackTarget && (
          <div className="submit-modal-overlay" onClick={() => setFeedbackTarget(null)}>
            <div className="submit-modal feedback-modal" onClick={e => e.stopPropagation()}>
              <div className="submit-modal-header">
                <h3 className="submit-modal-title">과제 평가</h3>
                <button className="submit-modal-close" onClick={() => setFeedbackTarget(null)}><X size={16} /></button>
              </div>
              <div className="feedback-meta">
                <span className="feedback-username">{feedbackTarget.userName}</span>
                <a href={feedbackTarget.content} target="_blank" rel="noreferrer" className="feedback-link">
                  {feedbackTarget.content}
                </a>
              </div>
              <div className="feedback-status-row">
                <button
                  className={`feedback-status-btn${feedbackStatus === 'PASSED' ? ' feedback-status-btn--passed' : ''}`}
                  onClick={() => setFeedbackStatus('PASSED')}
                >
                  ✓ 합격
                </button>
                <button
                  className={`feedback-status-btn${feedbackStatus === 'FAILED' ? ' feedback-status-btn--failed' : ''}`}
                  onClick={() => setFeedbackStatus('FAILED')}
                >
                  ✗ 불합격
                </button>
              </div>
              <label className="submit-modal-label">피드백 내용</label>
              <textarea
                className="submit-modal-textarea"
                placeholder="수강생에게 전달할 피드백을 입력하세요 (선택)"
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
                rows={5}
              />
              {feedbackError && <p className="submit-modal-error">{feedbackError}</p>}
              <div className="submit-modal-actions">
                <button
                  className="submit-modal-btn-primary"
                  onClick={handleEvaluate}
                  disabled={feedbackLoading || !feedbackStatus}
                >
                  {feedbackLoading ? '저장 중...' : '평가 저장'}
                </button>
                <button className="submit-modal-btn-secondary" onClick={() => setFeedbackTarget(null)}>
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <div className="cd-breadcrumb">
          <span className="cd-breadcrumb-link" onClick={() => navigate('/course')}>강의 목록</span>
          <span className="cd-breadcrumb-sep">/</span>
          <span className="cd-breadcrumb-link">{courseData?.title ?? '코스'}</span>
          <span className="cd-breadcrumb-sep">/</span>
          <span>{breadcrumbSection}</span>
          {selectedPost && <><span className="cd-breadcrumb-sep">/</span><span className="cd-breadcrumb-view">View</span></>}
        </div>

        {/* Enrollment banner — USER only, APPROVED 상태면 숨김 */}
        {!isAdmin && enrollStatus !== 'APPROVED' && (
          <div className="cd-enrollment-banner">
            <div className="cd-enrollment-banner-left">
              <Users size={14} style={{ color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
              <span className="cd-enrollment-banner-label">수강 신청</span>
              {enrollStatus === 'NONE' && (
                <span className="cd-enrollment-banner-desc">이 코스를 수강하려면 신청이 필요합니다.</span>
              )}
              {enrollStatus === 'PENDING' && (
                <span className="cd-enrollment-status cd-enrollment-pending">검토 중</span>
              )}
              {enrollStatus === 'APPROVED' && (
                <span className="cd-enrollment-status cd-enrollment-approved">✓ 수락됨</span>
              )}
              {enrollStatus === 'REJECTED' && (
                <span className="cd-enrollment-status cd-enrollment-rejected">거절됨</span>
              )}
              {enrollError && (
                <span style={{ fontSize: '0.8125rem', color: 'var(--clr-red)' }}>{enrollError}</span>
              )}
            </div>
            {enrollStatus === 'NONE' && (
              <button
                className="cd-enrollment-btn"
                onClick={handleEnroll}
                disabled={enrollLoading}
              >
                {enrollLoading ? '신청 중...' : '수강 신청하기'}
              </button>
            )}
          </div>
        )}

        {/* ════════ ASSIGNMENT VIEW ════════ */}
        {activePage === 'assignment' && (
          <>
            {/* Course progress + complete round */}
            {courseData && (
              <div className="cd-course-progress-bar">
                <div className="cd-course-progress-info">
                  <span className="cd-course-progress-label">진행</span>
                  <div className="cd-course-progress-track">
                    <div
                      className="cd-course-progress-fill"
                      style={{ width: totalRounds > 0 ? `${(completedRounds / totalRounds) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="cd-course-progress-text">
                    {completedRounds} / {totalRounds} 라운드
                  </span>
                </div>
                {isAdmin && completedRounds < totalRounds && (
                  <button
                    className="cd-complete-round-btn"
                    onClick={handleCompleteRound}
                    disabled={completeLoading}
                  >
                    <CheckCircle size={14} />
                    {completeLoading ? '처리 중...' : `Round ${completedRounds + 1} 완료 처리`}
                  </button>
                )}
                {isAdmin && completedRounds === totalRounds && totalRounds > 0 && (
                  <span className="cd-all-complete-badge">✓ 전 라운드 완료</span>
                )}
              </div>
            )}
            {completeError && (
              <p style={{ color: 'var(--clr-red)', fontSize: '0.8125rem', marginBottom: '0.75rem' }}>{completeError}</p>
            )}

            <div className="cd-round-label">{activeRound === 0 ? 'READY' : `ROUND ${activeRound}`}</div>
            <div className="cd-tabs">
              {roundTabs.map(t => (
                <button
                  key={t.id}
                  className={`cd-tab${activeRound === t.id ? ' cd-tab--active' : ''}${t.id > 0 && t.id <= completedRounds ? ' cd-tab--done' : ''}`}
                  onClick={() => { setActiveRound(t.id); setSubmissionListOpen(false); }}
                >
                  {t.id > 0 && (
                    <span className="cd-tab-icon">
                      {t.id <= completedRounds
                        ? <CheckCircle size={13} style={{ color: 'var(--clr-green)' }} />
                        : <Flame size={13} className="text-orange-400" />}
                    </span>
                  )}
                  {t.label}
                </button>
              ))}
            </div>

            <div className="cd-content">
              {activeRound === 0 ? (
                <div className="cd-card">
                  <p className="cd-empty">아직 라운드가 시작되지 않았습니다.</p>
                </div>
              ) : isAdmin ? (
                /* ── Admin: 과제등록 뷰 ── */
                <div className="cd-card">
                  <div className="cd-assign-top">
                    <span className="cd-week-badge">Round {activeRound}</span>
                  </div>
                  {currentAssignment ? (
                    <>
                      <p className="cd-assign-title">{currentAssignment.title}</p>
                      {currentAssignment.description && (
                        <div className="assign-desc-view">
                          <BaljaeEditor
                            key={`assign-view-${currentAssignment.id}`}
                            content={currentAssignment.description}
                            editable={false}
                          />
                        </div>
                      )}
                      <div className="cd-deadline" style={{ marginTop: '0.75rem' }}>
                        <span>제출 마감:&nbsp;</span>
                        <span className="cd-deadline-date">{formatDeadline(new Date(currentAssignment.deadline))}</span>
                      </div>
                      {/* 제출 목록 토글 */}
                      <div className="sub-list-toggle-row">
                        <button className="sub-list-toggle-btn" onClick={toggleSubmissionList}>
                          {submissionListOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          제출 목록{submissionList.length > 0 && submissionListOpen ? ` (${submissionList.length})` : ''}
                        </button>
                      </div>
                      {submissionListOpen && (
                        <div className="sub-list">
                          {submissionListLoading ? (
                            <p className="sub-list-empty">불러오는 중...</p>
                          ) : submissionList.length === 0 ? (
                            <p className="sub-list-empty">아직 제출한 수강생이 없습니다.</p>
                          ) : (
                            submissionList.map(s => (
                              <div key={s.id} className="sub-item">
                                <div className="sub-item-left">
                                  <span className="sub-item-name">{s.userName}</span>
                                  <a
                                    href={s.content}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="sub-item-link"
                                  >
                                    {s.content}
                                  </a>
                                </div>
                                <div className="sub-item-right">
                                  <span className={`sub-status sub-status--${s.status.toLowerCase()}`}>
                                    {s.status === 'SUBMITTED' ? '검토 중' : s.status === 'PASSED' ? '합격' : '불합격'}
                                  </span>
                                  <button className="sub-feedback-btn" onClick={() => openFeedbackModal(s)}>
                                    평가
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="cd-admin-empty-assign">
                      <p className="cd-empty">이 라운드에 등록된 과제가 없습니다.</p>
                      <button className="cd-btn-assign-create" onClick={openAssignModal}>
                        <Plus size={14} />과제 등록
                      </button>
                    </div>
                  )}
                </div>
              ) : currentAssignment ? (
                /* ── 수강자: 과제 제출 뷰 ── */
                <>
                  <div className="cd-card">
                    <div className="cd-rising-header">
                      <span className="cd-rising-badge">RISING TALENT PLAYER</span>
                      <span className="cd-rising-sub">라이징 탤런트 플레이어</span>
                    </div>
                    <p className="cd-empty-small">해당 과제의 라이징 탤런트가 없습니다.</p>
                  </div>
                  <div className="cd-card">
                    <div className="cd-assign-top">
                      <span className="cd-week-badge">Round {activeRound}</span>
                      <div className="cd-deadline">
                        <span>제출 마감:&nbsp;</span>
                        <span className="cd-deadline-date">{formatDeadline(new Date(currentAssignment.deadline))}</span>
                        {countdown && !mySubmissions.has(currentAssignment.id) && (
                          <span className="cd-countdown">({countdown})</span>
                        )}
                      </div>
                    </div>
                    <p className="cd-assign-title">{currentAssignment.title}</p>
                    {currentAssignment.description && (
                      <div className="assign-desc-view">
                        <BaljaeEditor
                          key={`assign-view-user-${currentAssignment.id}`}
                          content={currentAssignment.description}
                          editable={false}
                        />
                      </div>
                    )}
                    <div className="cd-assign-actions">
                      {mySubmissions.has(currentAssignment.id) ? (
                        <div className="cd-submission-done">
                          <button className="cd-btn-submitted" disabled>✓ 제출 완료</button>
                          <span className="cd-submission-link">{mySubmissions.get(currentAssignment.id)!.content}</span>
                        </div>
                      ) : (
                        <button
                          className="cd-btn-submit"
                          onClick={() => { setSubmitLink(''); setSubmitError(null); setSubmitModalOpen(true); }}
                        >
                          <Upload size={14} />과제 제출
                        </button>
                      )}
                    </div>
                    {/* 수강자 피드백 표시 */}
                    {(() => {
                      const mySub = mySubmissions.get(currentAssignment.id);
                      if (!mySub || mySub.status === 'SUBMITTED') return null;
                      return (
                        <div className={`user-feedback-box user-feedback-box--${mySub.status.toLowerCase()}`}>
                          <span className={`user-feedback-status user-feedback-status--${mySub.status.toLowerCase()}`}>
                            {mySub.status === 'PASSED' ? '✓ 합격' : '✗ 불합격'}
                          </span>
                          {mySub.feedback && <p className="user-feedback-text">{mySub.feedback}</p>}
                        </div>
                      );
                    })()}
                    <div className="cd-assign-footer">
                      <button className="cd-footer-link"><RotateCcw size={13} />발제 다시보기</button>
                      <button className="cd-footer-link"><MessageSquare size={13} />Q&A 세션 다시보기</button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="cd-card">
                  <p className="cd-empty">이 라운드에 아직 과제가 등록되지 않았습니다.</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════ BALJAE VIEW ════════ */}
        {activePage === 'baljae' && (
          <>
            <div className="cd-round-label">발제 — ROUND {baljaeRound}</div>
            <div className="cd-tabs">
              {roundList.map(r => (
                <button
                  key={r}
                  className={`cd-tab${baljaeRound === r ? ' cd-tab--active' : ''}`}
                  onClick={() => { setBaljaeRound(r); setSelectedPost(null); setIsEditing(false); }}
                >
                  <span className="cd-tab-icon"><Flame size={13} className="text-orange-400" /></span>
                  Round {r}
                </button>
              ))}
            </div>

            <div className="cd-content">
              {selectedPost ? (
                <div className="cd-card">
                  {isEditing ? (
                    <>
                      <input
                        className="baljae-title-input"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        placeholder="제목을 입력하세요"
                      />
                      <BaljaeEditor
                        key={selectedPost.id + '-edit'}
                        content={editContent}
                        editable
                        onUpdate={setEditContent}
                      />
                      <div className="baljae-post-actions">
                        <button className="baljae-btn-save" onClick={savePost}><Save size={14} />저장</button>
                        <button className="baljae-btn-cancel" onClick={cancelEdit}><X size={14} />취소</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="baljae-view-header">
                        <h2 className="baljae-view-title">{selectedPost.title}</h2>
                        <div className="baljae-view-meta">
                          <span>{selectedPost.date}</span>
                          {isAdmin && (
                            <button className="baljae-btn-edit" onClick={() => startEdit(selectedPost)}><Pencil size={13} />수정</button>
                          )}
                          <button className="baljae-btn-back" onClick={() => setSelectedPost(null)}><X size={13} />목록</button>
                        </div>
                      </div>
                      <BaljaeEditor
                        key={selectedPost.id + '-view'}
                        content={selectedPost.content}
                        editable={false}
                      />
                    </>
                  )}
                </div>
              ) : (
                <div className="cd-card">
                  <div className="baljae-list-header">
                    <span className="baljae-list-title">Round {baljaeRound} 발제 자료</span>
                    {isAdmin && (
                      <button className="baljae-btn-new" onClick={startNew}><Plus size={14} />새 글 작성</button>
                    )}
                  </div>
                  {filteredPosts.length === 0 ? (
                    <p className="cd-empty">아직 발제 자료가 없습니다.</p>
                  ) : (
                    <ul className="baljae-post-list">
                      {filteredPosts.map(post => (
                        <li key={post.id} className="baljae-post-item" onClick={() => setSelectedPost(post)}>
                          <span className="baljae-post-item-title">{post.title}</span>
                          <span className="baljae-post-item-date">{post.date}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════ FEEDBACK VIEW ════════ */}
        {activePage === 'feedback' && (
          <>
            <div className="cd-round-label">피드백 — ROUND {feedbackRound}</div>
            {assignments.length === 0 ? (
              <div className="cd-content">
                <div className="cd-card">
                  <p className="cd-empty">등록된 과제가 없습니다.</p>
                </div>
              </div>
            ) : (
              <>
                <div className="cd-tabs">
                  {assignments.map((_, i) => {
                    const r = i + 1;
                    const sub = mySubmissions.get(assignments[i].id);
                    const statusIcon = !sub
                      ? <Flame size={13} className="text-orange-400" />
                      : sub.status === 'PASSED'
                        ? <CheckCircle size={13} style={{ color: 'var(--clr-green)' }} />
                        : sub.status === 'FAILED'
                          ? <X size={13} style={{ color: 'var(--clr-red)' }} />
                          : <Flame size={13} className="text-orange-400" />;
                    return (
                      <button
                        key={r}
                        className={`cd-tab${feedbackRound === r ? ' cd-tab--active' : ''}`}
                        onClick={() => setFeedbackRound(r)}
                      >
                        <span className="cd-tab-icon">{statusIcon}</span>
                        Round {r}
                      </button>
                    );
                  })}
                </div>
                <div className="cd-content">
                  {(() => {
                    const assign = assignments.find(a => a.roundNumber === feedbackRound) ?? null;
                    if (!assign) return null;
                    const sub = mySubmissions.get(assign.id);
                    return (
                      <div className="cd-card fb-card">
                        {/* 과제 정보 */}
                        <div className="fb-assign-info">
                          <span className="cd-week-badge">Round {feedbackRound}</span>
                          <p className="fb-assign-title">{assign.title}</p>
                          <div className="cd-deadline">
                            <span>제출 마감:&nbsp;</span>
                            <span className="cd-deadline-date">{formatDeadline(new Date(assign.deadline))}</span>
                          </div>
                        </div>

                        <div className="fb-divider" />

                        {/* 제출 + 피드백 상태 */}
                        {!sub ? (
                          <div className="fb-state fb-state--none">
                            <span className="fb-state-label">미제출</span>
                            <p className="fb-state-desc">아직 과제를 제출하지 않았습니다.</p>
                          </div>
                        ) : sub.status === 'SUBMITTED' ? (
                          <div className="fb-state fb-state--pending">
                            <span className="fb-state-label">검토 중</span>
                            <p className="fb-state-desc">제출한 과제를 운영자가 검토하고 있습니다.</p>
                            <a href={sub.content} target="_blank" rel="noreferrer" className="fb-link">{sub.content}</a>
                          </div>
                        ) : (
                          <div className={`fb-result fb-result--${sub.status.toLowerCase()}`}>
                            <div className="fb-result-header">
                              <span className={`fb-result-badge fb-result-badge--${sub.status.toLowerCase()}`}>
                                {sub.status === 'PASSED' ? '✓ 합격' : '✗ 불합격'}
                              </span>
                              <a href={sub.content} target="_blank" rel="noreferrer" className="fb-link">{sub.content}</a>
                            </div>
                            {sub.feedback ? (
                              <div className="fb-feedback-box">
                                <span className="fb-feedback-label">운영자 피드백</span>
                                <p className="fb-feedback-text">{sub.feedback}</p>
                              </div>
                            ) : (
                              <p className="fb-no-feedback">피드백이 작성되지 않았습니다.</p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default CourseDetailPage;

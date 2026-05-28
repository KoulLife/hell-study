import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Card from '@/components/ui/course-design-cards';
import type { CardData } from '@/components/ui/course-design-cards';
import { useAuth } from '@/contexts/AuthContext';
import { course as courseApi, enrollment as enrollmentApi } from '@/lib/api';
import type { Course } from '@/lib/api';
import { Trash2 } from 'lucide-react';

const COLOR_CYCLE: CardData['colorClass'][] = ['blue', 'green', 'orange', 'red'];

function courseToCardData(c: Course, index: number): CardData {
  return {
    id: c.id,
    colorClass: COLOR_CYCLE[index % COLOR_CYCLE.length],
    date: new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    title: c.title,
    description: c.description,
    progressPercent: '0%',
    progressValue: '0%',
    countdownText: c.createdByName,
  };
}

const CoursePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const [cards, setCards] = useState<CardData[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  const isUser = currentUser?.role === 'USER';

  const handleEnroll = async (courseId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (enrolledIds.has(courseId)) return;
    setEnrollingId(courseId);
    setEnrollError(null);
    try {
      await enrollmentApi.apply(courseId);
      setEnrolledIds(prev => new Set([...prev, courseId]));
    } catch (err) {
      const msg = err instanceof Error ? err.message : '신청 중 오류가 발생했습니다.';
      setEnrollError(msg);
    } finally {
      setEnrollingId(null);
    }
  };

  const [modalOpen, setModalOpen] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formRounds, setFormRounds] = useState(4);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN';

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (courseId: number, courseTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`"${courseTitle}" 코스를 삭제하시겠습니까?\n\n코스에 속한 모든 과제와 제출 기록이 함께 삭제됩니다.`)) return;
    setDeletingId(courseId);
    setDeleteError(null);
    try {
      await courseApi.delete(courseId);
      setCards(prev => prev.filter(c => c.id !== courseId));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : '삭제 중 오류가 발생했습니다.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    courseApi.getAll()
      .then((courses) => setCards(courses.map(courseToCardData)))
      .catch((err: Error) => setLoadError(err.message));

    if (isUser) {
      enrollmentApi.getMy()
        .then((enrollments) => {
          const activeIds = enrollments
            .filter(e => e.status === 'PENDING' || e.status === 'APPROVED')
            .map(e => e.courseId);
          setEnrolledIds(new Set(activeIds));
        })
        .catch(() => { /* 무시 — 버튼 비활성화 실패해도 페이지는 정상 동작 */ });
    }
  }, [isUser]);

  useEffect(() => {
    if (modalOpen) {
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [modalOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname.startsWith(path) ? { color: 'var(--clr-orange)' } : {};

  const openModal = () => {
    setFormTitle('');
    setFormDesc('');
    setFormRounds(4);
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setFormError('코스 이름을 입력해주세요.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      const created = await courseApi.create({ title: formTitle.trim(), description: formDesc.trim(), totalRounds: formRounds });
      setCards((prev) => [...prev, courseToCardData(created, prev.length)]);
      setModalOpen(false);
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : '코스 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

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
          <Link
            to="/course"
            style={{ fontSize: '0.875rem', color: 'var(--color-gray-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem', ...isActive('/course') }}
          >
            코스
          </Link>
          {currentUser?.role === 'SUPER_ADMIN' && (
            <Link
              to="/admin/users/pending"
              style={{ fontSize: '0.875rem', color: 'var(--color-gray-light)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem', ...isActive('/admin') }}
            >
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
          <button className="course-nav-logout" onClick={handleLogout}>
            로그아웃
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="course-main">
        <div className="course-header-section">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 className="course-page-title">내 강의실</h1>
              <p className="course-page-subtitle">지옥 같은 훈련이 천국 같은 결과를 만든다. 오늘도 불태워라.</p>
            </div>
            {isAdmin && (
              <button className="course-create-btn" onClick={openModal}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
                코스 생성
              </button>
            )}
          </div>
        </div>

        {loadError && (
          <p style={{ color: 'var(--clr-red)', fontSize: '0.875rem', marginBottom: '1rem' }}>{loadError}</p>
        )}

        {enrollError && (
          <p style={{ color: 'var(--clr-red)', fontSize: '0.875rem', marginBottom: '1rem' }}>{enrollError}</p>
        )}
        {deleteError && (
          <p style={{ color: 'var(--clr-red)', fontSize: '0.875rem', marginBottom: '1rem' }}>{deleteError}</p>
        )}

        {cards.length === 0 && !loadError && (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.9375rem' }}>
            {isAdmin ? '아직 코스가 없습니다. 코스를 생성해보세요.' : '아직 코스가 없습니다.'}
          </p>
        )}

        <div className="course-grid">
          {cards.map((card) => {
            const enrolled = enrolledIds.has(card.id);
            const loading = enrollingId === card.id;
            return (
              <div key={card.id} className="course-card-wrapper">
                <div onClick={() => navigate(`/course/${card.id}`)} style={{ cursor: 'pointer' }}>
                  <Card data={card} />
                </div>
                {isUser && (
                  <button
                    className={`course-card-enroll-btn${enrolled ? ' enrolled' : ''}`}
                    onClick={(e) => handleEnroll(card.id, e)}
                    disabled={loading || enrolled}
                  >
                    {loading ? (
                      '신청 중...'
                    ) : enrolled ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
                          <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                        </svg>
                        신청 완료
                      </>
                    ) : (
                      <>
                        수강 신청
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                          <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
                {isAdmin && (
                  <div className="course-card-admin-actions">
                    <button
                      className="course-card-enroll-btn admin-manage"
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/courses/${card.id}/enrollments`); }}
                    >
                      신청 관리
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" width="12" height="12">
                        <path fillRule="evenodd" d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      className="course-card-delete-btn"
                      onClick={(e) => handleDelete(card.id, card.title, e)}
                      disabled={deletingId === card.id}
                      title="코스 삭제"
                    >
                      {deletingId === card.id
                        ? <span style={{ fontSize: '0.75rem' }}>삭제 중...</span>
                        : <Trash2 size={14} />}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Course Create Modal */}
      {modalOpen && (
        <div className="course-modal-overlay" onClick={closeModal}>
          <div className="course-modal" onClick={(e) => e.stopPropagation()}>
            <div className="course-modal-header">
              <h2 className="course-modal-title">새 코스 생성</h2>
              <button className="course-modal-close" onClick={closeModal} disabled={submitting}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="course-modal-form">
              <div className="course-modal-field">
                <label className="course-modal-label" htmlFor="course-title">코스 이름 *</label>
                <input
                  id="course-title"
                  ref={titleInputRef}
                  className="course-modal-input"
                  type="text"
                  placeholder="예: Spring Boot 기초"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  disabled={submitting}
                  maxLength={100}
                />
              </div>

              <div className="course-modal-field">
                <label className="course-modal-label">총 라운드 수 *</label>
                <div className="course-stepper">
                  <button
                    type="button"
                    className="course-stepper-btn"
                    onClick={() => setFormRounds((v) => Math.max(1, v - 1))}
                    disabled={submitting || formRounds <= 1}
                    aria-label="라운드 감소"
                  >−</button>
                  <span className="course-stepper-value">{formRounds}</span>
                  <button
                    type="button"
                    className="course-stepper-btn"
                    onClick={() => setFormRounds((v) => Math.min(52, v + 1))}
                    disabled={submitting || formRounds >= 52}
                    aria-label="라운드 증가"
                  >+</button>
                </div>
              </div>

              <div className="course-modal-field">
                <label className="course-modal-label" htmlFor="course-desc">코스 설명</label>
                <textarea
                  id="course-desc"
                  className="course-modal-textarea"
                  placeholder="코스에 대한 간단한 설명을 입력하세요."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  disabled={submitting}
                  rows={4}
                  maxLength={500}
                />
              </div>

              {formError && (
                <p className="course-modal-error">{formError}</p>
              )}

              <div className="course-modal-actions">
                <button type="button" className="course-modal-btn-cancel" onClick={closeModal} disabled={submitting}>
                  취소
                </button>
                <button type="submit" className="course-modal-btn-submit" disabled={submitting}>
                  {submitting ? '생성 중...' : '코스 생성'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePage;

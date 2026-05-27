import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  ChevronDown, ChevronRight, HelpCircle, LogOut, Flame,
  Upload, RotateCcw, MessageSquare, CheckSquare, Plus, Pencil, Save, X,
} from 'lucide-react';
import BaljaeEditor from '@/components/ui/baljae-editor';

// ── Course metadata ──────────────────────────────────────────────
const COURSES: Record<string, { name: string }> = {
  '1': { name: 'Java' }, '2': { name: 'React' }, '3': { name: 'Python' },
  '4': { name: 'TypeScript' }, '5': { name: 'Node.js' }, '6': { name: 'SQL' },
};

// ── Assignment data ──────────────────────────────────────────────
interface RoundData { week: string; deadline: Date; title: string; hint: string; submitted: boolean; }

const ROUND_DATA: Record<string, RoundData[]> = {
  '1': [
    { week: '1주차', deadline: new Date('2025-05-08T18:00:00'), title: '클래스와 객체를 설계하고, 기본 문법을 익힌다.', hint: '캡슐화와 접근 제어자를 통해 객체의 상태를 보호하는 법을 배웁니다.', submitted: true },
    { week: '2주차', deadline: new Date('2025-05-15T18:00:00'), title: '상속과 다형성을 활용하여 재사용 가능한 코드를 작성한다.', hint: '추상 클래스와 인터페이스를 통해 다형성을 구현하는 법을 배웁니다.', submitted: true },
    { week: '3주차', deadline: new Date('2025-05-29T18:00:00'), title: '객체 간 협력을 설계하고, 의도를 코드로 드러낸다.', hint: '도메인 모델링을 통해 현실 세계 개념을 코드로 표현하는 법을 배웁니다.', submitted: false },
  ],
  '2': [
    { week: '1주차', deadline: new Date('2025-05-08T18:00:00'), title: '컴포넌트를 분리하고 Props 설계 원칙을 익힌다.', hint: '단방향 데이터 흐름과 컴포넌트 책임 분리를 배웁니다.', submitted: true },
    { week: '2주차', deadline: new Date('2025-05-15T18:00:00'), title: 'useState와 useEffect로 상태 흐름을 제어한다.', hint: '사이드 이펙트를 의도적으로 다루는 방법을 배웁니다.', submitted: true },
    { week: '3주차', deadline: new Date('2025-05-29T18:00:00'), title: '전역 상태를 설계하고 Context API로 공유한다.', hint: '관심사 분리와 Custom Hook으로 상태 로직을 추상화합니다.', submitted: false },
  ],
  '3': [
    { week: '1주차', deadline: new Date('2025-05-08T18:00:00'), title: 'NumPy와 Pandas로 데이터를 조작한다.', hint: '벡터화 연산과 DataFrame 조작의 핵심 패턴을 익힙니다.', submitted: true },
    { week: '2주차', deadline: new Date('2025-05-15T18:00:00'), title: 'Matplotlib으로 데이터를 시각화하고 인사이트를 도출한다.', hint: '데이터 분포와 상관관계를 시각적으로 표현하는 법을 배웁니다.', submitted: true },
    { week: '3주차', deadline: new Date('2025-05-29T18:00:00'), title: 'sklearn으로 첫 머신러닝 모델을 구축하고 평가한다.', hint: '과적합 방지와 교차 검증을 통해 일반화 성능을 높입니다.', submitted: false },
  ],
  '4': [
    { week: '1주차', deadline: new Date('2025-05-08T18:00:00'), title: '타입 시스템을 이해하고 인터페이스를 설계한다.', hint: '구조적 타이핑과 타입 추론의 원리를 배웁니다.', submitted: true },
    { week: '2주차', deadline: new Date('2025-05-15T18:00:00'), title: '제네릭을 활용하여 재사용 가능한 타입을 만든다.', hint: '제약 조건과 기본값을 통해 유연한 제네릭 타입을 설계합니다.', submitted: true },
    { week: '3주차', deadline: new Date('2025-05-29T18:00:00'), title: '유틸리티 타입과 조건부 타입으로 타입을 조합한다.', hint: 'Mapped Type과 infer 키워드로 고급 타입 패턴을 구현합니다.', submitted: false },
  ],
  '5': [
    { week: '1주차', deadline: new Date('2025-05-08T18:00:00'), title: 'Express 미들웨어를 이해하고 라우터를 구성한다.', hint: '요청-응답 사이클과 미들웨어 체인의 흐름을 배웁니다.', submitted: true },
    { week: '2주차', deadline: new Date('2025-05-15T18:00:00'), title: 'RESTful 원칙에 따라 API를 설계하고 구현한다.', hint: '리소스 중심 설계와 HTTP 메서드의 올바른 사용법을 배웁니다.', submitted: true },
    { week: '3주차', deadline: new Date('2025-05-29T18:00:00'), title: 'JWT 인증을 구현하고 API를 보안한다.', hint: '액세스 토큰과 리프레시 토큰 전략을 통해 인증 흐름을 설계합니다.', submitted: false },
  ],
  '6': [
    { week: '1주차', deadline: new Date('2025-05-08T18:00:00'), title: 'DDL로 스키마를 설계하고 DML로 데이터를 조작한다.', hint: '정규화 원칙을 적용하여 중복 없는 테이블을 설계합니다.', submitted: true },
    { week: '2주차', deadline: new Date('2025-05-15T18:00:00'), title: 'JOIN과 서브쿼리로 복잡한 데이터를 조회한다.', hint: '실행 계획을 분석하여 쿼리 성능을 이해하는 법을 배웁니다.', submitted: true },
    { week: '3주차', deadline: new Date('2025-05-29T18:00:00'), title: '인덱스를 설계하고 쿼리 성능을 최적화한다.', hint: 'B-Tree 인덱스 구조와 적절한 인덱스 전략을 학습합니다.', submitted: false },
  ],
};

// ── Feedback data ────────────────────────────────────────────────
interface EvalItem { label: string; passed: boolean; }
interface FeedbackData { evalItems: EvalItem[]; reviewPoints: string[]; detailFeedback: string; }

const makeFeedbackData = (courseName: string): (FeedbackData | null)[] => [
  {
    evalItems: [
      { label: '구현 과제 통과', passed: true },
      { label: '구현 과제 라이징 탤런트', passed: false },
      { label: '라이팅 과제 통과', passed: true },
      { label: '라이팅 과제 라이징 탤런트', passed: false },
    ],
    reviewPoints: [
      `${courseName} 핵심 개념 이해는 좋으나, 실제 구현에서 책임 분리가 아직 명확하지 않은 부분이 있습니다.`,
      `예외 처리 전략이 일관되지 않습니다. 비즈니스 예외와 시스템 예외를 구분하는 기준을 먼저 정해보세요.`,
      `코드의 의도가 잘 드러나지 않는 부분이 있습니다. 변수명과 메서드명을 더 명확하게 개선해보세요.`,
    ],
    detailFeedback: `<ol><li><p><strong>전반적으로 기초를 잘 이해하고 있습니다.</strong> ${courseName}의 핵심 개념을 코드로 잘 표현했습니다. 다음 라운드에서는 설계의 의도를 더 명확히 드러내는 데 집중해보세요.</p></li><li><p>예외 처리는 비즈니스 예외와 시스템 예외를 구분하여 처리하는 것이 좋습니다. 커스텀 예외 클래스를 정의하고 일관된 핸들링 전략을 적용해보세요.</p></li><li><p>코드는 동작보다 의도를 표현해야 합니다. 좋은 이름은 주석이 필요 없게 만듭니다. 메서드와 변수 이름을 다시 검토해보세요.</p></li></ol>`,
  },
  {
    evalItems: [
      { label: '구현 과제 통과', passed: true },
      { label: '구현 과제 라이징 탤런트', passed: true },
      { label: '라이팅 과제 통과', passed: true },
      { label: '라이팅 과제 라이징 탤런트', passed: false },
    ],
    reviewPoints: [
      `Round 1 피드백을 잘 반영했습니다. 책임 분리가 눈에 띄게 개선되었습니다.`,
      `의존성 방향이 일부 역전되지 않은 부분이 있습니다. 인터페이스를 활용한 DIP 적용을 고민해보세요.`,
      `테스트 코드가 핵심 로직에 집중되어 있어 좋습니다. 경계값과 예외 케이스도 추가해보세요.`,
    ],
    detailFeedback: `<ol><li><p>Round 1 피드백을 충실히 반영한 것이 눈에 띕니다. <strong>구현 과제 라이징 탤런트</strong>에 선정될 만한 완성도입니다. 설계 의도가 코드 전반에 잘 드러났습니다.</p></li><li><p>DIP 적용은 구체 클래스 대신 추상화에 의존하도록 설계합니다. Service가 Repository 구현체에 직접 의존하는 부분을 인터페이스로 분리해 테스트 용이성도 높여보세요.</p></li><li><p>테스트는 잘 작성되었습니다. Happy path 외에 경계값과 예외 흐름에 대한 케이스를 추가하면 더욱 견고해집니다.</p></li></ol>`,
  },
  null,
];

// ── Baljae post data ─────────────────────────────────────────────
interface Post { id: string; round: number; title: string; content: string; date: string; }

const makeInitialPosts = (courseName: string): Post[] => [
  {
    id: 'r1-p1', round: 1, date: '2025-05-08',
    title: `[Round 1] ${courseName} 기초 개념 발제`,
    content: `<h2>📌 핵심 개념</h2><p>이번 라운드에서는 <strong>${courseName}의 핵심 기초</strong>를 다룹니다. 아래 내용을 숙지하고 과제에 임해주세요.</p><h3>학습 목표</h3><ul><li>기본 문법과 구조 이해</li><li>핵심 패턴 실습</li><li>코드 리뷰 기준 파악</li></ul><blockquote><p>기초가 탄탄해야 심화가 흔들리지 않습니다.</p></blockquote><h3>참고 자료</h3><p>공식 문서와 함께 학습하면 이해가 더 깊어집니다. 모르는 부분은 Q&amp;A 세션을 활용하세요.</p>`,
  },
  {
    id: 'r2-p1', round: 2, date: '2025-05-15',
    title: `[Round 2] ${courseName} 심화 설계 발제`,
    content: `<h2>🎯 이번 라운드 목표</h2><p>Round 1에서 배운 기초를 바탕으로 <strong>실제 설계 문제</strong>에 적용합니다.</p><h3>주요 패턴</h3><ol><li>책임 분리와 의존성 관리</li><li>재사용 가능한 구조 설계</li><li>테스트 가능한 코드 작성</li></ol><h3>💻 실습 포인트</h3><pre><code>// 이번 주 과제의 핵심\n// 아래 구조를 직접 구현해보세요</code></pre><blockquote><p>설계는 코드를 작성하기 전에 이미 절반이 완성되어야 합니다.</p></blockquote>`,
  },
  {
    id: 'r3-p1', round: 3, date: '2025-05-29',
    title: `[Round 3] ${courseName} 협력과 최적화 발제`,
    content: `<h2>🚀 최종 라운드 발제</h2><p>지금까지 배운 모든 내용을 통합하여 <strong>완성도 높은 결과물</strong>을 만들어냅니다.</p><h3>체크리스트</h3><ul><li>Round 1~2 피드백 반영 여부</li><li>코드 가독성과 의도 표현</li><li>엣지 케이스 처리</li><li>성능과 유지보수성 균형</li></ul><h3>평가 기준</h3><p>단순히 동작하는 코드가 아닌, <strong>의도가 명확하게 드러나는 코드</strong>를 작성하는 것이 목표입니다.</p><blockquote><p>지옥 같은 훈련이 천국 같은 결과를 만든다.</p></blockquote>`,
  },
];

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

// ── Component ────────────────────────────────────────────────────
const CourseDetailPage = () => {
  const { id = '1' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const course = COURSES[id] ?? COURSES['1'];
  const rounds = ROUND_DATA[id] ?? ROUND_DATA['1'];

  // Page state
  type ActivePage = 'assignment' | 'baljae' | 'feedback';
  const [activePage, setActivePage] = useState<ActivePage>('assignment');

  // Assignment state
  const [activeRound, setActiveRound] = useState(3);
  const [activeTab, setActiveTab] = useState<'impl' | 'writing'>('impl');
  const [submitted, setSubmitted] = useState(false);

  // Sidebar state
  const [roundOpen, setRoundOpen] = useState(true);
  const [baljaeOpen, setBaljaeOpen] = useState(false);

  // Baljae state
  const [baljaeRound, setBaljaeRound] = useState(1);
  const [posts, setPosts] = useState<Post[]>(() => makeInitialPosts(course.name));
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isNewPost, setIsNewPost] = useState(false);
  const [feedbackRound, setFeedbackRound] = useState(1);
  const feedbackData = makeFeedbackData(course.name);

  const currentRound = activeRound > 0 ? rounds[activeRound - 1] : null;
  const countdown = useCountdown(currentRound?.deadline ?? null);
  const formatDeadline = (d: Date) =>
    `${d.getMonth() + 1}월 ${d.getDate()}일 오후 ${d.getHours() >= 12 ? d.getHours() - 12 || 12 : d.getHours()}시 ${String(d.getMinutes()).padStart(2, '0')}분`;

  const roundTabs = [
    { id: 0, label: 'Ready', icon: null },
    { id: 1, label: 'Round 1', icon: <Flame size={13} className="text-orange-400" /> },
    { id: 2, label: 'Round 2', icon: <Flame size={13} className="text-orange-400" /> },
    { id: 3, label: 'Round 3', icon: <Flame size={13} className="text-orange-400" /> },
  ];

  const roundPostTabs = [1, 2, 3];
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

  // ── Render ──────────────────────────────────────────────────────
  const breadcrumbSection = activePage === 'baljae'
    ? '발제'
    : activePage === 'feedback'
    ? '피드백'
    : '발제자료, 과제제출';

  return (
    <div className="cd-layout">
      {/* ── Sidebar ── */}
      <aside className="cd-sidebar">
        <div className="cd-sidebar-top">
          <div className="cd-logo-row" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/logo.png" alt="logo" className="cd-logo-img" />
            <span className="cd-logo-text"><span className="cd-logo-hell">Hell</span> Study</span>
          </div>
          <div className="cd-user-greeting">
            안녕하세요 {currentUser?.name ?? '수강생'}님
          </div>

          {/* Page nav links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem', padding: '0 0 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '0.375rem' }}>
            <Link
              to="/course"
              style={{ padding: '0.4rem 1.125rem', fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem', borderRadius: 0 }}
            >
              ← 코스 목록
            </Link>
            {currentUser?.role === 'SUPER_ADMIN' && (
              <Link
                to="/admin/users/pending"
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
              onClick={() => { setBaljaeOpen(v => !v); setActivePage('baljae'); setSelectedPost(null); setIsEditing(false); }}
            >
              <span>발제</span>
              {baljaeOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
            {baljaeOpen && (
              <div className="cd-nav-sub">
                {roundPostTabs.map(r => (
                  <button
                    key={r}
                    className={`cd-nav-subitem${activePage === 'baljae' && baljaeRound === r ? ' cd-nav-subitem--active' : ''}`}
                    onClick={() => { setActivePage('baljae'); setBaljaeRound(r); setSelectedPost(null); setIsEditing(false); }}
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
                  onClick={() => setActivePage('assignment')}
                >
                  발제자료, 과제제출
                </button>
              </div>
            )}

            <button
              className={`cd-nav-item${activePage === 'feedback' ? ' cd-nav-item--active' : ''}`}
              onClick={() => setActivePage('feedback')}
            >
              피드백
            </button>
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
        {/* Breadcrumb */}
        <div className="cd-breadcrumb">
          <span className="cd-breadcrumb-link" onClick={() => navigate('/course')}>강의 목록</span>
          <span className="cd-breadcrumb-sep">/</span>
          <span className="cd-breadcrumb-link">{course.name}</span>
          <span className="cd-breadcrumb-sep">/</span>
          <span>{breadcrumbSection}</span>
          {selectedPost && <><span className="cd-breadcrumb-sep">/</span><span className="cd-breadcrumb-view">View</span></>}
        </div>

        {/* ════════ ASSIGNMENT VIEW ════════ */}
        {activePage === 'assignment' && (
          <>
            <div className="cd-round-label">{activeRound === 0 ? 'READY' : `ROUND ${activeRound}`}</div>
            <div className="cd-tabs">
              {roundTabs.map(t => (
                <button key={t.id} className={`cd-tab${activeRound === t.id ? ' cd-tab--active' : ''}`} onClick={() => setActiveRound(t.id)}>
                  {t.icon && <span className="cd-tab-icon">{t.icon}</span>}
                  {t.label}
                </button>
              ))}
            </div>
            <div className="cd-content">
              {activeRound === 0 ? (
                <div className="cd-card"><p className="cd-empty">아직 라운드가 시작되지 않았습니다.</p></div>
              ) : currentRound ? (
                <>
                  <div className="cd-card">
                    <div className="cd-rising-header">
                      <span className="cd-rising-badge">RISING TALENT PLAYER</span>
                      <span className="cd-rising-sub">라이징 탤런트 플레이어</span>
                    </div>
                    <div className="cd-rising-tabs">
                      <button className={`cd-rising-tab${activeTab === 'impl' ? '' : ' inactive'}`} onClick={() => setActiveTab('impl')}>구현 과제</button>
                      <button className={`cd-rising-tab-text${activeTab === 'writing' ? ' active' : ''}`} onClick={() => setActiveTab('writing')}>라이팅 과제</button>
                    </div>
                    <p className="cd-empty-small">해당 과제의 라이징 탤런트가 없습니다.</p>
                  </div>
                  <div className="cd-card">
                    <div className="cd-assign-top">
                      <span className="cd-week-badge">{currentRound.week}</span>
                      <div className="cd-deadline">
                        <span>제출 마감:&nbsp;</span>
                        <span className="cd-deadline-date">{formatDeadline(currentRound.deadline)}</span>
                        {countdown && !currentRound.submitted && <span className="cd-countdown">({countdown})</span>}
                      </div>
                    </div>
                    <p className="cd-assign-title">{currentRound.title}</p>
                    <div className="cd-hint">
                      <CheckSquare size={15} className="cd-hint-icon" />
                      <span className="cd-hint-label">Hint</span>
                      <span className="cd-hint-text">{currentRound.hint}</span>
                    </div>
                    <div className="cd-assign-actions">
                      {currentRound.submitted || submitted ? (
                        <button className="cd-btn-submitted" disabled>✓ 제출 완료</button>
                      ) : (
                        <button className="cd-btn-submit" onClick={() => setSubmitted(true)}><Upload size={14} />제출하기</button>
                      )}
                    </div>
                    <div className="cd-assign-footer">
                      <button className="cd-footer-link"><RotateCcw size={13} />발제 다시보기</button>
                      <button className="cd-footer-link"><MessageSquare size={13} />Q&A 세션 다시보기</button>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          </>
        )}

        {/* ════════ BALJAE VIEW ════════ */}
        {activePage === 'baljae' && (
          <>
            <div className="cd-round-label">발제 — ROUND {baljaeRound}</div>

            {/* Round tabs */}
            <div className="cd-tabs">
              {roundPostTabs.map(r => (
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
              {/* Post detail / editor */}
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
                          <button className="baljae-btn-edit" onClick={() => startEdit(selectedPost)}><Pencil size={13} />수정</button>
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
                /* Post list */
                <div className="cd-card">
                  <div className="baljae-list-header">
                    <span className="baljae-list-title">Round {baljaeRound} 발제 자료</span>
                    <button className="baljae-btn-new" onClick={startNew}><Plus size={14} />새 글 작성</button>
                  </div>
                  {filteredPosts.length === 0 ? (
                    <p className="cd-empty">아직 게시물이 없습니다. 새 글을 작성해보세요.</p>
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
        {activePage === 'feedback' && (() => {
          const fd = feedbackData[feedbackRound - 1];
          return (
            <>
              <div className="cd-round-label">피드백 — ROUND {feedbackRound}</div>
              <div className="cd-tabs">
                {[1, 2, 3].map(r => (
                  <button
                    key={r}
                    className={`cd-tab${feedbackRound === r ? ' cd-tab--active' : ''}`}
                    onClick={() => setFeedbackRound(r)}
                  >
                    <span className="cd-tab-icon"><Flame size={13} className="text-orange-400" /></span>
                    Round {r}
                  </button>
                ))}
              </div>
              <div className="cd-content">
                {fd === null ? (
                  <div className="cd-card">
                    <p className="cd-empty">아직 피드백이 없습니다. 과제 제출 후 피드백을 확인하세요.</p>
                  </div>
                ) : (
                  <div className="cd-card">
                    <div className="cd-feedback-header">
                      <span className="cd-feedback-title">수강생님 종합 피드백</span>
                      <span className="cd-feedback-round-badge">Round {feedbackRound}</span>
                    </div>

                    {/* 평가 항목 */}
                    <div className="cd-feedback-section">
                      <div className="cd-feedback-section-title">평가 항목</div>
                      <div className="cd-eval-items">
                        {fd.evalItems.map((item, i) => (
                          <div key={i} className="cd-eval-item">
                            <span className="cd-eval-label">{item.label}</span>
                            <span className={`cd-eval-badge${item.passed ? ' cd-eval-badge--pass' : ' cd-eval-badge--fail'}`}>
                              {item.passed ? '통과' : '미통과'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 리뷰포인트 */}
                    <div className="cd-feedback-section">
                      <div className="cd-feedback-section-title">리뷰포인트 (수강생 질문)</div>
                      <div className="cd-review-points">
                        {fd.reviewPoints.map((point, i) => (
                          <div key={i} className="cd-review-item">
                            <span className="cd-review-num">{i + 1}.</span>
                            <span className="cd-review-text">{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 상세 피드백 */}
                    <div className="cd-feedback-section">
                      <div className="cd-feedback-section-title">상세 피드백</div>
                      <div className="cd-detail-feedback" dangerouslySetInnerHTML={{ __html: fd.detailFeedback }} />
                    </div>
                  </div>
                )}
              </div>
            </>
          );
        })()}
      </main>
    </div>
  );
};

export default CourseDetailPage;

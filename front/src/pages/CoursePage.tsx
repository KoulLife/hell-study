import { useNavigate, useLocation, Link } from 'react-router-dom';
import Card from '@/components/ui/course-design-cards';
import type { CardData } from '@/components/ui/course-design-cards';
import { useAuth } from '@/contexts/AuthContext';

const courseData: CardData[] = [
  {
    id: 1,
    colorClass: 'blue',
    date: 'Jan 15, 2025',
    title: 'Java',
    description: 'Spring Boot 백엔드 개발',
    progressPercent: '75%',
    progressValue: '75%',
    imgSrc1: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt1: 'Instructor',
    imgSrc2: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt2: 'Student',
    countdownText: '5 days left',
  },
  {
    id: 2,
    colorClass: 'green',
    date: 'Feb 01, 2025',
    title: 'React',
    description: '프론트엔드 개발',
    progressPercent: '45%',
    progressValue: '45%',
    imgSrc1: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt1: 'Instructor',
    imgSrc2: 'https://images.pexels.com/photos/874158/pexels-photo-874158.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt2: 'Student',
    countdownText: '2 weeks left',
  },
  {
    id: 3,
    colorClass: 'orange',
    date: 'Feb 20, 2025',
    title: 'Python',
    description: '데이터 사이언스 & AI',
    progressPercent: '30%',
    progressValue: '30%',
    imgSrc1: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt1: 'Instructor',
    imgSrc2: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt2: 'Student',
    countdownText: '3 weeks left',
  },
  {
    id: 4,
    colorClass: 'red',
    date: 'Mar 10, 2025',
    title: 'TypeScript',
    description: '타입 안전 개발',
    progressPercent: '60%',
    progressValue: '60%',
    imgSrc1: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt1: 'Instructor',
    imgSrc2: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt2: 'Student',
    countdownText: '1 month left',
  },
  {
    id: 5,
    colorClass: 'green',
    date: 'Mar 25, 2025',
    title: 'Node.js',
    description: 'REST API 설계',
    progressPercent: '20%',
    progressValue: '20%',
    imgSrc1: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt1: 'Instructor',
    imgSrc2: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt2: 'Student',
    countdownText: '5 weeks left',
  },
  {
    id: 6,
    colorClass: 'blue',
    date: 'Apr 05, 2025',
    title: 'SQL',
    description: '데이터베이스 설계',
    progressPercent: '55%',
    progressValue: '55%',
    imgSrc1: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt1: 'Instructor',
    imgSrc2: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    imgAlt2: 'Student',
    countdownText: '2 weeks left',
  },
];

const CoursePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname.startsWith(path) ? { color: 'var(--clr-orange)' } : {};

  return (
    <div className="course-page">
      {/* Navbar */}
      <nav className="course-nav">
        <div className="course-nav-left" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/logo.png" alt="Hell Study" className="course-nav-logo" />
          <span className="course-nav-title">
            <span className="course-nav-hell">Hell</span> Study
          </span>
        </div>

        {/* Center nav links */}
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
          <h1 className="course-page-title">내 강의실</h1>
          <p className="course-page-subtitle">지옥 같은 훈련이 천국 같은 결과를 만든다. 오늘도 불태워라.</p>
        </div>

        <div className="course-grid">
          {courseData.map((card) => (
            <div
              key={card.id}
              onClick={() => navigate(`/course/${card.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <Card data={card} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CoursePage;

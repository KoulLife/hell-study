import React, { useState, useEffect } from 'react';
import { SignInPage } from '@/components/ui/sign-in';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const registered = (location.state as { registered?: boolean } | null)?.registered;

  const [showBanner, setShowBanner] = useState(!!registered);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!registered) return;
    const timer = setTimeout(() => setShowBanner(false), 4000);
    return () => clearTimeout(timer);
  }, [registered]);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const loginId = (form.elements.namedItem('loginId') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    setIsLoading(true);
    try {
      await login(loginId, password);
      navigate('/course');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground h-[100dvh] overflow-hidden">
      <div
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-green-500/40 bg-green-500/10 px-6 py-3 text-sm text-green-400"
        style={{
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          opacity: showBanner ? 1 : 0,
          transform: showBanner ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(-12px)',
          pointerEvents: showBanner ? 'auto' : 'none',
        }}
      >
        회원가입 신청이 완료됐습니다. 관리자 승인 후 로그인할 수 있습니다.
      </div>
      <SignInPage
        logoSrc="/logo.png"
        title={
          <span className="font-semibold tracking-tight">
            <span className="text-orange-400">Hell</span> Study
          </span>
        }
        description="지식은 불꽃처럼 타오릅니다. 로그인하고 공부를 시작하세요."
        heroImageSrc="https://static0.polygonimages.com/wordpress/wp-content/uploads/chorus/uploads/chorus_asset/file/24134890/damone_dragon_house_episode_10.jpg?w=1600&h=900&fit=crop"
        onSignIn={handleSignIn}
        onCreateAccount={() => navigate('/signup')}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default LoginPage;

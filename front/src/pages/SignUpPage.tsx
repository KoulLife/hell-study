import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignUpPage as SignUpForm } from '@/components/ui/sign-up';
import { auth } from '@/lib/api';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const data = {
      loginId: (form.elements.namedItem('loginId') as HTMLInputElement).value,
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      password: (form.elements.namedItem('password') as HTMLInputElement).value,
    };

    setIsLoading(true);
    try {
      await auth.register(data);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입 신청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-foreground h-[100dvh] overflow-hidden">
      <SignUpForm
        logoSrc="/logo.png"
        title={
          <span className="font-semibold tracking-tight">
            <span className="text-orange-400">Hell</span> Study
          </span>
        }
        description="회원가입 후 관리자 승인이 완료되면 서비스를 이용할 수 있습니다."
        heroImageSrc="https://static0.polygonimages.com/wordpress/wp-content/uploads/chorus/uploads/chorus_asset/file/24134890/damone_dragon_house_episode_10.jpg?w=1600&h=900&fit=crop"
        onSignUp={handleSignUp}
        onSignIn={() => navigate('/login')}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default SignUpPage;

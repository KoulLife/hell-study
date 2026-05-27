import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SignUpPageProps {
  logoSrc?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  onSignIn?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-orange-500/70 focus-within:bg-orange-500/10">
    {children}
  </div>
);

export const SignUpPage: React.FC<SignUpPageProps> = ({
  logoSrc,
  title = <span className="font-light text-foreground tracking-tighter">회원가입</span>,
  description = '계정을 만들고 Hell Study를 시작하세요.',
  heroImageSrc,
  onSignUp,
  onSignIn,
  isLoading = false,
  error = null,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-full overflow-hidden">
      {/* Left column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              {logoSrc && (
                <img
                  src={logoSrc}
                  alt="logo"
                  className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(234,88,12,0.5)] flex-shrink-0"
                />
              )}
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">{title}</h1>
            </div>
            <p className="text-muted-foreground">{description}</p>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={onSignUp}>
              <div>
                <label className="text-sm font-medium text-muted-foreground">아이디</label>
                <GlassInputWrapper>
                  <input
                    name="loginId"
                    type="text"
                    placeholder="사용할 아이디를 입력하세요"
                    autoComplete="username"
                    required
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">이름</label>
                <GlassInputWrapper>
                  <input
                    name="name"
                    type="text"
                    placeholder="실명을 입력하세요"
                    autoComplete="name"
                    required
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">이메일</label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    placeholder="이메일 주소를 입력하세요"
                    autoComplete="email"
                    required
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">비밀번호</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 입력하세요"
                      autoComplete="new-password"
                      required
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center"
                    >
                      {showPassword
                        ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                        : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '신청 중...' : '회원가입 신청'}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onSignIn?.(); }}
                className="text-orange-400 hover:underline transition-colors"
              >
                로그인
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div
            className="absolute inset-4 rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          />
        </section>
      )}
    </div>
  );
};

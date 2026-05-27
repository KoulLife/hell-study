import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SignInPageProps {
  logoSrc?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onCreateAccount?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-orange-500/70 focus-within:bg-orange-500/10">
    {children}
  </div>
);

export const SignInPage: React.FC<SignInPageProps> = ({
  logoSrc,
  title = <span className="font-light text-foreground tracking-tighter">Welcome</span>,
  description = 'Access your account and continue your journey with us',
  heroImageSrc,
  onSignIn,
  onCreateAccount,
  isLoading = false,
  error = null,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-full overflow-hidden">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <div className="animate-element animate-delay-100 flex items-center gap-3">
              {logoSrc && (
                <img src={logoSrc} alt="logo" className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(234,88,12,0.5)] flex-shrink-0" />
              )}
              <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                {title}
              </h1>
            </div>
            <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

            {error && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form className="space-y-5" onSubmit={onSignIn}>
              <div className="animate-element animate-delay-300">
                <label className="text-sm font-medium text-muted-foreground">아이디</label>
                <GlassInputWrapper>
                  <input
                    name="loginId"
                    type="text"
                    placeholder="아이디를 입력하세요"
                    autoComplete="username"
                    required
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">비밀번호</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="비밀번호를 입력하세요"
                      autoComplete="current-password"
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
                className="animate-element animate-delay-500 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <p className="animate-element animate-delay-600 text-center text-sm text-muted-foreground">
              계정이 없으신가요?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }}
                className="text-orange-400 hover:underline transition-colors"
              >
                회원가입 신청
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div
            className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          />
        </section>
      )}
    </div>
  );
};

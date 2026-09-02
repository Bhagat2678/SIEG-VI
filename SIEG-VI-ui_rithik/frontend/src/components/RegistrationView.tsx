import React, { useState } from 'react';

interface RegistrationViewProps {
  onLoginSuccess: () => void;
}

export const RegistrationView: React.FC<RegistrationViewProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter email and password');
        return;
      }
    } else {
      if (!firstName || !lastName || !email || !password || !phone || !agreeTerms) {
        setError('Please fill in all fields and accept the terms');
        return;
      }
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLoginSuccess();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf9f4] to-[#f1ede8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#144227] text-[#9ed0ab] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="material-symbols-outlined text-[32px]">eco</span>
          </div>
          <h1 className="text-[32px] font-bold text-[#144227] mb-2">AyurLife</h1>
          <p className="text-[14px] text-[#717971]">Harmonious Vitality</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#c1c9c0]/30 p-8 md:p-10">
          {/* Tabs */}
          <div className="flex gap-4 mb-8 bg-[#f7f3ee] p-1 rounded-full">
            <button
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
              className={`flex-1 py-3 rounded-full font-semibold text-[14px] transition-all ${
                isLogin
                  ? 'bg-white text-[#144227] shadow-sm'
                  : 'text-[#717971] hover:text-[#414942]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
              className={`flex-1 py-3 rounded-full font-semibold text-[14px] transition-all ${
                !isLogin
                  ? 'bg-white text-[#144227] shadow-sm'
                  : 'text-[#717971] hover:text-[#414942]'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-[#a13f1f]/10 border border-[#a13f1f]/30 text-[#a13f1f] text-[13px] font-medium flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] mt-0.5 shrink-0">
                  error
                </span>
                {error}
              </div>
            )}

            {/* Registration Fields */}
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[#414942] uppercase tracking-wider mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="w-full px-4 py-3 rounded-xl bg-[#f7f3ee] text-[#1c1c19] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227] text-[14px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[#414942] uppercase tracking-wider mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="w-full px-4 py-3 rounded-xl bg-[#f7f3ee] text-[#1c1c19] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227] text-[14px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#414942] uppercase tracking-wider mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 rounded-xl bg-[#f7f3ee] text-[#1c1c19] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227] text-[14px]"
                  />
                </div>
              </>
            )}

            {/* Email */}
            <div>
              <label className="block text-[12px] font-bold text-[#414942] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl bg-[#f7f3ee] text-[#1c1c19] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227] text-[14px]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[12px] font-bold text-[#414942] uppercase tracking-wider mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-[#f7f3ee] text-[#1c1c19] border border-[#c1c9c0]/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#144227] text-[14px]"
              />
              {isLogin && (
                <button
                  type="button"
                  className="text-[12px] text-[#144227] hover:underline mt-2 font-medium"
                >
                  Forgot password?
                </button>
              )}
            </div>

            {/* Terms & Conditions */}
            {!isLogin && (
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 rounded-lg border border-[#c1c9c0]/40 accent-[#144227] mt-0.5"
                />
                <span className="text-[12px] text-[#414942]">
                  I agree to the{' '}
                  <button
                    type="button"
                    className="text-[#144227] hover:underline font-semibold"
                  >
                    Terms of Service
                  </button>{' '}
                  and{' '}
                  <button
                    type="button"
                    className="text-[#144227] hover:underline font-semibold"
                  >
                    Privacy Policy
                  </button>
                </span>
              </label>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#144227] hover:bg-[#2d5a3d] text-white font-bold text-[15px] rounded-xl transition-all active:scale-[0.98] disabled:opacity-70 mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">
                    {isLogin ? 'login' : 'person_add'}
                  </span>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          {/* Social Login */}
          {isLogin && (
            <>
              <div className="my-6 flex items-center gap-3">
                <div className="flex-1 h-px bg-[#c1c9c0]/30" />
                <span className="text-[12px] text-[#717971] font-medium">OR</span>
                <div className="flex-1 h-px bg-[#c1c9c0]/30" />
              </div>

              <button
                type="button"
                className="w-full py-3 border-2 border-[#c1c9c0]/40 rounded-xl text-[14px] font-semibold text-[#414942] hover:bg-[#f7f3ee] transition-colors flex items-center justify-center gap-2"
              >
                <span className="text-[20px]">🔐</span>
                Continue with ABHA ID
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-[12px] text-[#717971] mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#144227] hover:underline font-semibold"
          >
            {isLogin ? 'Register' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
};

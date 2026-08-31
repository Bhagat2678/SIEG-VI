import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Volume2,
  Activity,
  Globe,
  Mail,
  Smartphone,
  CreditCard,
  ExternalLink,
  Info,
  Eye,
  EyeOff,
  Fingerprint
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
interface LoginRegisterModuleProps {
  onSuccess?: (userData: any) => void;
}

interface NewsItem {
  id: string;
  category: string;
  title: string;
  link: string;
}

const NEWS_TICKER_ITEMS: NewsItem[] = [
  {
    id: '1',
    category: 'PM-JAY',
    title: 'Ayushman Bharat coverage expanded to include senior citizens aged 70 and above irrespective of income.',
    link: 'https://pmjay.gov.in'
  },
  {
    id: '2',
    category: 'ABDM',
    title: 'Over 60 million ABHA health accounts linked with digital medical records nationwide.',
    link: 'https://abdm.gov.in'
  },
  {
    id: '3',
    category: 'Health Kiosk',
    title: 'New rural diagnostic hubs deployed with AI-assisted instant health screening capabilities.',
    link: 'https://main.mohfw.gov.in'
  }
];

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'te', label: 'తెలుగు (Telugu)' }
];

// ==========================================
// MOTION VARIANTS
// ==========================================
const SPRING_TRANSITION = { type: 'spring', stiffness: 380, damping: 28 };
const EASE_OUT_TRANSITION = { duration: 0.25, ease: [0.16, 1, 0.3, 1] };

const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05
    }
  }
};

const itemFadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: EASE_OUT_TRANSITION }
};

const slideStepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
    scale: 0.98
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: SPRING_TRANSITION
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 30 : -30,
    opacity: 0,
    scale: 0.98,
    transition: EASE_OUT_TRANSITION
  })
};

const hoverCardEffect = {
  rest: { scale: 1, y: 0, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' },
  hover: { scale: 1.015, y: -2, boxShadow: '0 8px 20px -4px rgba(16, 185, 129, 0.12)', transition: SPRING_TRANSITION },
  tap: { scale: 0.97, transition: { duration: 0.1 } }
};

const hoverButtonEffect = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: SPRING_TRANSITION },
  tap: { scale: 0.96, transition: { duration: 0.1 } }
};

export const LoginRegisterModule: React.FC<LoginRegisterModuleProps> = ({ onSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  
  // Login States
  const [loginMethodChoice, setLoginMethodChoice] = useState<'otp' | 'password' | null>(null);
  const [loginIdentifierType, setLoginIdentifierType] = useState<'aadhaar' | 'abha' | 'phone' | 'email' | null>(null);
  const [loginInput, setLoginInput] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [resendTimer, setResendTimer] = useState(30);

  // Registration Multi-Step State
  const [regStep, setRegStep] = useState(1);
  const [stepDirection, setStepDirection] = useState(1);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regForm, setRegForm] = useState({
    aadhaarNumber: '',
    abhaNumber: '',
    fullName: '',
    phone: '',
    dob: '',
    age: '',
    gender: 'Male',
    bloodGroup: 'O+',
    pincode: '',
    emergencyName: '',
    emergencyRel: 'Parent',
    emergencyPhone: '',
    koshtha: 'Krura',
    ahara: 'Vegetarian',
    smoking: 'No',
    alcohol: 'No',
    password: '',
    confirmPassword: '',
    consentDpdp: false,
    consentAbdm: false
  });

  // Ticker State
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    const tickerInterval = setInterval(() => {
      setCurrentNewsIndex((prev) => (prev + 1) % NEWS_TICKER_ITEMS.length);
    }, 5000);
    return () => clearInterval(tickerInterval);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loginMethodChoice === 'otp' && loginIdentifierType && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [loginMethodChoice, loginIdentifierType, resendTimer]);

  const handleNumericInput = (val: string, maxLen: number) => {
    return val.replace(/\D/g, '').slice(0, maxLen);
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dobStr = e.target.value;
    let computedAge = '';
    if (dobStr) {
      const birthDate = new Date(dobStr);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      computedAge = age > 0 ? age.toString() : '0';
    }
    setRegForm({ ...regForm, dob: dobStr, age: computedAge });
  };

  const speakConsentText = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text =
        "In accordance with the Digital Personal Data Protection Act 2023 and Ayushman Bharat Digital Mission guidelines, your health data will be processed securely for clinical care and scheme verification.";
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const resetLoginFlow = () => {
    setLoginMethodChoice(null);
    setLoginIdentifierType(null);
    setLoginInput('');
    setPasswordValue('');
    setShowLoginPassword(false);
    setOtpValue('');
  };

  const changeRegStep = (nextStep: number) => {
    setStepDirection(nextStep > regStep ? 1 : -1);
    setRegStep(nextStep);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 flex flex-col items-center justify-between relative overflow-hidden">
      {/* Dynamic Animated Ambient Glows */}
      <motion.div
        animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-100/60 rounded-full blur-[120px] pointer-events-none"
      />
      <motion.div
        animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-teal-100/50 rounded-full blur-[100px] pointer-events-none"
      />

      {/* Main Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING_TRANSITION}
        className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden relative z-10 my-auto"
      >
        {/* Top Header Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/50">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 shadow-sm"
            >
              <Activity className="w-6 h-6" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-700">
                MediKiosk+ Portal
              </h1>
              <p className="text-xs text-slate-500">Citizen Healthcare Infrastructure Access</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative flex items-center bg-slate-100/80 border border-slate-200 rounded-2xl px-3 py-2 shadow-sm transition-all"
            >
              <Globe className="w-4 h-4 text-slate-500 mr-2" />
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="bg-transparent text-xs font-medium text-slate-700 outline-none cursor-pointer pr-2"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </motion.div>
          </div>
        </div>

        {/* Dynamic Body Content */}
        <div className="p-6 md:p-10">
          {/* Sign In vs Register Toggle Header */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-inner relative">
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setAuthMode('login');
                  resetLoginFlow();
                }}
                className={`relative px-6 py-2.5 rounded-xl text-xs font-medium transition-colors z-10 ${
                  authMode === 'login' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {authMode === 'login' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60 z-[-1]"
                    transition={SPRING_TRANSITION}
                  />
                )}
                Citizen Sign In
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setAuthMode('register');
                  setRegStep(1);
                }}
                className={`relative px-6 py-2.5 rounded-xl text-xs font-medium transition-colors z-10 ${
                  authMode === 'register' ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {authMode === 'register' && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white rounded-xl shadow-sm border border-slate-200/60 z-[-1]"
                    transition={SPRING_TRANSITION}
                  />
                )}
                New Health Account Registration
              </motion.button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* LOGIN SECTION */}
            {authMode === 'login' ? (
              <motion.div
                key="login-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={EASE_OUT_TRANSITION}
                className="max-w-md mx-auto"
              >
                <AnimatePresence mode="wait">
                  {!loginMethodChoice ? (
                    /* Step A: Choose Login Method */
                    <motion.div
                      key="login-step-a"
                      variants={containerStagger}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20, transition: EASE_OUT_TRANSITION }}
                      className="space-y-6"
                    >
                      <motion.div variants={itemFadeUp} className="text-center mb-2">
                        <h2 className="text-sm font-semibold text-slate-700">Select Authentication Method</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Choose how you would like to securely sign in</p>
                      </motion.div>

                      <div className="grid grid-cols-2 gap-4">
                        <motion.button
                          variants={itemFadeUp}
                          initial="rest"
                          whileHover="hover"
                          whileTap="tap"
                          custom={hoverCardEffect}
                          onClick={() => setLoginMethodChoice('otp')}
                          className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-emerald-500/50 transition-colors flex flex-col items-center text-center gap-3 group shadow-sm cursor-pointer"
                        >
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-emerald-600 shadow-sm group-hover:bg-emerald-50 transition-colors">
                            <Smartphone className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-800">Login with OTP</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">Instant secure code</span>
                          </div>
                        </motion.button>

                        <motion.button
                          variants={itemFadeUp}
                          initial="rest"
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => setLoginMethodChoice('password')}
                          className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-emerald-500/50 transition-colors flex flex-col items-center text-center gap-3 group shadow-sm cursor-pointer"
                        >
                          <div className="p-3 rounded-xl bg-white border border-slate-200 text-emerald-600 shadow-sm group-hover:bg-emerald-50 transition-colors">
                            <Lock className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-slate-800">Login with Password</span>
                            <span className="block text-[10px] text-slate-400 mt-0.5">Standard account password</span>
                          </div>
                        </motion.button>
                      </div>
                    </motion.div>
                  ) : !loginIdentifierType ? (
                    /* Step B: Choose 1 of 4 Identifier Options */
                    <motion.div
                      key="login-step-b"
                      variants={containerStagger}
                      initial="hidden"
                      animate="visible"
                      exit={{ opacity: 0, x: -20, transition: EASE_OUT_TRANSITION }}
                      className="space-y-6"
                    >
                      <motion.button
                        variants={itemFadeUp}
                        whileHover={{ x: -2 }}
                        onClick={resetLoginFlow}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Method Selection
                      </motion.button>

                      <motion.div variants={itemFadeUp} className="text-center mb-2">
                        <h2 className="text-sm font-semibold text-slate-700">
                          Sign In with {loginMethodChoice === 'otp' ? 'OTP' : 'Password'}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">Select your credential type</p>
                      </motion.div>

                      <div className="space-y-3">
                        {[
                          { key: 'aadhaar', label: 'Aadhaar Number', sub: '12-digit UIDAI identity number', icon: Fingerprint },
                          { key: 'abha', label: 'ABHA Number / ID', sub: '14-digit Health Account Identifier', icon: CreditCard },
                          { key: 'phone', label: 'Registered Phone Number', sub: '10-digit mobile number linked to profile', icon: Smartphone },
                          { key: 'email', label: 'Email Address', sub: 'Primary registered email account', icon: Mail }
                        ].map((item) => {
                          const IconComp = item.icon;
                          return (
                            <motion.button
                              key={item.key}
                              variants={itemFadeUp}
                              initial="rest"
                              whileHover="hover"
                              whileTap="tap"
                              onClick={() => setLoginIdentifierType(item.key as any)}
                              className="w-full p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:border-emerald-500/50 transition-colors flex items-center gap-4 group shadow-sm text-left cursor-pointer"
                            >
                              <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-emerald-600 shadow-sm group-hover:bg-emerald-50 transition-colors">
                                <IconComp className="w-5 h-5" />
                              </div>
                              <div>
                                <span className="block text-xs font-bold text-slate-800">{item.label}</span>
                                <span className="block text-[10px] text-slate-400">{item.sub}</span>
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    /* Step C: Final Input & Execution */
                    <motion.div
                      key="login-step-c"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={SPRING_TRANSITION}
                      className="space-y-6"
                    >
                      <motion.button
                        whileHover={{ x: -2 }}
                        onClick={() => setLoginIdentifierType(null)}
                        className="flex items-center gap-2 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Back to Credential Options
                      </motion.button>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-500">Method: <span className="uppercase font-semibold text-slate-700">{loginMethodChoice}</span></p>
                          <p className="text-xs text-slate-500 mt-0.5">Using: <span className="uppercase font-semibold text-emerald-600">{loginIdentifierType}</span></p>
                        </div>
                        <span className="text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-lg font-mono">
                          Secure Login
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">
                          {loginIdentifierType === 'aadhaar' && 'Enter 12-Digit Aadhaar Number'}
                          {loginIdentifierType === 'abha' && 'Enter 14-Digit ABHA Number'}
                          {loginIdentifierType === 'phone' && 'Enter 10-Digit Mobile Number'}
                          {loginIdentifierType === 'email' && 'Enter Registered Email Address'}
                        </label>
                        <div className="relative">
                          <input
                            type={loginIdentifierType === 'email' ? 'email' : 'text'}
                            maxLength={
                              loginIdentifierType === 'aadhaar' ? 12 :
                              loginIdentifierType === 'abha' ? 14 :
                              loginIdentifierType === 'phone' ? 10 : 50
                            }
                            value={loginInput}
                            onChange={(e) => {
                              if (loginIdentifierType === 'phone') {
                                setLoginInput(handleNumericInput(e.target.value, 10));
                              } else if (loginIdentifierType === 'aadhaar') {
                                setLoginInput(handleNumericInput(e.target.value, 12));
                              } else if (loginIdentifierType === 'abha') {
                                setLoginInput(handleNumericInput(e.target.value, 14));
                              } else {
                                setLoginInput(e.target.value);
                              }
                            }}
                            placeholder={
                              loginIdentifierType === 'aadhaar' ? 'XXXX-XXXX-XXXX' :
                              loginIdentifierType === 'abha' ? 'XX-XXXX-XXXX-XXXX' :
                              loginIdentifierType === 'phone' ? '9876543210' : 'name@example.com'
                            }
                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-2xl px-4 py-3.5 pl-11 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-sm font-mono"
                          />
                          <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        </div>
                      </div>

                      {loginMethodChoice === 'password' ? (
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">Password</label>
                          <div className="relative">
                            <input
                              type={showLoginPassword ? 'text' : 'password'}
                              value={passwordValue}
                              onChange={(e) => setPasswordValue(e.target.value)}
                              placeholder="Enter account password"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-2xl px-4 py-3.5 pl-11 pr-11 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all shadow-sm"
                            />
                            <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-2">
                            Enter 6-Digit Verification OTP
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={otpValue}
                            onChange={(e) => setOtpValue(handleNumericInput(e.target.value, 6))}
                            placeholder="• • • • • •"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-2xl px-4 py-3.5 text-center tracking-[1em] font-mono text-lg text-slate-800 placeholder-slate-400 outline-none transition-all shadow-sm"
                          />
                          <div className="flex items-center justify-between mt-3 text-xs">
                            <span className="text-slate-500">
                              {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Didn\'t receive code?'}
                            </span>
                            {resendTimer === 0 && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setResendTimer(30)}
                                className="text-emerald-600 hover:underline font-medium cursor-pointer"
                              >
                                Resend OTP
                              </motion.button>
                            )}
                          </div>
                        </div>
                      )}

                      <motion.button
                        variants={hoverButtonEffect}
                        initial="rest"
                        whileHover="hover"
                        whileTap="tap"
                        disabled={!loginInput.trim()}
                        onClick={() => onSuccess && onSuccess({ identifier: '[Aadhaar Redacted]', type: loginIdentifierType, method: loginMethodChoice })}
                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/15 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Verify & Access Health Profile</span>
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* REGISTRATION SECTION */
              <motion.div
                key="register-section"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={EASE_OUT_TRANSITION}
                className="max-w-2xl mx-auto"
              >
                {/* Multi-Step Progress Bar */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3 text-xs">
                    <span className="text-emerald-600 font-semibold tracking-wider uppercase">
                      Step {regStep} of 6
                    </span>
                    <span className="text-slate-500">
                      {regStep === 1 && 'Identity & Identification'}
                      {regStep === 2 && 'Demographics'}
                      {regStep === 3 && 'Emergency Contact'}
                      {regStep === 4 && 'Ayurveda & Dietary Habits'}
                      {regStep === 5 && 'Security Credentials'}
                      {regStep === 6 && 'Consent & ABDM Verification'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 border border-slate-200 overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${(regStep / 6) * 100}%` }}
                      transition={SPRING_TRANSITION}
                    />
                  </div>
                </div>

                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  <div className="relative min-h-[220px]">
                    <AnimatePresence mode="wait" custom={stepDirection}>
                      {/* STEP 1 */}
                      {regStep === 1 && (
                        <motion.div
                          key="step1"
                          custom={stepDirection}
                          variants={slideStepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Aadhaar Number (UIDAI Verification)</label>
                            <input
                              type="text"
                              maxLength={12}
                              value={regForm.aadhaarNumber}
                              onChange={(e) => setRegForm({ ...regForm, aadhaarNumber: handleNumericInput(e.target.value, 12) })}
                              placeholder="12-Digit Aadhaar Identification Number"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-xl p-3 text-sm text-slate-800 font-mono outline-none transition-all shadow-sm"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">ABHA Number *</label>
                            <input
                              type="text"
                              required
                              maxLength={14}
                              value={regForm.abhaNumber}
                              onChange={(e) => setRegForm({ ...regForm, abhaNumber: handleNumericInput(e.target.value, 14) })}
                              placeholder="14-Digit Ayushman Bharat Health Account Number"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-xl p-3 text-sm text-slate-800 font-mono outline-none transition-all shadow-sm"
                            />
                            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-500">
                              <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Don't have an ABHA number?</span>
                              <a
                                href="https://abdm.gov.in"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-emerald-600 hover:underline font-semibold inline-flex items-center gap-0.5"
                              >
                                Create ABHA number <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Full Legal Name *</label>
                              <input
                                type="text"
                                required
                                value={regForm.fullName}
                                onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                                placeholder="As printed on identity card"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Mobile Number *</label>
                              <input
                                type="text"
                                maxLength={10}
                                value={regForm.phone}
                                onChange={(e) => setRegForm({ ...regForm, phone: handleNumericInput(e.target.value, 10) })}
                                placeholder="10-digit mobile number"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 2 */}
                      {regStep === 2 && (
                        <motion.div
                          key="step2"
                          custom={stepDirection}
                          variants={slideStepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Date of Birth *</label>
                              <input
                                type="date"
                                value={regForm.dob}
                                onChange={handleDobChange}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Calculated Age</label>
                              <input
                                type="text"
                                readOnly
                                value={regForm.age ? `${regForm.age} Years` : 'Auto-calculated'}
                                className="w-full bg-slate-100/60 border border-slate-200/60 rounded-xl p-3 text-sm text-slate-500 outline-none cursor-not-allowed"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Gender</label>
                              <select
                                value={regForm.gender}
                                onChange={(e) => setRegForm({ ...regForm, gender: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm cursor-pointer"
                              >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Blood Group</label>
                              <select
                                value={regForm.bloodGroup}
                                onChange={(e) => setRegForm({ ...regForm, bloodGroup: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm cursor-pointer"
                              >
                                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                                  <option key={bg} value={bg}>{bg}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Postal PIN Code</label>
                              <input
                                type="text"
                                maxLength={6}
                                value={regForm.pincode}
                                onChange={(e) => setRegForm({ ...regForm, pincode: handleNumericInput(e.target.value, 6) })}
                                placeholder="6-digit PIN"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 3 */}
                      {regStep === 3 && (
                        <motion.div
                          key="step3"
                          custom={stepDirection}
                          variants={slideStepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Emergency Contact Person Name *</label>
                            <input
                              type="text"
                              value={regForm.emergencyName}
                              onChange={(e) => setRegForm({ ...regForm, emergencyName: e.target.value })}
                              placeholder="Full Name of Primary Emergency Contact"
                              className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Relationship</label>
                              <select
                                value={regForm.emergencyRel}
                                onChange={(e) => setRegForm({ ...regForm, emergencyRel: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm cursor-pointer"
                              >
                                <option value="Parent">Parent</option>
                                <option value="Spouse">Spouse</option>
                                <option value="Sibling">Sibling</option>
                                <option value="Child">Child</option>
                                <option value="Guardian">Guardian</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Contact Phone Number *</label>
                              <input
                                type="text"
                                maxLength={10}
                                value={regForm.emergencyPhone}
                                onChange={(e) => setRegForm({ ...regForm, emergencyPhone: handleNumericInput(e.target.value, 10) })}
                                placeholder="10-digit mobile number"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 4: Lifestyle & Dietary */}
                      {regStep === 4 && (
                        <motion.div
                          key="step4"
                          custom={stepDirection}
                          variants={slideStepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Bowel Tendency (Koshtha)</label>
                              <select
                                value={regForm.koshtha}
                                onChange={(e) => setRegForm({ ...regForm, koshtha: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm cursor-pointer"
                              >
                                <option value="Krura">Krura (Hard / Constipated)</option>
                                <option value="Mrdhu">Mrdhu (Soft / Loose)</option>
                                <option value="Madhyama">Madhyama (Regular / Balanced)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Dietary Habit (Ahara)</label>
                              <select
                                value={regForm.ahara}
                                onChange={(e) => setRegForm({ ...regForm, ahara: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm cursor-pointer"
                              >
                                <option value="Vegetarian">Strict Vegetarian</option>
                                <option value="Non-Vegetarian">Non-Vegetarian</option>
                                <option value="Eggetarian">Eggetarian</option>
                                <option value="Vegan">Vegan</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Smoking</label>
                              <select
                                value={regForm.smoking}
                                onChange={(e) => setRegForm({ ...regForm, smoking: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm cursor-pointer"
                              >
                                <option value="No">No</option>
                                <option value="Occasionally">Occasionally</option>
                                <option value="Regularly">Regularly</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-1.5">Alcohol</label>
                              <select
                                value={regForm.alcohol}
                                onChange={(e) => setRegForm({ ...regForm, alcohol: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white rounded-xl p-3 text-sm text-slate-800 outline-none transition-all shadow-sm cursor-pointer"
                              >
                                <option value="No">No</option>
                                <option value="Socially">Socially</option>
                                <option value="Regularly">Regularly</option>
                              </select>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 5 */}
                      {regStep === 5 && (
                        <motion.div
                          key="step5"
                          custom={stepDirection}
                          variants={slideStepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Account Password *</label>
                            <div className="relative">
                              <input
                                type={showRegPassword ? 'text' : 'password'}
                                value={regForm.password}
                                onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                                placeholder="Minimum 8 characters with numbers & symbols"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-xl p-3 pr-11 text-sm text-slate-800 outline-none transition-all shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {showRegPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1.5">Confirm Password *</label>
                            <div className="relative">
                              <input
                                type={showRegConfirmPassword ? 'text' : 'password'}
                                value={regForm.confirmPassword}
                                onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                                placeholder="Re-enter password"
                                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500/60 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 rounded-xl p-3 pr-11 text-sm text-slate-800 outline-none transition-all shadow-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {showRegConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* STEP 6 */}
                      {regStep === 6 && (
                        <motion.div
                          key="step6"
                          custom={stepDirection}
                          variants={slideStepVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="space-y-4"
                        >
                          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 shadow-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
                                <Shield className="w-4 h-4" /> DPDP Act 2023 & ABDM Compliance
                              </span>
                              <motion.button
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={speakConsentText}
                                className="text-xs text-slate-500 hover:text-emerald-600 flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Volume2 className="w-3.5 h-3.5" /> Read Aloud
                              </motion.button>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              In accordance with the Digital Personal Data Protection Act 2023 and Ayushman Bharat Digital Mission guidelines, your health data will be processed securely for clinical care and scheme verification.
                            </p>
                          </div>

                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={regForm.consentDpdp}
                              onChange={(e) => setRegForm({ ...regForm, consentDpdp: e.target.checked })}
                              className="mt-1 rounded bg-white border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
                              I consent to data collection and processing under the DPDP Act 2023 guidelines.
                            </span>
                          </label>

                          <label className="flex items-start gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={regForm.consentAbdm}
                              onChange={(e) => setRegForm({ ...regForm, consentAbdm: e.target.checked })}
                              className="mt-1 rounded bg-white border-slate-300 text-emerald-600 focus:ring-0 cursor-pointer"
                            />
                            <span className="text-xs text-slate-600 group-hover:text-slate-800 transition-colors">
                              I authorize creation and linking of my Ayushman Bharat Health Account (ABHA).
                            </span>
                          </label>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Step Navigation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    {regStep > 1 ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => changeRegStep(regStep - 1)}
                        className="px-4 py-2.5 rounded-xl text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Previous
                      </motion.button>
                    ) : <div />}

                    {regStep < 6 ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => changeRegStep(regStep + 1)}
                        className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-500/10 cursor-pointer"
                      >
                        Continue <ArrowRight className="w-3.5 h-3.5" />
                      </motion.button>
                    ) : (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        disabled={!regForm.consentDpdp || !regForm.consentAbdm || !regForm.abhaNumber}
                        onClick={() => onSuccess && onSuccess({ ...regForm, aadhaarNumber: '[Aadhaar Redacted]' })}
                        className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 disabled:opacity-50 text-white transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/15 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Complete Registration
                      </motion.button>
                    )}
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Rolling News Ticker at Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_TRANSITION, delay: 0.2 }}
        className="w-full max-w-4xl mt-4 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 shadow-sm flex items-center gap-3 relative z-10 overflow-hidden"
      >
        <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider shrink-0">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Activity className="w-3 h-3 text-emerald-600" />
          </motion.div>
          Live Schemes & News
        </div>
        <div className="flex-1 overflow-hidden relative h-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentNewsIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={EASE_OUT_TRANSITION}
              className="absolute inset-0 flex items-center justify-between text-xs text-slate-600"
            >
              <div className="truncate pr-4">
                <span className="font-semibold text-slate-800 mr-2">[{NEWS_TICKER_ITEMS[currentNewsIndex].category}]:</span>
                {NEWS_TICKER_ITEMS[currentNewsIndex].title}
              </div>
              <motion.a
                whileHover={{ scale: 1.03, x: 2 }}
                href={NEWS_TICKER_ITEMS[currentNewsIndex].link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 hover:text-emerald-700 font-medium shrink-0 inline-flex items-center gap-1"
              >
                <span>Read More</span>
                <ArrowRight className="w-3 h-3" />
              </motion.a>
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginRegisterModule;

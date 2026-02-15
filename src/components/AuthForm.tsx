import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BsGoogle } from 'react-icons/bs';
import { Mail, Lock, User, Briefcase, CheckCircle2, Earth } from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { useTranslation } from '@/hooks/useTranslation';

interface AuthFormProps {
  accountType: 'creator' | 'brand';
  title: string;
  description: string;
  icon?: React.ReactNode;
  changeFormMode: () => void;
  onSuccess: (step1Data: any) => void;
  isMultiStep: boolean;
  initialData?: { name: string; email: string };
}

const AuthForm: React.FC<AuthFormProps> = ({ accountType, title, description, changeFormMode, onSuccess, isMultiStep, initialData }) => {
  const navigate = useNavigate();
  const setUser = useUserStore((state) => state.setUser);
  const setToken = useUserStore((state) => state.setToken);
  const setRegistered = useUserStore((state) => state.setRegistered);
  const setAccountType = useUserStore((state) => state.setAccountType);

  const [mode, setMode] = useState<'register' | 'login'>('register');

  const { t, language, setLanguage } = useTranslation();

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    password: ''
  });
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        name: initialData.name || prev.name,
        email: initialData.email || prev.email
      }));
    }
  }, [initialData]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL environment variable is not set.");
  }

  const API_URL = mode === 'register'
    ? `${API_BASE_URL}/register`
    : `${API_BASE_URL}/login`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isValidPassword(formData.password)) {
      setError("Password must contain only Latin characters.");
      setLoading(false);
      return;
    }

    if (mode === 'register' && isMultiStep) {
      setTimeout(() => {
        setLoading(false);
        const savedCookiePrefs = localStorage.getItem("cookie_preferences");
        let guestConsent = { analytics: false, marketing: false };
        if (savedCookiePrefs) {
          const parsed = JSON.parse(savedCookiePrefs);
          guestConsent = { analytics: !!parsed[1], marketing: !!parsed[2] };
        }

        onSuccess({ ...formData, ...guestConsent });
      }, 800);
      return;
    }
    try {
      const savedCookiePrefs = localStorage.getItem("cookie_preferences");
      let guestConsent = { analytics: false, marketing: false };

      if (savedCookiePrefs) {
        try {
          const parsedPrefs = JSON.parse(savedCookiePrefs);
          guestConsent = {
            analytics: !!parsedPrefs[1],
            marketing: !!parsedPrefs[2]
          };
        } catch (parseErr) {
          console.error("Could not parse local cookie preferences:", parseErr);
        }
      }

      const payload = mode === 'register'
        ? { ...formData, accountType, ...guestConsent }
        : { email: formData.email, password: formData.password, ...guestConsent };

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError('Email already registered.');
        } else {
          setError(data.message || `${mode === 'register' ? 'Registration' : 'Login'} failed.`);
        }
        setLoading(false);
        return;
      }

      if (mode === 'login') {
        const userRole = data.user.accountType;
        if (accountType === 'creator' && userRole === 'brand') {
          setError("This account is registered as a Brand. Please use the Brand login page.");
          setLoading(false);
          return;
        }
        if (accountType === 'brand' && userRole === 'creator') {
          setError("This account is registered as a Creator. Please use the Creator login page.");
          setLoading(false);
          return;
        }
      }

      if (data.token) {
        setToken(data.token); // Това трябва да запише в Zustand + LocalStorage
      } else {
        console.warn("No token received from backend!");
      }
      setUser({
        id: data.user.id,
        email: data.user.email,
        username: data.user.username,
        profileImage: data.user.profileImage,
        isVIP: data.user.isVIP || false,
        accountType: data.user.accountType
      });

      setRegistered(true);
      setAccountType(accountType);

      if (mode === 'register') {
        setIsSuccessModalOpen(true);
      } else {
        navigate('/profile/me');
      }

    } catch (err) {
      console.error("Auth error:", err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isValidPassword = (password: string) => {
    // Allows English letters, numbers, and common symbols. 
    // Blocks Cyrillic, emojis, and other non-standard encodings.
    const asciiRegex = /^[\x20-\x7E]*$/;
    return asciiRegex.test(password);
  };

  const [langOpen, setLangOpen] = useState(false);

  type LanguageCode = 'en' | 'bg';

  interface LanguageOption {
    code: LanguageCode;
    label: string;
  }

  const languages: LanguageOption[] = [
    { code: 'en', label: 'English' },
    { code: 'bg', label: 'Български' }
  ];

  const isCreator = accountType === 'creator';
  const primaryButtonClass = 'bg-gradient-to-br from-primary to-secondary text-white hover:bg-primary/90';

  return (
    <>
      <div className="absolute top-6 right-6 z-50">
        <div className="relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="p-2 rounded-full transition-colors duration-300 text-white hover:bg-white/10"
            aria-label="Select language"
          >
            <Earth size={24} />
          </button>

          {langOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setLangOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 text-sm ${language === lang.code ? 'font-bold text-primary' : 'text-gray-800'
                    }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="w-full max-w-[36rem] lg:p-6 bg-transparent dark:bg-background flex flex-col justify-center h-full">
        <div className="flex items-center mb-6">
          <Link to="/" className="flex items-center space-x-2 text-[22px] font-bold text-white dark:text-white">
            <span>InfluLink</span>
          </Link>
        </div>

        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white dark:text-white">{title}</h2>
          <p className="text-lg text-white/80 dark:text-gray-400 mt-2">{description}</p>
        </div>

        {error && <p className="text-red-400 mb-3 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-5 flex flex-col">
          {mode === 'register' && (
            <div className="relative w-[80%] mx-auto">
              {isCreator ? (
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
              ) : (
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
              )}
              <Input
                id="name"
                type="text"
                placeholder={isCreator ? t("mvpLogin.fullName") : t("mvpLogin.companyName")}
                value={formData.name}
                onChange={handleChange}
                required
                className="pl-9 h-11 border-gray-300 text-white bg-white/20 placeholder:text-white"
              />
            </div>
          )}

          <div className="relative w-[80%] mx-auto">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
            <Input
              id="email"
              type="email"
              placeholder={t("mvpLogin.email")}
              value={formData.email}
              onChange={handleChange}
              required
              className="pl-9 h-11 border-gray-300 text-white bg-white/20 placeholder:text-white"
            />
          </div>

          <div className="relative w-[80%] mx-auto">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white" />
            <Input
              id="password"
              type="password"
              placeholder={t("mvpLogin.password")}
              value={formData.password}
              onChange={handleChange}
              required
              className="pl-9 h-11 border-gray-300 text-white bg-white/20 placeholder:text-white"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-[50%] py-2 text-base font-semibold h-11 mx-auto ${primaryButtonClass} shadow-md`}
          >
            {loading ? (mode === 'register' ? t("mvpLogin.registering") : t("mvpLogin.logging")) : (mode === 'register' ? t("mvpLogin.signUp") : t("mvpLogin.logIn"))}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="font-bold text-white/80 mb-4">{t("mvpLogin.or")}</p>
          <Button
            variant="outline"
            className="w-full max-w-sm h-11 bg-white/20 dark:text-white mx-auto flex items-center justify-center space-x-2"
          >
            <BsGoogle className="h-4 w-4 text-white" />
            <span className='text-white'>{t("mvpLogin.signWithGoogle")}</span>
          </Button>
        </div>

        <div className="mt-8 text-center text-sm text-white/80 dark:text-gray-400">
          {mode === 'register' ? t("mvpLogin.alreadyAccount") : t("mvpLogin.noAccount")}
          <button
            onClick={() => {
              setMode(mode === 'register' ? 'login' : 'register');
              changeFormMode();
              setError(null);
            }}
            className="font-medium text-secondary hover:underline"
          >
            {mode === 'register' ? t("mvpLogin.login") : t("mvpLogin.register")}
          </button>
        </div>
      </div>

      {isSuccessModalOpen && mode === 'register' && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[999] animate-fade-in"
          onClick={() => setIsSuccessModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-gradient-to-br from-primary to-secondary rounded-3xl shadow-2xl p-10 text-center w-[90%] sm:w-[450px] border-2 border-primary/20 overflow-visible animate-modal-pop"
          >
            <div className="relative z-10 bg-transparent rounded-3xl">
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CheckCircle2 className="mx-auto text-white mb-4 drop-shadow-lg animate-scale-in" size={64} />
              </div>

              <h2 className="text-2xl font-bold mb-2 text-white animate-fade-in" style={{ animationDelay: '0.3s' }}>
                {t("mvpLogin.registrationSuccess")}
              </h2>

              <p className="text-white mb-6 animate-fade-in" style={{ animationDelay: '0.4s' }}>
                {t("mvpLogin.accountCreatedSuccess")}
              </p>

              <div className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <Button
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    navigate('/profile/me');
                  }}
                  className="bg-white text-black rounded-full px-8 py-6 text-[16px] font-semibold shadow-md shadow-primary transition duration-300 ease-in-out hover:scale-105 hover:text-white hover:bg-white/30"
                >
                  {t("mvpLogin.continue")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AuthForm;

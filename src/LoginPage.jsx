import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon, KeyIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import GoogleIcon from './GoogleIcon';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { t, i18n } = useTranslation();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    // --- Logika dla selektora języka ---
    const [showLangSelector, setShowLangSelector] = useState(false);
    const langSelectorRef = useRef(null);
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'pl', name: 'Polski' },
        { code: 'de', name: 'Deutsch' },
    ];
    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setShowLangSelector(false);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (langSelectorRef.current && !langSelectorRef.current.contains(event.target)) {
                setShowLangSelector(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // --- Koniec logiki dla selektora ---


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoggingIn(true);

        try {
            const loggedInUser = await login({ email, password });
            if (loggedInUser) {
                if (loggedInUser.accountType === 'ADMIN') {
                    navigate('/admin');
                } else {
                    navigate('/');
                }
            } else {
                setError(t('login.invalid-u-o-p'));
            }
        } catch (err) {
            console.error("Login request failed:", err);
            setError(t('login.invalid-u-o-p'));
        } finally {
            setIsLoggingIn(false);
        }
    };

    // Komponent selektora języka
    const LanguageSelector = () => (
        <div ref={langSelectorRef} className="absolute top-0 right-0">
            <button
                onClick={() => setShowLangSelector(s => !s)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                title={t('navbar.lang-title')} // Używamy istniejącego klucza
            >
                <GlobeAltIcon className="h-6 w-6" />
            </button>
            {showLangSelector && (
                <div className="absolute top-full mt-2 right-0 bg-white shadow-xl rounded-2xl ring-1 ring-gray-200 w-48 z-10">
                    <ul className="p-2">
                        {languages.map(lang => (
                            <li
                                key={lang.code}
                                onClick={() => handleLanguageChange(lang.code)}
                                className={`px-3 py-2 text-sm rounded-lg cursor-pointer hover:bg-gray-100 ${currentLanguage.code === lang.code ? 'font-bold text-black' : 'text-gray-700'}`}
                            >
                                {lang.name}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );

    return (
        <div className="flex w-full h-screen">
            <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-900 text-white relative">
                <div className="w-full h-full bg-gradient-to-tr from-black via-gray-900 to-black opacity-90 absolute"></div>
                <div className="z-10 text-center">
                    <h1 className="text-6xl font-bold tracking-tighter">Wishly</h1>
                    <p className="text-xl mt-4 text-gray-300">{t('login.greeting')}</p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8">
                <div className="w-full max-w-md relative">
                    {/* Tutaj dodajemy selektor języka */}
                    <LanguageSelector />

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('login.welcome')}</h2>
                    <p className="text-gray-600 mb-8">{t('login.details')}</p>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div className="relative">
                                <UserIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2"/>
                                <input
                                    type="text"
                                    placeholder={t('login.email-placeholder')}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition-colors"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <KeyIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2"/>
                                <input
                                    type="password"
                                    placeholder={t('login.password-placeholder')}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center">
                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"/>
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">{t('login.remember-me')}</label>
                            </div>
                            <div className="text-sm">
                                <a href="#" className="font-medium text-black hover:underline">{t('login.forgot-pswd')}</a>
                            </div>
                        </div>

                        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}

                        <div className="mt-8">
                            <button type="submit" disabled={isLoggingIn} className="w-full bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center justify-center disabled:bg-gray-400">
                                {isLoggingIn ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : t('login.login')}
                            </button>
                        </div>
                    </form>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="bg-gray-50 px-2 text-gray-500">{t('login.or-continue')}</span></div>
                    </div>

                    <div>
                        <a href="http://localhost:8082/oauth2/authorization/google" className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                            <GoogleIcon className="h-5 w-5"/>
                            {t('login.continue-google')}
                        </a>
                    </div>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        {t('login.dont-acc')}{' '}
                        <Link to="/register" className="font-medium text-black hover:underline">{t('login.signup')}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
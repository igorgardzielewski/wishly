import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserIcon, AtSymbolIcon, KeyIcon, IdentificationIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import GoogleIcon from './GoogleIcon';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

function RegistrationPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { register } = useAuth();

    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError(t("registration.passwordMismatch"));
            return;
        }
        setError('');
        setIsRegistering(true);
        const { confirmPassword, ...registerData } = formData;
        try {
            await register(registerData);
            navigate('/welcome');
        } catch (err) {
            console.error("Registration request failed:", err);
            const errorMessage = err.response?.data?.message || err.response?.data || t("registration.failedDefault");
            setError(errorMessage);
        } finally {
            setIsRegistering(false);
        }
    };

    const LanguageSelector = () => (
        <div ref={langSelectorRef} className="absolute top-0 right-0">
            <button
                onClick={() => setShowLangSelector(s => !s)}
                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                title={t('navbar.lang-title')}
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
                    <p className="text-xl mt-4 text-gray-300">{t("registration.joinCommunity")}</p>
                </div>
            </div>

            <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-8 overflow-y-auto">
                <div className="w-full max-w-md relative">
                    <LanguageSelector />

                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{t("registration.createAccount")}</h2>
                    <p className="text-gray-600 mb-8">{t("registration.startJourney")}</p>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <div className="relative">
                                <UserIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2"/>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder={t("registration.placeholder.username")}
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition-colors"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <IdentificationIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2"/>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder={t("registration.placeholder.fullName")}
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition-colors"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <AtSymbolIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2"/>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder={t("registration.placeholder.email")}
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition-colors"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <KeyIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2"/>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder={t("registration.placeholder.password")}
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition-colors"
                                    required
                                />
                            </div>
                            <div className="relative">
                                <KeyIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-4 -translate-y-1/2"/>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    placeholder={t("registration.placeholder.confirmPassword")}
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black transition-colors"
                                    required
                                />
                            </div>
                        </div>

                        {error && <p className="mt-4 text-sm text-red-600 text-center">{error}</p>}

                        <div className="mt-8">
                            <button
                                type="submit"
                                disabled={isRegistering}
                                className="w-full bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center justify-center disabled:bg-gray-400"
                            >
                                {isRegistering ? <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div> : t("registration.createAccountButton")}
                            </button>
                        </div>
                    </form>

                    <p className="mt-4 text-center text-xs text-gray-500">
                        {t("registration.termsPrefix")}{' '}
                        <a href="#" className="font-medium text-gray-700 hover:underline">{t("registration.termsLink")}</a>.
                    </p>

                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                        <div className="relative flex justify-center text-sm"><span className="bg-gray-50 px-2 text-gray-500">{t("registration.or")}</span></div>
                    </div>

                    <div>
                        <a href="http://localhost:8082/oauth2/authorization/google" className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                            <GoogleIcon className="h-5 w-5"/>
                            {t("registration.signUpWithGoogle")}
                        </a>
                    </div>

                    <p className="mt-10 text-center text-sm text-gray-500">
                        {t("registration.hasAccountPrefix")}{' '}
                        <Link to="/login" className="font-medium text-black hover:underline">{t("registration.loginLink")}</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default RegistrationPage;
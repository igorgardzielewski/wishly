import { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from './api';
import { useAuth } from './AuthContext';
import { BellIcon, HomeIcon, PlusIcon, PresentationChartBarIcon, GlobeAltIcon, Bars3Icon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";


const LanguageSelector = ({ isMobile, showLangSelector, setShowLangSelector, languages, currentLanguage, handleLanguageChange, t }) => (
    <div className="relative">
        <button
            onClick={() => setShowLangSelector(s => !s)}
            className={`flex items-center gap-3 p-3 rounded-xl w-full text-left ${isMobile ? 'hover:bg-gray-100' : 'w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200'}`}
            title={t('navbar.lang-title')}
        >
            <GlobeAltIcon className={`text-gray-600 ${isMobile ? 'h-6 w-6' : 'h-5 w-5'}`} />
            {isMobile && <span className="font-medium text-gray-700">{t('navbar.lang-text')}</span>}
        </button>
        {showLangSelector && (
            <div className={`absolute bg-white shadow-xl rounded-2xl ring-1 ring-gray-200 w-48 z-50 ${isMobile ? 'bottom-full mb-2 left-0' : 'top-full mt-2 right-0'}`}>
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

const UserAvatar = ({ user, handleNavigation, isMobile }) => (
    <button onClick={() => handleNavigation(`/profile/${user.username}`)} className={`cursor-pointer group ${isMobile ? 'flex items-center gap-3 p-2 w-full hover:bg-gray-100 rounded-xl' : 'w-10 h-10 bg-gray-200 rounded-full'}`}>
        <img src={user.avatarUrl ? `http://localhost:8082${user.avatarUrl}` : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} alt={user.username} className="w-10 h-10 object-cover rounded-full" />
        {isMobile && <span className="font-medium text-gray-800 group-hover:text-black">{user.username}</span>}
    </button>
);

const SearchBar = ({
                       handleSearchSubmit,
                       searchInputRef,
                       searchQuery,
                       handleSearchInputChange,
                       handleSearchInputFocus,
                       showResults,
                       isSearching,
                       searchResults,
                       handleUserClick,
                       t
                   }) => (
    <div className="relative flex-grow lg:max-w-xl lg:mx-8">
        <form onSubmit={handleSearchSubmit}>
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
                ref={searchInputRef}
                type="text"
                placeholder={t('navbar.search-placeholder')}
                className="w-full pl-11 pr-4 py-2.5 border bg-gray-100 border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:bg-white"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onFocus={handleSearchInputFocus}
                autoComplete="off"
            />
        </form>
        {showResults && (
            <div className="absolute mt-2 w-full bg-white rounded-2xl shadow-lg border border-gray-200 max-h-80 overflow-y-auto z-50">
                {isSearching ? (
                    <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-black"></div>
                    </div>
                ) : searchResults.length > 0 ? (
                    searchResults.map((u) => (
                        <div
                            key={u.id}
                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center"
                            onClick={() => handleUserClick(u.username)}
                        >
                            <img
                                src={u.avatarUrl ? `http://localhost:8082${u.avatarUrl}` : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                                alt={u.username}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                            />
                            <div>
                                <p className="font-medium text-gray-800">{u.username}</p>
                                {u.fullName && <p className="text-sm text-gray-500">{u.fullName}</p>}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">{t('navbar.no-users-f')}</div>
                )}
            </div>
        )}
    </div>
);


function NavBar() {
    const { user, openExplore } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isPreparingPost, setIsPreparingPost] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showLangSelector, setShowLangSelector] = useState(false);

    const [url, setUrl] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [notifications, setNotifications] = useState([]);

    const navRef = useRef(null);
    const searchInputRef = useRef(null);
    const searchTimeoutRef = useRef(null);

    const isHomePage = location.pathname === '/';
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;
    const languages = [
        { code: 'en', name: 'English' },
        { code: 'pl', name: 'Polski' },
        { code: 'de', name: 'Deutsch' },
    ];
    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

    const fetchNotifications = useCallback(async () => {
        if (user) {
            try {
                const response = await api.get('/api/notifications');
                setNotifications(response.data);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        }
    }, [user]);

    const handleSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }
        setIsSearching(true);
        setShowResults(true);
        try {
            const response = await api.get(`/api/users/search?q=${encodeURIComponent(query)}&size=5`);
            setSearchResults(response.data.content);
        } catch (error) {
            console.error("Search failed:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [searchQuery, handleSearch]);

    useEffect(() => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
    }, [location.pathname]);

    useEffect(() => {
        if (user) fetchNotifications();
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [user, fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (navRef.current && !navRef.current.contains(event.target)) {
                setShowResults(false);
                setShowNotifications(false);
                setShowLangSelector(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigation = (path, options) => {
        if (isMobileMenuOpen) {
            setIsMobileMenuOpen(false);
        }
        navigate(path, options);
    };

    const handleLanguageChange = (langCode) => {
        i18n.changeLanguage(langCode);
        setShowLangSelector(false);
        if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.post('/api/notifications/mark-as-read');
            fetchNotifications();
        } catch (error) {
            console.error("Failed to mark notifications as read:", error);
        }
    };

    const handleNotificationClick = async (notification) => {
        setShowNotifications(false);
        const targetUrl = notification.type === 'FOLLOW'
            ? `/profile/${notification.sender?.username}`
            : `/post/${notification.postId}`;

        if (!notification.read) {
            try {
                await api.post(`/api/notifications/${notification.id}/read`);
                fetchNotifications();
            } catch (error) {
                console.error("Failed to mark notification as read", error);
            }
        }
        handleNavigation(targetUrl);
    };

    const handlePreparePost = async (e) => {
        e.preventDefault();
        function isValidUrl(string) { try { new URL(string); return true; } catch (_) { return false; } }
        if (!url.trim() || !isValidUrl(url)) return alert(t('navbar.alert-valid-url'));
        setIsPreparingPost(true);
        try {
            const response = await api.post("/api/posts/prepare", { itemUrl: url });
            handleNavigation('/posts/create', { state: { preparedData: response.data } });
            setUrl('');
        } catch (error) {
            console.error("Failed to prepare post:", error);
            alert(t('navbar.alert-url'));
        } finally {
            setIsPreparingPost(false);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            handleNavigation(`/search?q=${searchQuery}`);
            setShowResults(false);
        }
    };

    const handleUserClick = (username) => {
        handleNavigation(`/profile/${username}`);
        setShowResults(false);
        setSearchQuery('');
    };

    const handleSearchInputChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleSearchInputFocus = () => {
        if (searchQuery.trim()) {
            setShowResults(true);
        }
    };

    const renderNotificationText = (notification) => {
        const sender = <span className="font-semibold">{notification.sender.username}</span>;
        switch(notification.type) {
            case 'LIKE': return <>{sender} {t('navbar.not-like-content')}</>;
            case 'COMMENT': return <>{sender} {t('navbar.not-com-content')}</>;
            case 'FOLLOW': return <>{sender} {t('navbar.not-follow-content')}</>;
            default: return "New notification";
        }
    };

    const searchBarProps = {
        handleSearchSubmit,
        searchInputRef,
        searchQuery,
        handleSearchInputChange,
        handleSearchInputFocus,
        showResults,
        isSearching,
        searchResults,
        handleUserClick,
        t
    };

    const langSelectorProps = {
        showLangSelector,
        setShowLangSelector,
        languages,
        currentLanguage,
        handleLanguageChange,
        t
    };

    return (
        <>
            <header ref={navRef} className="bg-white/80 backdrop-blur-lg w-full fixed top-0 z-40 border-b border-gray-200/80">
                <nav className="px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between h-[10vh] max-h-16">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold text-gray-900 cursor-pointer tracking-tighter" onClick={() => handleNavigation('/')}>Wishly</span>
                    </div>

                    {isHomePage && user && (
                        <div className="hidden lg:flex flex-grow justify-center">
                            <SearchBar {...searchBarProps} />
                        </div>
                    )}

                    <div className="flex items-center justify-end space-x-2 sm:space-x-3">
                        {user ? (
                            <>
                                <div className="hidden lg:flex items-center space-x-2">
                                    <div className="relative group">
                                        <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                                            <PlusIcon className="h-5 w-5 text-gray-700"/>
                                        </button>
                                        <div className="absolute top-full mt-2 right-0 hidden group-hover:block bg-white shadow-xl rounded-2xl ring-1 ring-gray-200 p-4 w-80 z-50">
                                            <h3 className="font-bold text-gray-900 mb-2">{t('navbar.add-new-item')}</h3>
                                            {isPreparingPost ? (
                                                <div className="flex justify-center items-center h-24">
                                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                                                </div>
                                            ) : (
                                                <form onSubmit={handlePreparePost}>
                                                    <input
                                                        type="text"
                                                        className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                                        onChange={(e) => setUrl(e.target.value)}
                                                        value={url}
                                                        placeholder={t('navbar.addUrlPlaceholder')}
                                                    />
                                                    <button type="submit" className="w-full px-4 py-2 mt-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">
                                                        {t('navbar.add')}
                                                    </button>
                                                </form>
                                            )}
                                        </div>
                                    </div>
                                    {isHomePage &&
                                        <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors" title={t('navbar.explore')} onClick={openExplore}>
                                            <PresentationChartBarIcon className="h-5 w-5 text-gray-700" />
                                        </button>
                                    }
                                    <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors" title={t('navbar.home')} onClick={() => handleNavigation('/')}>
                                        <HomeIcon className="h-5 w-5 text-gray-700" />
                                    </button>
                                </div>

                                <div className="relative">
                                    <button onClick={() => setShowNotifications(s => !s)} className="relative w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                                        <BellIcon className="h-5 w-5 text-gray-700" />
                                        {unreadNotificationsCount > 0 && <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
                                    </button>
                                    {showNotifications && (
                                        <div className="absolute top-full mt-2 right-0 bg-white shadow-xl rounded-2xl ring-1 ring-gray-200 w-80 sm:w-96 max-h-[80vh] flex flex-col z-50">
                                            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                                <h3 className="font-semibold">{t('navbar.not')}</h3>
                                                {unreadNotificationsCount > 0 && (
                                                    <button onClick={handleMarkAllAsRead} className="text-sm text-blue-600 hover:underline">
                                                        {t('navbar.not-read')}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="overflow-y-auto">
                                                {notifications.length > 0 ? notifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => handleNotificationClick(n)}
                                                        className={`p-3 sm:p-4 border-b border-gray-100 flex items-start gap-3 cursor-pointer hover:bg-gray-100 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}
                                                    >
                                                        <img
                                                            src={n.sender.avatarUrl ? `http://localhost:8082${n.sender.avatarUrl}` : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'}
                                                            alt={n.sender.username}
                                                            className="w-10 h-10 rounded-full object-cover"
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-sm text-gray-700">{renderNotificationText(n)}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                                        </div>
                                                        {!n.read && (<div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 mt-1.5"></div>)}
                                                    </div>
                                                )) : (
                                                    <p className="p-8 text-center text-sm text-gray-500">{t('navbar.no-not')}</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="hidden lg:flex items-center space-x-2">
                                    {user.accountType === 'ADMIN' && (
                                        <button onClick={() => handleNavigation('/admin')} className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors" title={t('navbar.admin-title')}>
                                            <ShieldCheckIcon className="h-5 w-5 text-blue-600" />
                                        </button>
                                    )}
                                    <LanguageSelector {...langSelectorProps} isMobile={false} />
                                    <UserAvatar user={user} handleNavigation={handleNavigation} isMobile={false} />
                                </div>

                                <div className="lg:hidden">
                                    <button onClick={() => setIsMobileMenuOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                                        <Bars3Icon className="h-6 w-6 text-gray-700"/>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="hidden sm:flex items-center space-x-2">
                                    <LanguageSelector {...langSelectorProps} isMobile={false} />
                                    <button onClick={() => handleNavigation('/login')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors px-4 py-2">
                                        {t('navbar.login')}
                                    </button>
                                    <button onClick={() => handleNavigation('/register')} className="bg-black text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">
                                        {t('navbar.signup')}
                                    </button>
                                </div>
                                <div className="sm:hidden">
                                    <button onClick={() => setIsMobileMenuOpen(true)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors">
                                        <Bars3Icon className="h-6 w-6 text-gray-700"/>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </nav>
            </header>

            <div
                className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsMobileMenuOpen(false)}
            >
                <div className="absolute inset-0 bg-black/30"></div>

                <div
                    className={`absolute top-0 right-0 h-full w-4/5 max-w-sm bg-white shadow-2xl flex flex-col p-4 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'transform-none' : 'translate-x-full'}`}
                    onClick={e => e.stopPropagation()}
                >
                    {user ? (
                        <>
                            <div className="flex-grow flex flex-col">
                                <UserAvatar user={user} handleNavigation={handleNavigation} isMobile={true} />
                                <hr className="my-4" />
                                {isHomePage && <div className="mb-4"><SearchBar {...searchBarProps} /></div>}
                                <div className="flex flex-col space-y-2">
                                    <button onClick={() => handleNavigation('/')} className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-xl text-gray-700 font-medium">
                                        <HomeIcon className="h-6 w-6 text-gray-600" />
                                        <span>{t('navbar.home')}</span>
                                    </button>
                                    {isHomePage && (
                                        <button onClick={() => {openExplore(); setIsMobileMenuOpen(false);}} className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-xl text-gray-700 font-medium">
                                            <PresentationChartBarIcon className="h-6 w-6 text-gray-600" />
                                            <span>{t('navbar.explore')}</span>
                                        </button>
                                    )}

                                    <div className="p-2">
                                        <h3 className="font-bold text-gray-800 mb-2 px-1">{t('navbar.add-new-item')}</h3>
                                        {isPreparingPost ? (
                                            <div className="flex justify-center items-center h-24">
                                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div>
                                            </div>
                                        ) : (
                                            <form onSubmit={handlePreparePost} className="px-1">
                                                <input
                                                    type="text"
                                                    className="w-full px-4 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                                                    onChange={(e) => setUrl(e.target.value)}
                                                    value={url}
                                                    placeholder={t('navbar.addUrlPlaceholder')}
                                                />
                                                <button type="submit" className="w-full px-4 py-2 mt-3 bg-black text-white rounded-lg hover:bg-gray-800">
                                                    {t('navbar.add')}
                                                </button>
                                            </form>
                                        )}
                                    </div>

                                    {user.accountType === 'ADMIN' && (
                                        <button onClick={() => handleNavigation('/admin')} className="flex items-center gap-3 p-3 hover:bg-gray-100 rounded-xl text-blue-600 font-medium">
                                            <ShieldCheckIcon className="h-6 w-6" />
                                            <span>{t('navbar.admin-title')}</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <LanguageSelector {...langSelectorProps} isMobile={true} />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="flex-grow flex flex-col justify-center space-y-3">
                                <button onClick={() => handleNavigation('/login')} className="w-full text-center p-3 text-lg font-semibold text-gray-700 hover:bg-gray-100 rounded-xl">
                                    {t('navbar.login')}
                                </button>
                                <button onClick={() => handleNavigation('/register')} className="w-full p-3 text-lg font-semibold bg-black text-white rounded-xl hover:bg-gray-800">
                                    {t('navbar.signup')}
                                </button>
                            </div>
                            <div className="flex-shrink-0">
                                <hr className="my-2"/>
                                <LanguageSelector {...langSelectorProps} isMobile={true} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default NavBar;
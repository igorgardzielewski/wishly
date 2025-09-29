import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import api from "./api";
import NavBar from "./NavBar";
import ProfilePost from "./ProfilePost.jsx";
import EmptyState from "./EmptyState.jsx";
import ReportModal from "./ReportModal";
import { EllipsisHorizontalIcon, FlagIcon } from '@heroicons/react/24/solid';
import {useTranslation} from 'react-i18next';
function ProfilePage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState("posts");
    const [isLoading, setIsLoading] = useState(true);
    const [isTabLoading, setIsTabLoading] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const getEmptyStateMessage = () => {
        if (!profile) return { title: '', message: '' };

        switch (activeTab) {
            case 'posts':
                return {
                    title: profile.isCurrentUser ? t('profile-page.no-posts-user') : t('profile-page.no-posts'),
                    message: profile.isCurrentUser ? t('profile-page.encourage-share') : t('profile-page.userSharesPosts', { username: profile.username })
                };
            case 'private':
                return {
                    title: t('profile-page.no-private-posts'),
                    message: t('profile-page.items-private')
                };
            case 'liked':
                return {
                    title: t('profile-page.liked-posts'),
                    message: t('profile-page.items-liked')
                };
            default:
                return { title: t('profile-page.no-posts-show'), message: "" };
        }
    };

    const fetchDataForTab = useCallback(async (tab) => {
        setIsTabLoading(true);
        let endpoint = `/api/posts/user/${username}`;
        if (tab === 'private') endpoint += '/private';
        if (tab === 'liked') endpoint += '/liked';

        try {
            const response = await api.get(endpoint);
            setPosts(response.data);
        } catch (error) {
            console.error(`Failed to fetch data for tab ${tab}`, error);
            setPosts([]);
        } finally {
            setIsTabLoading(false);
        }
    }, [username]);

    useEffect(() => {
        const fetchProfile = async () => {
            setIsLoading(true);
            try {
                const profileRes = await api.get(`/api/users/profile/${username}`);
                setProfile(profileRes.data);
                fetchDataForTab('posts');
            } catch (error) {
                console.error("Failed to fetch profile data", error);
                navigate('/');
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [username, fetchDataForTab, navigate]);

    const handleTabClick = (tab) => {
        setActiveTab(tab);
        fetchDataForTab(tab);
    };

    const handleFollowToggle = async () => {
        const endpoint = profile.isFollowing ? 'unfollow' : 'follow';
        try {
            await api.post(`/api/users/${endpoint}/${username}`);
            setProfile(prev => ({
                ...prev,
                isFollowing: !prev.isFollowing,
                followerCount: prev.isFollowing ? prev.followerCount - 1 : prev.followerCount + 1
            }));
        } catch (error) {
            console.error(`Failed to ${endpoint}`, error);
        }
    };

    const handlePostUpdate = (postId, updates) => {
        if (updates.isDeleted || ('isPrivate' in updates)) {
            setPosts(prev => prev.filter(p => p.id !== postId));
            if ('isPrivate' in updates) {
                setProfile(prev => ({ ...prev, postCount: prev.postCount + (updates.isPrivate ? -1 : 1) }));
            } else if (updates.isDeleted) {
                setProfile(prev => ({ ...prev, postCount: prev.postCount - 1 }));
            }
        } else {
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, ...updates } : p));
        }
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div></div>;
    }

    return (
        <>
            <div className="flex flex-col h-screen overflow-hidden">
                <NavBar />
                <main className="w-full mx-auto p-4 mt-[10vh] overflow-y-scroll">
                    <div className="w-full max-w-4xl mx-auto">
                        <div className="bg-white rounded-3xl shadow-md overflow-hidden mb-8">
                            <div className="p-8">
                                <div className="flex flex-col md:flex-row items-center justify-between">
                                    <div className="flex flex-col md:flex-row items-center mb-6 md:mb-0">
                                        <img src={profile?.profileImageUrl ? `http://localhost:8082${profile.profileImageUrl}` : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} alt={`${profile?.username}'s profile`} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow"/>
                                        <div className="md:ml-8 text-center md:text-left mt-4 md:mt-0">
                                            <h1 className="text-2xl font-bold text-gray-900">{profile?.username}</h1>
                                            {profile?.bio && (<p className="text-sm text-gray-600 mt-2 max-w-md">{profile.bio}</p>)}
                                            <div className="flex mt-4 space-x-6 text-gray-600">
                                                <div className="flex flex-col items-center"><span className="font-semibold">{profile?.postCount}</span><span className="text-sm">{t('profile-page.posts')}</span></div>
                                                <div className="flex flex-col items-center"><span className="font-semibold">{profile?.followerCount}</span><span className="text-sm">{t('profile-page.followers')}</span></div>
                                                <div className="flex flex-col items-center"><span className="font-semibold">{profile?.followingCount}</span><span className="text-sm">{t('profile-page.following')}</span></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {profile?.isCurrentUser ? (
                                            <button onClick={() => navigate('/profile/edit')} className="bg-gray-100 text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors">{t('profile-page.edit')}</button>
                                        ) : (
                                            <>
                                                <button onClick={handleFollowToggle} className={`${profile?.isFollowing ? 'bg-gray-100 text-gray-800 hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'} px-6 py-2 rounded-full font-medium transition-colors`}>
                                                    {profile?.isFollowing ? t('profile-page.following') : t('profile-page.follow')}
                                                </button>
                                                <div className="relative">
                                                    <button onClick={() => setShowUserMenu(s => !s)} onBlur={() => setTimeout(() => setShowUserMenu(false), 200)} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                                                        <EllipsisHorizontalIcon className="h-6 w-6" />
                                                    </button>
                                                    {showUserMenu && (
                                                        <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                                                            <div className="py-1">
                                                                <button onClick={() => { setIsReportModalOpen(true); setShowUserMenu(false); }} className="w-full flex items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                                                                    <FlagIcon className="h-5 w-5 mr-2" /> {t('profile-page.report-user')}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="border-t border-gray-200">
                                <div className="flex justify-center">
                                    {['posts', 'private', 'liked'].map(tab => (
                                        (profile?.isCurrentUser || tab === 'posts') && (
                                            <button
                                                key={tab}
                                                onClick={() => handleTabClick(tab)}
                                                className={`py-4 px-6 capitalize ${activeTab === tab ? "border-b-2 border-black font-medium" : "text-gray-500"} cursor-pointer`}
                                            >
                                                <div className="flex items-center">{t(`profile-page.tab.${tab}`)}</div>
                                            </button>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                        {isTabLoading ? (
                            <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div></div>
                        ) : (
                            posts.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {posts.map(post => <ProfilePost key={post.id} post={post} isOwner={profile.isCurrentUser} onPostUpdate={handlePostUpdate} />)}
                                </div>
                            ) : (
                                <EmptyState {...getEmptyStateMessage()} />
                            )
                        )}
                    </div>
                </main>
            </div>
            {profile && <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} entityId={profile.id} entityType="USER" />}
        </>
    );
}

export default ProfilePage;
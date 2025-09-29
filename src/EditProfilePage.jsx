import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import NavBar from "./NavBar";
import { useAuth } from "./AuthContext";
import { UserCircleIcon, ShieldCheckIcon, ComputerDesktopIcon, DevicePhoneMobileIcon, ArrowLeftIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import {useTranslation} from "react-i18next";
import {t} from "i18next";

const ProfileSettings = () => {
    const { user, refetchUser, updateToken } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const { t } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        bio: '',
        avatarUrl: ''
    });
    const [imagePreview, setImagePreview] = useState('https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');

    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                fullName: user.fullName || '',
                bio: user.bio || '',
                avatarUrl: user.avatarUrl || ''
            });
            if (user.avatarUrl) {
                setImagePreview(`http://localhost:8082${user.avatarUrl}`);
            }
        }
    }, [user]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setIsUploading(true);
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        try {
            const response = await api.post('/api/uploads/avatar', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newAvatarUrl = response.data.avatarUrl;
            setFormData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
            setImagePreview(`http://localhost:8082${newAvatarUrl}`);
        } catch (error) {
            console.error("Error uploading file:", error);
            alert(t('edit-profile.image-upload-fail'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        setSuccess('');
        try {
            const response = await api.put('/api/users/me/profile', formData);
            if (response.data.token) {
                updateToken(response.data.token);
            }
            await refetchUser();
            setSuccess('Profile updated successfully!');
            setTimeout(() => navigate(`/profile/${formData.username}`), 1000);
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.response?.data || t('edit-profile.error-updating');
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">{t('edit-profile.public')}</h2>
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative w-24 h-24">
                        <img src={imagePreview} alt="Profile Preview" className="w-24 h-24 rounded-full object-cover border-4 border-white shadow"/>
                        {isUploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div></div>}
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{user?.username}</h3>
                        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden"/>
                        <button type="button" onClick={() => fileInputRef.current.click()} className="text-sm font-medium text-black hover:underline" disabled={isUploading}>
                            {t('edit-profile.change-photo')}
                        </button>
                    </div>
                </div>
                {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                {success && <p className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">{success}</p>}
                <div className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">{t('edit-profile.username')}</label>
                        <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"/>
                    </div>
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">{t('edit-profile.full-name')}</label>
                        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"/>
                    </div>
                    <div>
                        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                        <textarea name="bio" id="bio" rows="4" value={formData.bio} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"></textarea>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-4">
                <button type="button" onClick={() => navigate(`/profile/${user.username}`)} className="bg-gray-100 text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-200">{t('edit-profile.cancel')}</button>
                <button type="submit" disabled={isSaving || isUploading} className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 disabled:bg-gray-400">
                    {isSaving ? t('edit-profile.saving') : t('edit-profile.save')}
                </button>
            </div>
        </form>
    );
};

const SecuritySettings = () => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmationPassword: '',
    });
    const { t } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwordData.newPassword === passwordData.currentPassword) {
            setError(t('edit-profile.err-same-password'));
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmationPassword) {
            setError(t('edit-profile.err-password-match'));
            return;
        }

        setIsSaving(true);
        try {
            await api.put('/api/users/me/change-password', passwordData);
            setSuccess(t('edit-profile.password-change'));
            setPasswordData({ currentPassword: '', newPassword: '', confirmationPassword: '' });
        } catch (err) {
            const errorMessage = err.response?.data || t('edit-profile.failed-to-change');
            setError(errorMessage);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('edit-profile.password-security')}</h2>
                    {error && <p className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>}
                    {success && <p className="mb-4 text-sm text-green-600 bg-green-50 p-3 rounded-lg">{success}</p>}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">{t('edit-profile.current-pswd')}</label>
                            <input type="password" name="currentPassword" id="currentPassword" value={passwordData.currentPassword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black" required />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">{t('edit-profile.new-pswd')}</label>
                            <input type="password" name="newPassword" id="newPassword" value={passwordData.newPassword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black" required />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">{t('edit-profile.confirm-new-pswd')}</label>
                            <input type="password" name="confirmationPassword" id="confirmPassword" value={passwordData.confirmationPassword} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black" required />
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center disabled:bg-gray-400">
                        {isSaving ? (<><div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>{t('edit-profile.saving')}</>) : (t('edit-profile.change-pswd'))}
                    </button>
                </div>
            </form>
        </div>
    );
};

function EditProfilePage() {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [activeSection, setActiveSection] = useState('profile');
    const { t } = useTranslation();
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { id: 'profile', label: t('edit-profile.edit-p-label'), icon: <UserCircleIcon className="w-5 h-5 mr-3"/> },
        { id: 'security', label: t('edit-profile.pswd_security'), icon: <ShieldCheckIcon className="w-5 h-5 mr-3"/> },
    ];

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            <NavBar />
            <main className="w-full flex-grow mt-[10vh] overflow-y-scroll">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center gap-4 mb-8">
                        <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                            <ArrowLeftIcon className="w-6 h-6 text-gray-800" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">{t('edit-profile.settings')}</h1>
                    </div>
                    <div className="flex flex-col md:flex-row gap-8">
                        <aside className="w-full md:w-64">
                            <nav className="space-y-2">
                                {menuItems.map(item => (
                                    <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeSection === item.id ? 'bg-gray-200 text-black' : 'text-gray-600 hover:bg-gray-100'}`}>
                                        {item.icon}
                                        {item.label}
                                    </button>
                                ))}
                            </nav>
                            <hr className="my-4" />
                            <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
                                {t('edit-profile.logout')}
                            </button>
                        </aside>
                        <div className="flex-1">
                            <div className="bg-white rounded-3xl shadow-md overflow-hidden">
                                {activeSection === 'profile' && <ProfileSettings />}
                                {activeSection === 'security' && <SecuritySettings />}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default EditProfilePage;
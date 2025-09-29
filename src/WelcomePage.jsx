import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import api from './api';
import { useAuth } from './AuthContext';
import { useTranslation } from 'react-i18next';

function WelcomePage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const [profileData, setProfileData] = useState({
        fullName: user?.fullName || '',
        bio: '',
        avatarUrl: user?.avatarUrl || ''
    });

    const [imagePreview, setImagePreview] = useState(user?.avatarUrl || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/api/uploads/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newAvatarUrl = response.data.avatarUrl;
            setProfileData(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
            setImagePreview(`http://localhost:8082${newAvatarUrl}`);

        } catch (error) {
            console.error("Error uploading file:", error);
            alert(t('welcomePage.errorUpload'));
        } finally {
            setIsUploading(false);
        }
    };

    const handleFinishSetup = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await api.put('/api/users/me/profile', profileData);
            navigate('/');
        } catch (error) {
            console.error("Error updating profile", error);
            alert(t('welcomePage.errorProfileUpdate'));
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <NavBar />
            <main className="flex-grow flex items-center justify-center p-4">
                <div className="w-full max-w-lg">
                    <div className="bg-white rounded-3xl shadow-md p-8 text-center">
                        <h1 className="text-3xl font-bold text-gray-900">{t('welcomePage.title', { username: user?.username })}</h1>
                        <p className="text-gray-600 mt-2 mb-8">{t('welcomePage.subtitle')}</p>

                        <form onSubmit={handleFinishSetup} className="space-y-6">
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-32">
                                    <img src={imagePreview} alt={t('welcomePage.avatarAlt')} className="w-32 h-32 rounded-full object-cover ring-2 ring-gray-200" />
                                    {isUploading && <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-full"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div></div>}
                                </div>
                                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                                <button type="button" onClick={() => fileInputRef.current.click()} className="mt-4 text-sm font-medium text-black hover:underline" disabled={isUploading}>
                                    {t('welcomePage.uploadButton')}
                                </button>
                            </div>

                            <div>
                                <label htmlFor="fullName" className="sr-only">{t('welcomePage.fullNameLabel')}</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    id="fullName"
                                    placeholder={t('welcomePage.fullNamePlaceholder')}
                                    value={profileData.fullName}
                                    onChange={handleChange}
                                    className="w-full text-center px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                                />
                            </div>
                            <div>
                                <label htmlFor="bio" className="sr-only">{t('welcomePage.bioLabel')}</label>
                                <textarea
                                    name="bio"
                                    id="bio"
                                    placeholder={t('welcomePage.bioPlaceholder')}
                                    rows="3"
                                    value={profileData.bio}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-black focus:border-black resize-none"
                                ></textarea>
                            </div>

                            <button type="submit" disabled={isSaving || isUploading} className="w-full bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center justify-center disabled:bg-gray-400">
                                {isSaving ? t('welcomePage.submitButtonSaving') : t('welcomePage.submitButton')}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default WelcomePage;
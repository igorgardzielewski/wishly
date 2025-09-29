import { useEffect, useState } from 'react';
import { useTransition, animated } from '@react-spring/web';
import api from './api';
import { XMarkIcon } from '@heroicons/react/24/solid';
import {useTranslation} from 'react-i18next';
function AdminEditUserModal({ user, isOpen, onClose, onUserUpdate }) {
    const [formData, setFormData] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const { t } = useTranslation();
    useEffect(() => {
        if (user) {
            setFormData({
                username: user.username || '',
                fullName: user.fullName || '',
                email: user.email || '',
                accountType: user.accountType || 'USER',
                active: user.active === true,
            });
            setError('');
        }
    }, [user]);

    const transitions = useTransition(isOpen, {
        from: { opacity: 0, transform: 'scale(0.9)' },
        enter: { opacity: 1, transform: 'scale(1)' },
        leave: { opacity: 0, transform: 'scale(0.9)' },
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError('');
        try {
            const response = await api.put(`/api/admin/users/${user.id}`, formData);
            onUserUpdate(response.data);
            onClose();
        } catch (err) {
            setError(err.response?.data || t('admin-edit-modal.error-updating'));
        } finally {
            setIsSaving(false);
        }
    };

    return transitions((styles, item) =>
            item && user && (
                <animated.div style={{ opacity: styles.opacity }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center" onClick={onClose}>
                    <animated.div style={styles} className="bg-white rounded-2xl shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                        <form onSubmit={handleSubmit}>
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-800">{t('admin-edit-modal.edit-user')} {user.username}</h2>
                                <button type="button" onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                                    <XMarkIcon className="h-6 w-6 text-gray-500" />
                                </button>
                            </div>
                            <div className="p-6">
                                {error && <p className="text-red-600 bg-red-50 p-3 rounded-lg text-sm mb-4">{error}</p>}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">{t('admin-edit-modal.username')}</label>
                                        <input type="text" name="username" id="username" value={formData.username} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"/>
                                    </div>
                                    <div>
                                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">{t('admin-edit-modal.full-name')}</label>
                                        <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"/>
                                    </div>
                                    <div className="col-span-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">{t('admin-edit-modal.email')}</label>
                                        <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"/>
                                    </div>
                                    <div>
                                        <label htmlFor="accountType" className="block text-sm font-medium text-gray-700 mb-1">{t('admin-edit-modal.account-type')}</label>
                                        <select name="accountType" id="accountType" value={formData.accountType} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black">
                                            <option value="USER">{t('admin-edit-modal.account-type')}</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('admin-edit-modal.status')}</label>
                                        <div className="flex items-center p-2 border border-gray-300 rounded-lg">
                                            <input name="active" type="checkbox" checked={formData.active} onChange={handleChange} id="active-checkbox" className="h-4 w-4 text-black border-gray-300 rounded focus:ring-black"/>
                                            <label htmlFor="active-checkbox" className="ml-2 text-sm">{t('admin-edit-modal.account-active')}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
                                <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-300 transition-colors">{t('admin-edit-modal.cancel')}</button>
                                <button type="submit" disabled={isSaving} className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 disabled:bg-gray-400">
                                    {isSaving ? t('admin-edit-modal.saving') : t('admin-edit-modal.save-changes')}
                                </button>
                            </div>
                        </form>
                    </animated.div>
                </animated.div>
            )
    );
}
export default AdminEditUserModal;
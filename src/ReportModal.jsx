import { useState } from 'react';
import api from './api';
import { useTransition, animated } from '@react-spring/web';
import { XMarkIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next'; // Import hooka

const ReportModal = ({ isOpen, onClose, entityId, entityType }) => {
    const { t } = useTranslation();

    const REPORT_REASON_KEYS = [
        "spam",
        "nudity",
        "hateSpeech",
        "falseInfo",
        "scam",
        "other"
    ];

    const [selectedReason, setSelectedReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async () => {
        if (!selectedReason) {
            setError(t('reportModal.errorNoReason'));
            return;
        }
        setIsSubmitting(true);
        setError('');
        try {
            await api.post('/api/reports', { entityId, entityType, reason: selectedReason });
            setSuccess(true);
        } catch (err) {
            setError(err.response?.data || t('reportModal.errorDefault'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setSuccess(false);
            setError('');
            setSelectedReason('');
        }, 300);
    };

    const transitions = useTransition(isOpen, {
        from: { opacity: 0, transform: 'scale(0.95)' },
        enter: { opacity: 1, transform: 'scale(1)' },
        leave: { opacity: 0, transform: 'scale(0.95)' },
        config: { tension: 220, friction: 20 },
    });

    const translatedEntityType = t(`reportModal.entityTypes.${entityType}`, {
        defaultValue: entityType.toLowerCase()
    });

    return transitions((styles, item) => item && (
        <animated.div style={{ opacity: styles.opacity }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4" onClick={handleClose}>
            <animated.div style={styles} className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                {success ? (
                    <div className="p-8 text-center flex flex-col items-center justify-center h-80">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <CheckCircleIcon className="w-12 h-12 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{t('reportModal.successTitle')}</h3>
                        <p className="mt-2 text-gray-600">{t('reportModal.successMessage')}</p>
                        <button onClick={handleClose} className="mt-6 w-full bg-black text-white py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors">
                            {t('reportModal.closeButton')}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">{t('reportModal.title')}</h3>
                            <button onClick={handleClose} className="p-1 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600">
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">{t('reportModal.subtitle', { entityType: translatedEntityType })}</p>
                            <div className="space-y-3">
                                {REPORT_REASON_KEYS.map(reasonKey => {
                                    const reasonValue = t(`reportModal.reasons.${reasonKey}`);
                                    return (
                                        <button
                                            key={reasonKey}
                                            onClick={() => setSelectedReason(reasonValue)}
                                            className={`w-full flex justify-between items-center text-left p-4 rounded-lg border-2 transition-all ${selectedReason === reasonValue ? 'border-black ring-2 ring-black' : 'border-gray-200 hover:border-gray-400'}`}
                                        >
                                            <span className="font-medium">{reasonValue}</span>
                                            {selectedReason === reasonValue && <CheckCircleIcon className="h-6 w-6 text-black" />}
                                        </button>
                                    );
                                })}
                            </div>
                            {error && <p className="text-red-600 text-sm mt-4">{error}</p>}
                        </div>
                        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                            <button onClick={handleClose} className="bg-gray-200 text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-300 transition-colors">
                                {t('reportModal.cancelButton')}
                            </button>
                            <button onClick={handleSubmit} disabled={!selectedReason || isSubmitting} className="bg-red-600 text-white px-6 py-2 rounded-full font-medium hover:bg-red-700 transition-colors disabled:bg-red-300 disabled:cursor-not-allowed flex items-center">
                                {isSubmitting && <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>}
                                {isSubmitting ? t('reportModal.submittingButton') : t('reportModal.submitButton')}
                            </button>
                        </div>
                    </>
                )}
            </animated.div>
        </animated.div>
    ));
}

export default ReportModal;
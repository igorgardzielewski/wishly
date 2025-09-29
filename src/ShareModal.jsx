// ShareModal.jsx
import { useState, useEffect } from "react";
import { useTransition, animated, config } from "@react-spring/web";
import { useTranslation } from "react-i18next"; // 1. Import hooka

function ShareModal({ isOpen, onClose, postUrl }) {
    const { t } = useTranslation(); // 2. Inicjalizacja hooka
    const [isCopied, setIsCopied] = useState(false);

    const transitions = useTransition(isOpen, {
        from: { opacity: 0, transform: 'scale(0.95)' },
        enter: { opacity: 1, transform: 'scale(1)' },
        leave: { opacity: 0, transform: 'scale(0.95)' },
        config: config.stiff,
    });

    useEffect(() => {
        if (isOpen) {
            setIsCopied(false);
        }
    }, [isOpen]);

    const handleCopy = () => {
        navigator.clipboard.writeText(postUrl).then(() => {
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }).catch(err => {
            console.error(t('shareModal.errorCopy'), err);
        });
    };

    return transitions(
        (styles, item) =>
            item && (
                <animated.div
                    style={{ opacity: styles.opacity }}
                    className="fixed inset-0 bg-gray-900/30 backdrop-blur-md flex items-center justify-center z-50"
                    onClick={onClose}
                >
                    <animated.div
                        style={styles}
                        className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 m-4 flex flex-col gap-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">{t('shareModal.title')}</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex flex-col gap-2">
                            <p className="text-sm text-gray-500">{t('shareModal.subtitle')}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <input
                                    type="text"
                                    value={postUrl}
                                    readOnly
                                    className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2 text-gray-600 focus:outline-none"
                                />
                                <button
                                    onClick={handleCopy}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${
                                        isCopied
                                            ? 'bg-green-500 text-white'
                                            : 'bg-black text-white hover:bg-gray-800'
                                    }`}
                                >
                                    {isCopied ? t('shareModal.buttonCopied') : t('shareModal.buttonCopy')}
                                </button>
                            </div>
                        </div>
                    </animated.div>
                </animated.div>
            )
    );
}

export default ShareModal;
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NavBar from "./NavBar";
import api from "./api";
import {useTranslation} from "react-i18next";

function CreatePostPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const { preparedData } = location.state || {};
    const {t} = useTranslation();
    if (!preparedData) {
        navigate('/');
        return null;
    }

    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        const finalPostData = {
            ...preparedData,
            description: description,
        };

        try {
            const response = await api.post("/api/posts/create", finalPostData);
            navigate('/');

        } catch (error) {
            alert(t('create-post.fail-create'));
            console.error("Error creating post", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            <NavBar />
            <main className="flex-grow flex items-center justify-center p-4">
                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-lg flex ring-1 ring-gray-200"
                >
                    <div className="w-3/5 h-full">
                        <img
                            src={preparedData.imageUrl}
                            alt="Item Preview"
                            className="w-full h-full object-cover rounded-l-3xl"
                        />
                    </div>
                    <div className="w-2/5 h-full flex flex-col p-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('create-post.create-new')}</h1>
                        <p className="text-sm text-gray-500 mb-6">{t('create-post.review')}</p>
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-800 truncate">{preparedData.title}</h2>
                            <p className="text-sm text-gray-500 mt-1">{preparedData.brand}</p>
                            <div className="flex justify-between items-baseline mt-2">
                                <p className="text-lg font-bold text-black">{preparedData.price.toFixed(2)} zł</p>
                                <p className="text-sm text-gray-500">{preparedData.shopName}</p>
                            </div>
                        </div>
                        <div className="flex flex-col flex-grow">
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">{t('create-post.desc')}</label>
                            <textarea
                                id="description"
                                name="description"
                                className="w-full flex-grow px-4 py-3 border border-gray-300 rounded-2xl focus:ring-black focus:border-black transition-colors resize-none"
                                placeholder={t('create-post.desc-placeholder')}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            ></textarea>
                        </div>
                        <div className="pt-6 flex justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="bg-gray-100 text-gray-800 px-6 py-2 rounded-full font-medium hover:bg-gray-200 transition-colors"
                            >
                                {t('create-post.cancel')}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="bg-black text-white px-6 py-2 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center disabled:bg-gray-400"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                                        {t('create-post.sharing')}
                                    </>
                                ) : (
                                    t('create-post.share')
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </div>
    );
}

export default CreatePostPage;
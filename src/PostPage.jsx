// PostPage.jsx

import NavBar from "./NavBar.jsx";
import { useParams, useNavigate } from "react-router-dom";
import Post from "./Post";
import axios from "axios";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

function PostPage() {
    const { postId } = useParams();
    const [postData, setPostData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        if (!postId) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        axios.get(`http://localhost:8082/api/posts/${postId}`, {
            headers: { 'Authorization': `Bearer ` + localStorage.getItem("token") }
        })
            .then((res) => {
                setPostData(res.data);
            })
            .catch((err) => {
                console.error(err);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [postId]);

    const handleGoBack = () => {
        navigate(-1);
    };

    if (isLoading) {
        return (
            <>
                <NavBar />
                <div className="flex h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-black"></div>
                </div>
            </>
        );
    }

    if (!postData) {
        return (
            <>
                <NavBar />
                <div className="text-center mt-20">
                    <h1 className="text-2xl font-bold">Post not found</h1>
                    <button onClick={handleGoBack} className="mt-4 text-blue-500 hover:underline">Go back</button>
                </div>
            </>
        )
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <NavBar />
            <div className="mt-[10vh] p-1 overflow-y-auto">
                <button
                    onClick={handleGoBack}
                    className="flex items-center justify-center text-gray-600 hover:text-black transition-colors group cursor-pointer bg-white/80 backdrop-blur-sm py-2 px-4"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                        <path fillRule="evenodd" d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-2">{t('postpage.back')}</span>
                </button>
                <Post postData={postData} />
            </div>
        </div>
    );
}

export default PostPage;
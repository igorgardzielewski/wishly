import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import NavBar from './NavBar';
import Post from './Post'; // Importujemy nasz główny komponent posta
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import {useTranslation} from "react-i18next";
function ExplorePage() {
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const {t} = useTranslation();
    useEffect(() => {
        if (!hasMore && page > 0) return;

        setIsLoading(true);
        api.get('/api/posts/explore', {
            params: { page: page, size: 5 }
        }).then(response => {
            setPosts(prevPosts => [...prevPosts, ...response.data.content]);
            setHasMore(!response.data.last);
        }).catch(error => {
            console.error("Failed to fetch explore posts:", error);
        }).finally(() => {
            setIsLoading(false);
        });
    }, [page]);

    const handleNext = () => {
        const newIndex = currentIndex + 1;
        if (newIndex < posts.length) {
            setCurrentIndex(newIndex);
        }
        if (newIndex >= posts.length - 2 && hasMore && !isLoading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handlePrevious = () => {
        const newIndex = currentIndex - 1;
        if (newIndex >= 0) {
            setCurrentIndex(newIndex);
        }
    };

    const currentPost = posts[currentIndex];

    return (
        <div className="flex flex-col h-screen w-screen overflow-y-auto bg-black">
            <NavBar />
            <main className="flex-grow flex items-center justify-center relative">
                {currentIndex > 0 && (
                    <button
                        onClick={handlePrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all"
                    >
                        <ChevronLeftIcon className="h-8 w-8 text-white" />
                    </button>
                )}

                <div className="w-full h-full flex items-center justify-center overflow-y-auto">
                    {isLoading && posts.length === 0 ? (
                        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
                    ) : currentPost ? (
                        <Post postData={currentPost} />
                    ) : (
                        <div className="text-center text-white">
                            <h2 className="text-2xl font-bold">{t('explore.no-posts')}</h2>
                            <p className="mt-2">{t('explore.comeback')}</p>
                        </div>
                    )}
                </div>

                {(currentIndex < posts.length - 1 || hasMore) && (
                    <button
                        onClick={handleNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2 transition-all"
                    >
                        <ChevronRightIcon className="h-8 w-8 text-white" />
                    </button>
                )}
            </main>
        </div>
    );
}

export default ExplorePage;
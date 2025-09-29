import { useEffect, useState,useRef, useCallback } from 'react';
import { useTransition,animated} from '@react-spring/web';
import api from './api';
import Post from './Post';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/solid';
import {useTranslation} from 'react-i18next';
function ExploreOverlay({ isOpen, onClose }) {
    const [posts, setPosts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const { t } = useTranslation();
    useEffect(() => {
        if (isOpen && posts.length === 0) {
            setIsLoading(true);
            api.get('/api/posts/explore', { params: { page: 0, size: 5 } })
                .then(response => {
                    setPosts(response.data.content);
                    setHasMore(!response.data.last);
                    setIsLoading(false);
                });
        }
    }, [isOpen]);

    const fetchMorePosts = useCallback(() => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        const nextPage = page + 1;
        api.get('/api/posts/explore', { params: { page: nextPage, size: 5 } })
            .then(response => {
                setPosts(prev => [...prev, ...response.data.content]);
                setHasMore(!response.data.last);
                setPage(nextPage);
            }).finally(() => setIsLoading(false));
    }, [isLoading, hasMore, page]);

    const handleNext = () => {
        const newIndex = currentIndex + 1;
        if (newIndex >= posts.length - 2 && hasMore) {
            fetchMorePosts();
        }
        if (newIndex < posts.length) {
            setCurrentIndex(newIndex);
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const transitions = useTransition(isOpen, {
        from: { opacity: 0 },
        enter: { opacity: 1 },
        leave: { opacity: 0 },
    });

    const currentPost = posts[currentIndex];

    return transitions((styles, item) =>
            item && (
                <animated.div
                    style={styles}
                    className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center"
                    onClick={onClose}
                >
                    <div className="relative w-full h-full flex items-center justify-center overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-black/30 rounded-full p-2 text-white hover:bg-black/50">
                            <XMarkIcon className="h-6 w-6" />
                        </button>

                        {currentIndex > 0 && (
                            <button onClick={handlePrevious} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2">
                                <ChevronLeftIcon className="h-8 w-8 text-white" />
                            </button>
                        )}

                        {isLoading && !currentPost ? (
                            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
                        ) : currentPost ? (
                            <Post postData={currentPost} />
                        ) : (
                            <p className="text-white">{t('explore.no-posts')}</p>
                        )}

                        {(currentIndex < posts.length - 1 || hasMore) && (
                            <button onClick={handleNext} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full p-2">
                                <ChevronRightIcon className="h-8 w-8 text-white" />
                            </button>
                        )}
                    </div>
                </animated.div>
            )
    );
}

export default ExploreOverlay;
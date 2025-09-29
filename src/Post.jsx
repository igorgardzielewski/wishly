import { animated, config, easings, useSpring } from "@react-spring/web";
import { useState, useEffect, useCallback } from "react";
import Comment from "./Comment";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { useAuth } from './AuthContext';
import ShareModal from "./ShareModal";
import ReportModal from "./ReportModal";
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline, ChatBubbleOvalLeftIcon as CommentOutline, ShareIcon, FlagIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';

function Post({ postData }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [error, setError] = useState('');
    const [comments, setComments] = useState([]);
    const [isLoadingComments, setIsLoadingComments] = useState(false);
    const [likes, setLikes] = useState(postData.likeList?.length || 0);
    const [hasUserLiked, setHasUserLiked] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    useEffect(() => {
        setLikes(postData.likeList?.length || 0);

        if (user && postData.likeList) {
            const userLiked = postData.likeList.some(like => like.user.id === user.id);
            setHasUserLiked(userLiked);
        } else {
            setHasUserLiked(false);
        }

        setComments([]);
        setIsExpanded(false);

    }, [postData, user]);

    const fetchComments = useCallback(async () => {
        if (!postData.id) return;
        setIsLoadingComments(true);
        try {
            const response = await api.get(`/api/posts/${postData.id}/comments`);
            setComments(response.data);
        } catch (err) {
            console.error("Error fetching comments:", err);
        } finally {
            setIsLoadingComments(false);
        }
    }, [postData.id]);

    useEffect(() => {
        if (isExpanded) {
            fetchComments();
        }
    }, [isExpanded, fetchComments]);

    const toggleExpand = () => setIsExpanded(!isExpanded);

    const handleNavigateToItem = () => window.open(postData.itemUrl, "_blank");

    const handleLikeAction = () => {
        if (!user) return navigate('/login');

        const likeRequest = { postId: postData.id };
        const action = hasUserLiked ? api.delete('/api/likes', { data: likeRequest }) : api.post('/api/likes', likeRequest);

        setHasUserLiked(prev => !prev);
        setLikes(prev => hasUserLiked ? prev - 1 : prev + 1);

        action.catch(err => {
            console.error("Like action failed:", err);
            setHasUserLiked(prev => !prev);
            setLikes(prev => hasUserLiked ? prev + 1 : prev - 1);
        });
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        if (!commentText.trim()) { setError('Comment cannot be empty'); return; }

        setIsSending(true);
        setError('');
        const commentData = { postId: postData.id, text: commentText.trim() };

        try {
            await api.post("/api/comments", commentData);
            setCommentText('');
            await fetchComments();
        } catch (e) {
            setError('Failed to add comment');
            console.error(e);
        } finally {
            setIsSending(false);
        }
    };

    const handleDeleteComment = (commentIdToDelete) => {
        setComments(prevComments => prevComments.filter(comment => comment.id !== commentIdToDelete));
    };

    const sidebarAnimation = useSpring({
        opacity: isExpanded ? 1 : 0,
        transform: isExpanded ? 'translateX(0)' : 'translateX(-300px)',
        zIndex: isExpanded ? 10 : -1,
        config: { ...config.molasses, duration: 400, easing: easings.easeInOutExpo },
        immediate: key => key === 'zIndex' && !isExpanded
    });

    const commentsToDisplay = comments.length > 0 ? comments : postData.commentList || [];
    const commentCount = comments.length > 0 ? comments.length : postData.commentList?.length || 0;
    const isOwner = user && user.id === postData.user?.id;

    return (
        <>
            <div className="flex flex-col lg:flex-row items-center justify-center w-full">
                <div className={`bg-white transition-all duration-500 ease-in-out ${isExpanded ? 'rounded-t-4xl lg:rounded-tl-4xl lg:rounded-bl-4xl lg:rounded-r-none' : 'rounded-4xl'} shadow-md overflow-hidden ring-1 ring-gray-200 w-full max-w-xl h-auto lg:h-[80vh] relative flex flex-col`}>

                    <div className="relative flex-grow cursor-pointer aspect-[4/5] lg:aspect-auto" onClick={toggleExpand}>
                        <img src={postData.imageUrl} alt={postData.title} className="absolute inset-0 w-full h-full object-cover" />

                        <div onClick={(e) => { e.stopPropagation(); navigate(`/profile/${postData.user?.username}`) }} className="absolute top-10 left-0 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-sm w-auto max-w-1/2 rounded-tr-4xl rounded-br-4xl ring-1 ring-gray-200 gap-3 cursor-pointer hover:bg-gray-50 transition-colors">
                            <img src={postData.user?.avatarUrl ? `http://localhost:8082${postData.user.avatarUrl}` : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} alt={postData.user?.username} className="w-8 h-8 rounded-full object-cover"/>
                            <span className="font-semibold">{postData.user?.username}</span>
                        </div>
                        <div onClick={(e) => { e.stopPropagation(); handleNavigateToItem() }} className="absolute top-10 right-0 flex items-center justify-between px-6 py-4 hover:bg-gray-600 cursor-pointer bg-black text-white w-auto max-w-1/2 rounded-tl-4xl rounded-bl-4xl gap-3">
                            <h1 className="font-bold">{postData.price?.toFixed(2)} zł</h1>
                        </div>
                    </div>

                    <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm py-4 px-6 rounded-t-3xl shadow-lg z-10">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <button onClick={handleLikeAction} className="flex items-center gap-1.5 group">
                                    {hasUserLiked ? <HeartSolid className="size-7 text-red-500 transition-transform group-hover:scale-110" /> : <HeartOutline className="size-7 text-gray-600 transition-transform group-hover:scale-110" />}
                                    <span className={`font-medium ${hasUserLiked ? 'text-red-500' : 'text-gray-700'}`}>{likes}</span>
                                </button>
                                <button onClick={toggleExpand} className="flex items-center gap-1.5 group">
                                    <CommentOutline className="size-7 text-gray-600 transition-transform group-hover:scale-110" />
                                    <span className="font-medium text-gray-700">{commentCount}</span>
                                </button>
                            </div>
                            <button onClick={() => setIsShareModalOpen(true)} className="flex items-center bg-black text-white px-4 py-2 rounded-full gap-2 hover:bg-gray-800 transition-colors">
                                <ShareIcon className="w-5 h-5" />
                                <span className="font-medium">{t('post.share')}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {isExpanded && (
                    <animated.div style={sidebarAnimation} className="bg-white rounded-b-4xl lg:rounded-b-none lg:rounded-tr-4xl lg:rounded-br-4xl shadow-md overflow-hidden ring-1 ring-gray-200 w-full max-w-xl lg:max-w-md h-auto lg:h-[80vh] relative flex flex-col">
                        <div className="w-full p-6 space-y-4 border-b border-gray-200">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{postData.brand}</p>
                                <h1 className="text-2xl font-bold text-gray-900">{postData.title}</h1>
                            </div>
                            {postData.description && (<p className="text-gray-700 text-base leading-relaxed">{postData.description}</p>)}
                            <div className="flex justify-end items-center text-gray-600 pt-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-1.5"><path d="M10.5 18.75a.75.75 0 0 0 0 1.5h3a.75.75 0 0 0 0-1.5h-3Z" /><path fillRule="evenodd" d="M8.625 1.5A.75.75 0 0 1 9.375 2.25v2.25h5.25V2.25a.75.75 0 0 1 1.5 0v2.25h2.25a3 3 0 0 1 3 3v10.5a3 3 0 0 1-3-3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H7.5V2.25A.75.75 0 0 1 8.625 1.5ZM5.25 6H18a1.5 1.5 0 0 1 1.5 1.5v2.25H3.75V7.5A1.5 1.5 0 0 1 5.25 6ZM3.75 12v6a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5v-6H3.75Z" clipRule="evenodd" /></svg>
                                <span className="font-semibold">{postData.shopName}</span>
                            </div>
                        </div>
                        {!isOwner && user && (
                            <div className="absolute top-4 right-5 z-10">
                                <button onClick={() => setIsReportModalOpen(true)} className="rounded-full bg-black/40 p-2 text-white hover:bg-black/60" title="Report this post">
                                    <FlagIcon className="h-5 w-5" />
                                </button>
                            </div>
                        )}
                        <div className="flex flex-col flex-grow overflow-hidden">
                            <h2 className="font-semibold text-lg p-4">{t('post.comms')} ({commentCount})</h2>
                            <div className="flex-grow overflow-y-auto">
                                {isLoadingComments ? (
                                    <div className="flex justify-center items-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div></div>
                                ) : (
                                    commentsToDisplay.length > 0 ? commentsToDisplay.map(comment => (
                                        <Comment
                                            key={comment.id}
                                            commentData={comment}
                                            postAuthorId={postData.user?.id}
                                            onDelete={handleDeleteComment}
                                        />
                                    )) : <div className="text-center text-gray-500 py-6">{t('post.no-comms-inf')}</div>
                                )}
                            </div>
                            <div className="border-t border-gray-200 p-3 mt-auto">
                                <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                                    <input type="text" placeholder={t('post.comm-placeholder')} className="flex-grow px-4 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-black" onChange={(e) => setCommentText(e.target.value)} value={commentText} />
                                    <button type="submit" disabled={isSending} className="bg-black text-white rounded-full p-3 hover:bg-gray-800 transition-colors flex items-center justify-center disabled:bg-gray-500">
                                        {isSending ? <div className="w-5 h-5 border-2 border-white border-b-transparent rounded-full animate-spin"></div> : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" /></svg>}
                                    </button>
                                </form>
                                {error && <p className="text-red-500 text-sm mt-1 ml-4">{error}</p>}
                            </div>
                        </div>
                    </animated.div>
                )}
            </div>

            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} postUrl={`${window.location.origin}/post/${postData.id}`} />
            <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} entityId={postData.id} entityType="POST" />
        </>
    );
}

export default Post;
// ProfilePost.jsx
import { useNavigate } from 'react-router-dom';
import { HeartIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';
import PostSettingsMenu from './PostSettingsMenu.jsx';

function ProfilePost({ post, isOwner, onPostUpdate }) {
    const navigate = useNavigate();

    return (
        <div
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-gray-200"
            onClick={() => navigate(`/post/${post.id}`)}
        >
            <img
                src={post.imageUrl}
                alt={post.title}
                className="relative z-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
            />

            <div className="absolute inset-0 z-10 bg-black/0 transition-colors duration-300 group-hover:bg-black/50 pointer-events-none">
                <div className="flex h-full w-full items-center justify-center gap-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex items-center gap-2 text-white">
                        <HeartIcon className="h-6 w-6" />
                        <span className="font-bold">{post.likeList?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2 text-white">
                        <ChatBubbleOvalLeftIcon className="h-6 w-6" />
                        <span className="font-bold">{post.commentList?.length || 0}</span>
                    </div>
                </div>
            </div>

            {isOwner && (
                <div className="absolute top-2 right-2 z-20" onClick={(e) => e.stopPropagation()}>
                    <PostSettingsMenu post={post} onPostUpdate={onPostUpdate} />
                </div>
            )}
        </div>
    );
}

export default ProfilePost;
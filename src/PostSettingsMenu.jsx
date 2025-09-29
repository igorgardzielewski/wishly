// PostSettingsMenu.jsx
import { useState } from 'react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import api from './api'
import {useTranslation} from "react-i18next";
function PostSettingsMenu({ post, onPostUpdate }) {
    const [isOpen, setIsOpen] = useState(false);
    const {t} = useTranslation();
    const toggleVisibility = async () => {
        const newVisibility = !post.isPrivate;
        try {
            await api.put(`/api/posts/${post.id}/visibility`, { isPrivate: newVisibility });
            onPostUpdate(post.id, { isPrivate: newVisibility });
        } catch (error) {
            console.error("Failed to update post visibility", error);
            alert(t('post-set-menu.alert-post-vis'));
        }
        setIsOpen(false);
    };

    const deletePost = async () => {
        if (window.confirm(t('post-set-menu.delete-confirm'))) {
            try {
                await axios.delete(`http://localhost:8082/api/posts/${post.id}`, {
                    headers: { 'Authorization': `Bearer `+localStorage.getItem("token") }
                });
                onPostUpdate(post.id, { isDeleted: true });
            } catch (error) {
                console.error("Failed to delete post", error);
            }
        }
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen(!isOpen)} className="rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70">
                <EllipsisHorizontalIcon className="h-5 w-5" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                    <div className="py-1">
                        <button onClick={toggleVisibility} className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                            {post.isPrivate ? t('post-set-menu.make-public') : t('post-set-menu.make-private')}
                        </button>

                        <button onClick={deletePost} className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
                            {t('post-set-menu.delete')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PostSettingsMenu;
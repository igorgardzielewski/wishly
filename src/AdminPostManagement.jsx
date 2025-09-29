import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import Pagination from './Pagination';
import { EyeIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import {useTranslation} from 'react-i18next';
function AdminPostManagement() {
    const [postsPage, setPostsPage] = useState(null);
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState({ field: 'createdAt', direction: 'desc' });
    const navigate = useNavigate();
    const {t} = useTranslation();
    const fetchPosts = useCallback(() => {
        const params = {
            page: page,
            size: 8,
            sort: `${sort.field},${sort.direction}`,
            query: searchQuery
        };
        api.get('/api/admin/posts', { params })
            .then(res => setPostsPage(res.data))
            .catch(err => console.error("Failed to fetch posts:", err));
    }, [page, sort, searchQuery]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchPosts();
        }, 300);
        return () => clearTimeout(debounceTimer);
    }, [fetchPosts]);

    const handleSort = (field) => {
        const isDesc = sort.field === field && sort.direction === 'desc';
        setSort({ field, direction: isDesc ? 'asc' : 'desc' });
        setPage(0);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    const handleDelete = async (postId) => {
        if (window.confirm(t('admin-post.delete-confirm'))) {
            try {
                await api.delete(`/api/admin/posts/${postId}`);
                if (postsPage.content.length === 1 && page > 0) {
                    setPage(page - 1);
                } else {
                    fetchPosts();
                }
            } catch (error) {
                console.error(t('admin-post.delete-fail'), error);
                alert(t('admin-post.delete-fail-alert'));
            }
        }
    };

    const SortableHeader = ({ field, label, className = '' }) => {
        const isSorted = sort.field === field;
        return (
            <button onClick={() => handleSort(field)} className={`flex items-center gap-1 font-semibold ${className}`}>
                {label}
                {isSorted && (sort.direction === 'asc' ? <ArrowUpIcon className="h-4 w-4"/> : <ArrowDownIcon className="h-4 w-4"/>)}
            </button>
        );
    };

    return (
        <div className="">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('admin-post.manage-posts')}</h2>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={t('admin-post.post-search-placeholder')}
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 h-[70vh] flex flex-col overflow-y-auto">
                <div className="grid grid-cols-6 gap-4 px-6 py-3 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                    <div className="col-span-2"><SortableHeader field="title" label={t('admin-post.post')}/></div>
                    <div className="col-span-1"><SortableHeader field="user.username" label={t('admin-post.author')}/></div>
                    <div className="col-span-1">{t('admin-post.stats')}</div>
                    <div className="col-span-1"><SortableHeader field="isPrivate" label={t('admin-post.status')}/></div>
                    <div className="col-span-1 text-right">{t('admin-post.actions')}</div>
                </div>

                <div className="divide-y divide-gray-100">
                    {postsPage?.content.map(post => (
                        <div key={post.id} className="grid grid-cols-6 gap-4 px-6 py-4 group hover:bg-gray-50 transition-colors items-center">
                            <div className="col-span-2 flex items-center gap-4 min-w-0">
                                <img src={post.imageUrl || 'https://via.placeholder.com/150'} alt={post.title} className="w-16 h-16 object-cover rounded-lg flex-shrink-0"/>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-gray-900 truncate" title={post.title}>{post.title}</p>
                                    <p className="text-sm text-gray-500 truncate" title={post.brand}>{post.brand}</p>
                                </div>
                            </div>

                            <div className="col-span-1 flex items-center text-sm text-gray-700 min-w-0">
                                <p className="truncate">{post.user.username}</p>
                            </div>

                            <div className="col-span-1 flex items-center text-sm text-gray-700">
                                <div className="flex flex-col">
                                    <span>{post.likeList.length} {t('admin-post.likes')}</span>
                                    <span>{post.commentList.length} {t('admin-post.comments')}</span>
                                </div>
                            </div>

                            <div className="col-span-1 flex items-center">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${post.isPrivate ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                                    {post.isPrivate ? t('admin-post.private') : t('admin-post.public')}
                                </span>
                            </div>

                            <div className="col-span-1 flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => navigate(`/post/${post.id}`)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-full" title={t('admin-post.view-post')}>
                                    <EyeIcon className="h-5 w-5" />
                                </button>
                                <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-full" title={t('admin-post.delete-post-title')}>
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {postsPage && <Pagination currentPage={postsPage.number} totalPages={postsPage.totalPages} onPageChange={setPage} />}
        </div>
    );
}
export default AdminPostManagement;
import { useEffect, useState, useCallback } from 'react';
import api from './api';
import Pagination from './Pagination';
import AdminEditUserModal from './AdminEditUserModal';
import { PencilIcon, TrashIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import {useTranslation} from 'react-i18next';
function AdminUserManagement() {
    const [usersPage, setUsersPage] = useState(null);
    const [page, setPage] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [sort, setSort] = useState({ field: 'id', direction: 'asc' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const {t} = useTranslation();
    const fetchUsers = useCallback(() => {
        const params = {
            page: page,
            size: 10,
            sort: `${sort.field},${sort.direction}`,
            query: searchQuery
        };
        api.get('/api/admin/users', { params })
            .then(res => setUsersPage(res.data))
            .catch(err => console.error("Failed to fetch users:", err));
    }, [page, sort, searchQuery]);

    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            fetchUsers();
        }, 500);
        return () => clearTimeout(debounceTimer);
    }, [fetchUsers]);

    const handleSort = (field) => {
        const isAsc = sort.field === field && sort.direction === 'asc';
        setSort({ field, direction: isAsc ? 'desc' : 'asc' });
        setPage(0);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
        setPage(0);
    };

    const handleDelete = async (userId) => {
        if (window.confirm(t('admin-user.delete-confirm'))) {
            await api.delete(`/api/admin/users/${userId}`);
            fetchUsers();
        }
    };

    const handleUserUpdate = (updatedUser) => {
        setUsersPage(prev => ({
            ...prev,
            content: prev.content.map(u => u.id === updatedUser.id ? updatedUser : u)
        }));
    };

    const SortableHeader = ({ field, label }) => {
        const isSorted = sort.field === field;
        return (
            <button onClick={() => handleSort(field)} className="flex items-center gap-1">
                {label}
                {isSorted && (sort.direction === 'asc' ? <ArrowUpIcon className="h-4 w-4"/> : <ArrowDownIcon className="h-4 w-4"/>)}
            </button>
        );
    };

    return (
        <div className="h-[70vh] flex flex-col justify-between overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">{t('admin-user.manage-users')}</h2>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    placeholder={t('admin-user.search-users-placeholder')}
                    className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-black focus:border-black"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100">
                <div className="grid grid-cols-5 gap-4 px-6 py-3 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-2"><SortableHeader field="username" label={t('admin-user.user')}/></div>
                    <div><SortableHeader field="accountType" label={t('admin-user.role')}/></div>
                    <div><SortableHeader field="active" label={t('admin-user.status')}/></div>
                    <div className="text-right">{t('admin-user.actions')}</div>
                </div>
                <div className="divide-y divide-gray-100">
                    {usersPage?.content.map(user => (
                        <div key={user.id} className="grid grid-cols-5 gap-4 px-6 py-4 group hover:bg-gray-50 items-center">
                            <div className="col-span-2 flex items-center">
                                <div>
                                    <p className="font-medium text-gray-900">{user.username}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.accountType === 'ADMIN' ? 'bg-indigo-100 text-indigo-800' : 'bg-blue-100 text-blue-800'}`}>{user.accountType}</span>
                            </div>
                            <div className="flex items-center">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{user.active ? t('admin-user.active') : t('admin-user.inactive')}</span>
                            </div>
                            <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100">
                                <button onClick={() => {setSelectedUser(user); setIsModalOpen(true);}} className="p-2 text-gray-500 hover:text-blue-600 rounded-full"><PencilIcon className="h-5 w-5" /></button>
                                <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-500 hover:text-red-600 rounded-full"><TrashIcon className="h-5 w-5" /></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {usersPage && <Pagination currentPage={usersPage.number} totalPages={usersPage.totalPages} onPageChange={setPage} />}

            <AdminEditUserModal user={selectedUser} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUserUpdate={handleUserUpdate}/>
        </div>
    );
}
export default AdminUserManagement;
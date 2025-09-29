import { useState } from 'react';
import { ShieldCheckIcon, UsersIcon, DocumentTextIcon, FlagIcon } from '@heroicons/react/24/outline';
import NavBar from './NavBar';
import AdminReportManagement from './AdminReportManagement';
import AdminUserManagement from './AdminUserManagement';
import AdminPostManagement from './AdminPostManagement';
import { useTranslation } from 'react-i18next';
function AdminPage() {
    const [activeSection, setActiveSection] = useState('reports');
    const { t } = useTranslation();
    const menuItems = [
        { id: 'reports', label: 'Pending Reports', icon: FlagIcon },
        { id: 'users', label: 'Manage Users', icon: UsersIcon },
        { id: 'posts', label: 'Manage Posts', icon: DocumentTextIcon },
    ];

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
            <NavBar />
            <main className="w-full max-w-7xl mx-auto p-4 mt-[10vh]">
                <h1 className="text-3xl font-bold mb-8">{t('admin-page.admin-panel')}</h1>
                <div className="flex flex-col md:flex-row gap-8">
                    <aside className="w-full md:w-64">
                        <nav className="space-y-2">
                            {menuItems.map(item => {
                                const Icon = item.icon;
                                return (
                                    <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg ${activeSection === item.id ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                        <Icon className="w-5 h-5 mr-3" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>
                    <div className="flex-1 bg-white rounded-2xl shadow-sm p-6">
                        {activeSection === 'reports' && <AdminReportManagement />}
                        {activeSection === 'users' && <AdminUserManagement />}
                        {activeSection === 'posts' && <AdminPostManagement />}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminPage;
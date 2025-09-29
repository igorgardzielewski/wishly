import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { UserCircleIcon, DocumentTextIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/solid';
import {useTranslation} from "react-i18next";

const ReportedContentCard = ({ report }) => {
    const navigate = useNavigate();
    const { entityType, reportedContent } = report;
    const {t} = useTranslation();
    if (!reportedContent) {
        return (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 font-semibold">{t('admin-report.content-not-found')}</p>
            </div>
        );
    }

    const navigateToContent = () => {
        if (entityType === 'POST') {
            navigate(`/post/${reportedContent.id}`);
        }
    };

    const isClickable = entityType === 'POST';
    const icon = entityType === 'POST' ? <DocumentTextIcon className="h-4 w-4"/> : <ChatBubbleBottomCenterTextIcon className="h-4 w-4"/>;

    return (
        <div className={`mt-3 p-3 bg-white rounded-lg border ${isClickable ? 'cursor-pointer hover:bg-gray-50' : ''}`} onClick={isClickable ? navigateToContent : undefined}>
            <p className="text-xs text-gray-500 flex items-center gap-1">
                {icon}
                {t('admin-report.content-by')} {reportedContent.authorUsername}:
            </p>
            <p className="text-gray-800 italic break-words">"{reportedContent.text}"</p>
        </div>
    );
};

const ReportedUserCard = ({ user }) => {
    const navigate = useNavigate();
    const {t} = useTranslation();
    if (!user) {
        return (
            <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700 font-semibold">{t('admin-report.reported-user-not-found')}</p>
            </div>
        );
    }

    return (
        <div className="mt-3 p-3 bg-white rounded-lg border cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/profile/${user.username}`)}>
            <p className="text-xs text-gray-500 flex items-center gap-1"><UserCircleIcon className="h-4 w-4"/>{t('admin-report.reported-user')}</p>
            <div className="flex items-center gap-2 mt-1">
                <img src={user.avatarUrl ? `http://localhost:8082${user.avatarUrl}` : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png'} alt={user.username} className="w-8 h-8 rounded-full"/>
                <p className="font-semibold text-gray-800">{user.username}</p>
            </div>
        </div>
    );
};


function AdminReportManagement() {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const {t} = useTranslation();
    const fetchReports = () => {
        setIsLoading(true);
        api.get('/api/admin/reports/pending')
            .then(res => setReports(res.data))
            .catch(err => console.error("Failed to fetch reports:", err))
            .finally(() => setIsLoading(false));
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleResolve = async (reportId, shouldDelete) => {
        try {
            await api.post(`/api/admin/reports/${reportId}/resolve`, { delete: shouldDelete });
            fetchReports();
        } catch (error) {
            console.error("Failed to resolve report:", error);
            alert(t('admin-report.alert-resolve-report-fail'));
        }
    };


    if (isLoading) {
        return <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-black"></div></div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-sm  h-[70vh] flex flex-col overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">{t('admin-report.pending-reports')}</h2>
            <div className="space-y-4">
                {reports.length > 0 ? reports.map(report => (
                    <div key={report.id} className="bg-gray-50 p-4 rounded-xl ">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm text-gray-500">
                                    {t('admin-report.report-from')} <span className="font-semibold text-gray-700">{report.reporter.username}</span> {t('admin-report.for')}
                                </p>
                                <p className="text-lg font-bold text-red-600">{report.reason}</p>
                            </div>
                            <span className="text-xs text-gray-400 flex-shrink-0 ml-2">{new Date(report.createdAt).toLocaleString()}</span>
                        </div>

                        {report.entityType === 'USER'
                            ? <ReportedUserCard user={report.reportedUser} />
                            : <ReportedContentCard report={report} />
                        }

                        <div className="mt-4 space-x-2 text-right">
                            <button onClick={() => handleResolve(report.id, false)} className="px-4 py-1.5 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold">{t('admin-report.ignore')}</button>

                            <button onClick={() => handleResolve(report.id, true)} className="px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold">
                                {report.entityType === 'USER' ? t('admin-report.delete-user') : t('admin-report.delete-content')}
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-12 text-gray-500">
                        <p className="font-semibold text-lg">{t('admin-report.no-reports')}</p>
                        <p className="text-sm">{t('admin-report.great')}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
export default AdminReportManagement;
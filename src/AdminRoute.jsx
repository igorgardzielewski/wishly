// src/components/AdminRoute.jsx
import { useAuth } from './AuthContext';
import { Navigate, Outlet } from 'react-router-dom';
import {useTranslation} from 'react-i18next';
function AdminRoute() {
    const { user, isLoading } = useAuth();
    const { t } = useTranslation();
    if (isLoading) {
        return <div>{t('admin-route.loading')}</div>;
    }

    return user && user.accountType === 'ADMIN' ? <Outlet /> : <Navigate to="/" />;
}

export default AdminRoute;
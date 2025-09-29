import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function GuestRoute({ children }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return null;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default GuestRoute;
import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function OAuth2RedirectHandler() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');

        if (token) {
            loginWithToken(token);

            navigate('/');
        } else {
            navigate('/login?error=oauth_failed');
        }
    }, [searchParams, navigate, loginWithToken]);

    return (
        <div className="flex w-full h-screen items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
        </div>
    );
}

export default OAuth2RedirectHandler;

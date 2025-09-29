import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authToken, setAuthToken] = useState(() => localStorage.getItem('token'));
    const [isLoading, setIsLoading] = useState(true);
    const [isExploreOpen, setIsExploreOpen] = useState(false);

    const fetchUser = useCallback(async () => {
        if (authToken) {
            try {
                const response = await api.get('/api/users/me');
                setUser(response.data);
                return response.data;
            } catch (error) {
                console.error("Token jest nieważny lub wystąpił błąd serwera. Wylogowywanie.", error);
                localStorage.removeItem('token');
                setAuthToken(null);
                setUser(null);
                return null;
            }
        }
        return null;
    }, [authToken]);

    useEffect(() => {
        setIsLoading(true);
        fetchUser().finally(() => setIsLoading(false));
    }, [fetchUser]);

    const login = async (credentials) => {
        const response = await api.post('/api/auth/login', credentials);
        const newToken = response.data.token;

        localStorage.setItem('token', newToken);
        setAuthToken(newToken);

        const userResponse = await api.get('/api/users/me');
        setUser(userResponse.data);
        return userResponse.data;
    };

    const register = async (userData) => {
        const response = await api.post('/api/auth/register', userData);
        const newToken = response.data.token;

        localStorage.setItem('token', newToken);
        setAuthToken(newToken);

        const userResponse = await api.get('/api/users/me');
        setUser(userResponse.data);
        return userResponse.data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setAuthToken(null);
        setUser(null);
    };

    const loginWithToken = (tokenFromOAuth) => {
        localStorage.setItem('token', tokenFromOAuth);
        setAuthToken(tokenFromOAuth);

    };

    const openExplore = () => setIsExploreOpen(true);
    const closeExplore = () => setIsExploreOpen(false);

    const authContextValue = {
        user,
        token: authToken,
        isLoading,
        login,
        register,
        logout,
        loginWithToken,
        refetchUser: fetchUser,
        isExploreOpen,
        openExplore,
        closeExplore
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {!isLoading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};

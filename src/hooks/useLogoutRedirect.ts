import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useLogoutRedirect = (redirectTo: string = '/') => {
    const { authorized, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && !authorized) {
            navigate(redirectTo, { replace: true });
        }
    }, [loading, authorized]);

    return { authorized, loading };
};
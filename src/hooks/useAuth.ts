import { useEffect, useState, useCallback } from 'react';
import { useServices } from '../context/ServicesContext';
import { getErrorMessage } from '../utils/getErrorMessage';
import { AuthApiCall } from '../types/models/AuthApiCall';

export const useAuth = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [authorized, setAuthorized] = useState(false);

    const { authService, authStorage } = useServices();


    useEffect(() => {
        setAuthorized(authStorage.hasToken())
    }, [])

    const login = useCallback(async (username: string, password: string): Promise<void> => {
        setError(null)
        setLoading(true)
        try {
            const token = await authService.login({ username, password });
            authStorage.setToken(token)
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            throw err;
        }
        setLoading(false)
        setAuthorized(true)
    }, [authService, authStorage]);

    const logout = useCallback(async (): Promise<void> => {
        setError(null)
        setLoading(true)
        try {
            authStorage.clearToken()
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            throw err;
        }
        setLoading(false)
        setAuthorized(false)
    }, [authStorage]);

    const refresh = useCallback(async (): Promise<void> => {
        setLoading(true)
        try {
            const refresh_token = authStorage.getToken()?.refresh_token;
            if (!refresh_token) {
                throw new Error('No refresh token available');
            }
            const token = await authService.refresh({ refresh_token });
            authStorage.setToken(token)
        }
        catch (err: unknown) {
            logout();
            throw err;
        }
        finally {
            setLoading(false);
        }
    }, [authService, authStorage, logout]);

    const authFetch = useCallback(async <T>(apiCall: AuthApiCall<T>, ...data: any[]): Promise<T> => {
        const currentToken = authStorage.getToken()?.access_token;
        if (!currentToken) {
            throw new Error('No access token available');
        }

        try {
            return await apiCall(currentToken, ...data);
        } catch (err: unknown) {
            const isUnauthorized =
                err instanceof Error &&
                (err.message.includes('401') ||
                    err.message.includes('Unauthorized'))

            if (isUnauthorized) {
                await refresh();

                const newToken = authStorage.getToken()?.access_token;
                if (!newToken) {
                    throw new Error('Token refresh failed');
                }
                return await apiCall(newToken, ...data);
            }

            throw err;
        }
    }, [authStorage, refresh]);

    return {
        error,
        loading,
        authorized,

        login,
        logout,
        refresh,
        authFetch,
    };
};
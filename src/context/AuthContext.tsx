import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useServices } from './ServicesContext';
import { getErrorMessage } from '../utils/getErrorMessage';
import { AuthApiCall } from '../types/models/AuthApiCall';
import { ApiError } from '../types/errors/ApiError';

interface AuthContextType {
    error: string | null;
    loading: boolean;
    authorized: boolean;

    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
    authFetch: <T>(apiCall: AuthApiCall<T>, ...args: any[]) => Promise<T>;
    optionalAuthFetch: <T>(apiCall: AuthApiCall<T>, ...args: any[]) => Promise<T>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    const { authService, authStorage } = useServices();

    useEffect(() => {
        setAuthorized(authStorage.hasToken());
        setLoading(false);
    }, []);

    const login = useCallback(
        async (username: string, password: string): Promise<void> => {
            setError(null);
            setLoading(true);
            try {
                const token = await authService.login({ username, password });
                authStorage.setToken(token);
                setAuthorized(true);
            } catch (err: unknown) {
                setError(getErrorMessage(err));
                throw err;
            } finally {
                setLoading(false);
            }
        },
        [authService, authStorage]
    );

    const logout = useCallback(async (): Promise<void> => {
        setError(null);
        setLoading(true);
        try {
            authStorage.clearToken();
            authStorage.clearUser();
            setAuthorized(false);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [authStorage]);

    const refresh = useCallback(async (): Promise<void> => {
        setLoading(true);
        try {
            const refresh_token = authStorage.getToken()?.refresh_token;
            if (!refresh_token) {
                logout()
                return
            }
            const token = await authService.refresh({ refresh_token });
            authStorage.setToken(token);
            setAuthorized(true);
        } catch (err: unknown) {
            authStorage.clearToken();
            setAuthorized(false);
            setError(getErrorMessage(err));
            throw err;
        } finally {
            setLoading(false);
        }
    }, [authService, authStorage]);


    const authFetch = useCallback(async<T extends any>(apiCall: AuthApiCall<T>, ...data: any[]): Promise<T> => {
        const currentToken = authStorage.getToken()?.access_token;
        if (!currentToken) {
            throw new Error('No access token available');
        }

        try {
            setLoading(true)
            return await apiCall(currentToken, ...data);
        } catch (err: unknown) {
            const isUnauthorized = err instanceof ApiError && err.status === 401;

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
        finally{
            setLoading(false)
        }
    },
        [authStorage, refresh]
    );

    const optionalAuthFetch = useCallback(async<T extends any>(apiCall: AuthApiCall<T>, ...data: any[]): Promise<T> => {
        let currentToken = authStorage.getToken()?.access_token;
        if (!currentToken) {
            currentToken = "";
        }

        try {
            setLoading(true)
            return await apiCall(currentToken, ...data);
        } catch (err: unknown) {
            const isUnauthorized = err instanceof ApiError && err.status === 401;

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
        finally{
            setLoading(false)
        }
    },
        [authStorage, refresh]
    );

    const value = {
        error,
        loading,
        authorized,
        login,
        logout,
        refresh,
        authFetch,
        optionalAuthFetch,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
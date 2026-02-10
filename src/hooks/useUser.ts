import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useServices } from "../context/ServicesContext";
import { User } from "../types/models/User";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useUser = () => {
    const { authFetch } = useAuth();
    const { authService } = useServices();
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getCurrentUser = async (): Promise<User | null> => {
        setError(null);
        setLoading(true);

        try {
            const user = await authFetch(authService.getUser);
            return user;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const resendActivationEmail = async (): Promise<void> => {
        setError(null);
        setLoading(true);

        try {
            await authFetch(authService.resendEmail);
        } catch (err: unknown) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    return {
        error,
        loading,
        
        getCurrentUser,
        resendActivationEmail,
    };
};
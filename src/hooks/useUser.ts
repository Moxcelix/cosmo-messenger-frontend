import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useServices } from "../context/ServicesContext";
import { User } from "../types/models/User";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useUser = () => {
    const { authFetch } = useAuth();
    const { authService, authStorage } = useServices();
    const [emailError, setEmailError] = useState<string | null>(null);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [getUserError, setGetUserError] = useState<string | null>(null);
    const [resendError, setResendError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getCurrentUser = async (): Promise<User | null> => {
        const user = authStorage.getUser()
        if (user){
            return user
        }

        return refreshCurrentUser()
    };

    const refreshCurrentUser =  async (): Promise<User | null> => {
        setGetUserError(null);
        setLoading(true);

        try {
            const user = await authFetch(authService.getUser);
            authStorage.setUser(user)
            return user;
        } catch (err: unknown) {
            setGetUserError(getErrorMessage(err));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const resendActivationEmail = async (): Promise<void> => {
        setResendError(null);
        setLoading(true);

        try {
            await authFetch(authService.resendEmail);
        } catch (err: unknown) {
            setResendError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const changeEmail = async (new_email: string): Promise<void> => {
        setEmailError(null);
        setLoading(true);

        try {
            await authFetch(authService.changeEmail, { new_email })
        }
        catch (err: unknown) {
            setEmailError(getErrorMessage(err));
        }
        finally {
            setLoading(false);
        }
    }

    const changePassword = async (new_password: string): Promise<void> => {
        setPasswordError(null);
        setLoading(true);

        try {
            await authFetch(authService.changePassword, { new_password })
        }
        catch (err: unknown) {
            setPasswordError(getErrorMessage(err));
        }
        finally {
            setLoading(false);
        }
    }

    const changeUsername = async (new_username: string): Promise<void> => {
        setUsernameError(null);
        setLoading(true);

        try {
            await authFetch(authService.changeUsername, { new_username })
            await refreshCurrentUser()
        }
        catch (err: unknown) {
            setUsernameError(getErrorMessage(err));
        }
        finally {
            setLoading(false);
        }
    }

    const deleteUser = async (): Promise<void> => {
        setDeleteError(null);
        setLoading(true);

        try {
            await authFetch(authService.deleteUser)
            authStorage.clearUser()
        }
        catch (err: unknown) {
            setDeleteError(getErrorMessage(err));
        }
        finally {
            setLoading(false);
        }
    }

    const resetAllErrors = () => {
        setEmailError(null);
        setUsernameError(null);
        setPasswordError(null);
        setDeleteError(null);
        setGetUserError(null);
        setResendError(null);
    }

    return {
        emailError,
        usernameError,
        passwordError,
        deleteError,
        getUserError,
        resendError,

        error: emailError || usernameError || passwordError || deleteError || getUserError || resendError,
        loading,

        changeEmail,
        changePassword,
        changeUsername,
        getCurrentUser,
        refreshCurrentUser,
        resendActivationEmail,
        deleteUser,
        resetAllErrors,
    };
};
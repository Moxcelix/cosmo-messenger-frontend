import { useState } from "react";
import { Profile } from "../types/models/Profile";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useServices } from "../context/ServicesContext";

export const useProfile = () => {
    const { authFetch } = useAuth();
    const { socialService } = useServices();

    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const getCurrentProfile = async (): Promise<Profile | null> => {
        setError(null);
        setLoading(true);

        try {
            const profile = await authFetch(socialService.profileMe);
            return profile;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const getUserProfile = async (username: string): Promise<Profile | null> => {
        setError(null);
        setLoading(true);

        try {
            const profile = await authFetch(socialService.profileUser, username);
            return profile;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setLoading(false);
        }
    };

    return {
        error,
        loading,

        getCurrentProfile,
        getUserProfile,
    }
}
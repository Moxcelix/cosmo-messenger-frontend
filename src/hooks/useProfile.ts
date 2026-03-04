import { useState } from "react";
import { Profile } from "../types/models/Profile";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/getErrorMessage";
import { useServices } from "../context/ServicesContext";

export const useProfile = () => {
    const { optionalAuthFetch, authFetch } = useAuth();
    const { socialService } = useServices();

    const [error, setError] = useState<string | null>(null);
    const [bioError, setBioError] = useState<string | null>(null);
    const [displayNameError, setDisplayNameError] = useState<string | null>(null);
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
            const profile = await optionalAuthFetch(socialService.profileUser, username);
            return profile;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setLoading(false);
        }
    };

    const changeBio = async (new_bio: string): Promise<void> => {
        setBioError(null);
        setLoading(true);

        try {
            await authFetch(socialService.changeBio, { new_bio })
        }
        catch (err: unknown) {
            setBioError(getErrorMessage(err));
        }
        finally {
            setLoading(false);
        }
    };

    const changeDisplayName = async (new_display_name: string): Promise<void> => {
        setDisplayNameError(null);
        setLoading(true);

        try {
            await authFetch(socialService.changeDisplayName, { new_display_name })
        }
        catch (err: unknown) {
            setDisplayNameError(getErrorMessage(err));
        }
        finally {
            setLoading(false);
        }
    };

    const resetAllErrors = () => {
        setError(null);
        setBioError(null);
        setDisplayNameError(null);
    }


    return {
        error,
        bioError,
        displayNameError,
        loading,

        getCurrentProfile,
        getUserProfile,
        changeBio,
        changeDisplayName,
        resetAllErrors,
    }
}
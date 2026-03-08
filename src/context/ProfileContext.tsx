import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Profile } from '../types/models/Profile';
import { useAuth } from './AuthContext';
import { useServices } from './ServicesContext';
import { FileMeta } from '../types/models/FileMeta';
import { getErrorMessage } from '../utils/getErrorMessage';

interface ProfileContextType {
    profile: Profile | null;
    error: string | null;
    bioError: string | null;
    displayNameError: string | null;
    avatarError: string | null;
    loading: boolean;

    setProfile: (profile: Profile | null) => void;
    getCurrentProfile: () => Promise<Profile | null>;
    getUserProfile: (username: string) => Promise<Profile | null>;
    changeBio: (new_bio: string) => Promise<void>;
    changeDisplayName: (new_display_name: string) => Promise<void>;
    changeAvatar: (new_avatar: File) => Promise<FileMeta | undefined>;
    resetAllErrors: () => void;
    updateAvatar: (avatarUrl: string) => void;
    updateUsername: (username: string) => void;
    updateEmail: (email: string) => void;
    updateActive: (is_active: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { authorized, loading: authLoading, optionalAuthFetch, authFetch } = useAuth();
    const { socialService, fileService } = useServices();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [bioError, setBioError] = useState<string | null>(null);
    const [avatarError, setAvatarError] = useState<string | null>(null);
    const [displayNameError, setDisplayNameError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (authorized) {
                setLoading(true);
                try {
                    const profileData = await authFetch(socialService.profileMe);
                    setProfile(profileData);
                } catch (err) {
                    console.error('Failed to load profile:', err);
                    setError(getErrorMessage(err));
                } finally {
                    setLoading(false);
                }
            }
            else {
                setProfile(null);
            }
        };

        loadProfile();
    }, [authorized]);

    useEffect(() => {

    }, [])

    const resetAllErrors = useCallback(() => {
        setError(null);
        setBioError(null);
        setDisplayNameError(null);
        setAvatarError(null);
    }, []);

    const getCurrentProfile = useCallback(async (): Promise<Profile | null> => {
        setError(null);
        setLoading(true);

        try {
            const profileData = await authFetch(socialService.profileMe);
            setProfile(profileData);
            return profileData;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setLoading(false);
        }
    }, [authFetch, socialService.profileMe]);

    const getUserProfile = useCallback(async (username: string): Promise<Profile | null> => {
        setError(null);
        setLoading(true);

        try {
            const profileData = await optionalAuthFetch(socialService.profileUser, username);
            return profileData;
        } catch (err: unknown) {
            setError(getErrorMessage(err));
            return null;
        } finally {
            setLoading(false);
        }
    }, [optionalAuthFetch, socialService.profileUser]);

    const changeBio = useCallback(async (new_bio: string): Promise<void> => {
        setBioError(null);
        setLoading(true);

        try {
            await authFetch(socialService.changeBio, { new_bio });

            setProfile(prev => prev ? { ...prev, bio: new_bio } : null);
        } catch (err: unknown) {
            setBioError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [authFetch, socialService.changeBio]);

    const changeDisplayName = useCallback(async (new_display_name: string): Promise<void> => {
        setDisplayNameError(null);
        setLoading(true);

        try {
            await authFetch(socialService.changeDisplayName, { new_display_name });

            setProfile(prev => prev ? { ...prev, display_name: new_display_name } : null);
        } catch (err: unknown) {
            setDisplayNameError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }, [authFetch, socialService.changeDisplayName]);

    const changeAvatar = useCallback(async (new_avatar: File): Promise<FileMeta | undefined> => {
        setAvatarError(null);
        setLoading(true);

        try {
            const meta = await authFetch(fileService.uploadAvatar, new_avatar);

            const avatarUrl = `/api/v2/file/${meta?.directory}/${meta?.file_name}`;

            setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);

            return meta;
        } catch (err: unknown) {
            setAvatarError(getErrorMessage(err));
            return undefined;
        } finally {
            setLoading(false);
        }
    }, [authFetch, fileService.uploadAvatar]);

    const updateUsername = useCallback((username: string) => {
        setProfile(prev => prev ? { ...prev, username: username } : null);
    }, [])

    const updateEmail = useCallback((email: string) => {
        setProfile(prev => prev ? { ...prev, email: email } : null);
    }, [])

    const updateActive = useCallback((is_active: boolean) => {
        setProfile(prev => prev ? { ...prev, is_active: is_active } : null);
    }, [])

    const updateAvatar = useCallback((avatarUrl: string) => {
        setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : null);
    }, []);

    const value = {
        profile,
        error,
        bioError,
        displayNameError,
        avatarError,
        loading,

        setProfile,
        getCurrentProfile,
        getUserProfile,
        changeBio,
        changeDisplayName,
        changeAvatar,
        resetAllErrors,
        updateAvatar,
        updateUsername,
        updateEmail,
        updateActive
    };

    return (
        <ProfileContext.Provider value={value}>
            {children}
        </ProfileContext.Provider>
    );
};

export const useProfile = () => {
    const context = useContext(ProfileContext);
    if (context === undefined) {
        throw new Error('useProfile must be used within a ProfileProvider');
    }
    return context;
};
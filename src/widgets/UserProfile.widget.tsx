import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { User } from '../types/models/User';
import { SettingsIcon } from '../components/Icons';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useProfile } from '../hooks/useProfile';
import { Profile } from '../types/models/Profile';

interface UserAccountProps {
    username?: string;
    onLogout?: () => void;
    onEmailResent?: () => void;
}

export const UserProfile = ({ username, onLogout, onEmailResent }: UserAccountProps) => {
    const navigate = useNavigate();
    const { authorized, logout, loading: authLoading } = useAuth();
    const { getCurrentUser, resendActivationEmail, error: userError, loading: userLoading } = useUser();
    const { getUserProfile, error: profileError, loading: profileLoading } = useProfile();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [resending, setResending] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    const loading = authLoading || userLoading || logoutLoading;

    useEffect(() => {
        if (!profileLoading) {
            if (username) {
                getUserProfile(username).then(setProfile).catch(console.error);
            }
        }
        if (!userLoading) {
            getCurrentUser().then(setUser).catch(console.error)
        }
    }, [authorized, username]);

    const handleResend = async () => {
        setResending(true);
        try {
            await resendActivationEmail();
            alert('Письмо отправлено повторно! Проверьте ваш почтовый ящик.');
            onEmailResent?.();
        } catch (err) {
            console.error('Ошибка при повторной отправке:', err);
        } finally {
            setResending(false);
        }
    };

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await logout();
            onLogout?.();
        } catch (err) {
            console.error('Ошибка при выходе:', err);
        } finally {
            setLogoutLoading(false);
        }
    };

    const handleSettingsClick = () => {
        navigate('/new/settings');
    };

    if (loading && !profile) {
        return (
            <LoadingSpinner />
        );
    }

    if (!profile) {
        return (
            <div className="rounded-lg bg-red-50 p-6 border border-red-200">
                <div className="flex items-start">
                    <svg className="w-6 h-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="text-lg font-medium text-red-800 mb-1">Ошибка загрузки</h3>
                        <p className="text-red-700">Не удалось загрузить данные пользователя. Пожалуйста, попробуйте позже.</p>
                    </div>
                </div>
            </div>
        );
    }

    const isMine = profile?.user_id == user?.id

    return (
        <div className="bg-white w-full">
            <div className="flex items-center justify-between mb-6">
                <div
                    className="flex items-center gap-3 group"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    {isMine && (
                        <h2 className="text-2xl font-bold text-gray-800">Мой профиль</h2>
                        )}

                    {/* Кнопка настроек с анимацией появления */}
                    <button
                        onClick={handleSettingsClick}
                        className={`
                            p-2 rounded-lg transition-all duration-200
                            ${isHovering
                                ? 'opacity-100 bg-gray-100 hover:bg-gray-200'
                                : 'opacity-0 pointer-events-none'
                            }
                            text-gray-600 hover:text-gray-800
                        `}
                        aria-label="Настройки"
                    >
                        <SettingsIcon />
                    </button>
                </div>

                <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {profile.username.charAt(0).toUpperCase()}
                    </div>
                    {profile.is_active && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                </div>
            </div>

            <div className="space-y-4 mb-6">
                <div className="pb-4 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Имя пользователя</label>
                    <div className="text-lg font-semibold text-gray-800">{profile.username}</div>
                </div>

                {profile.email && (<div className="pb-4 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email
                        {isMine && (profile.is_active ? (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Подтверждён
                            </span>
                        ) : (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Не подтверждён
                            </span>
                        ))}
                    </label>
                    <div className="text-lg font-semibold text-gray-800 flex items-center">
                        {profile.email}
                    </div>
                </div>)}

                {profile.created_at && (
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Дата регистрации</label>
                        <div className="text-gray-700">
                            {new Date(profile.created_at).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                )}
            </div>

            {isMine && !profile.is_active && (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <h4 className="font-medium text-yellow-800 mb-1">Требуется подтверждение email</h4>
                            <p className="text-yellow-700 text-sm mb-3">
                                Пожалуйста, проверьте вашу почту и перейдите по ссылке в письме для активации аккаунта.
                            </p>
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-300 text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                {resending ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Отправка...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Отправить письмо повторно
                                    </>
                                )}
                            </button>

                            {userError && (
                                <p className="mt-2 text-red-600 text-sm">
                                    {userError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isMine && (<div className="pt-4 border-t border-gray-200">
                <div className="mt-4 text-center text-sm text-gray-500">
                    <p>
                        Нужна помощь?{' '}
                        <a
                            href="/support"
                            className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Служба поддержки
                        </a>
                    </p>
                </div>
            </div>)}
        </div>
    );
};
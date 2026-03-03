import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ProfileIcon, LogoutIcon, SettingsIcon } from "../components/Icons";
import { useProfile } from "../hooks/useProfile";
import { Profile } from "../types/models/Profile";
import { useUser } from "../hooks/useUser";

export const NavigationPanel = () => {
    const { logout, authorized } = useAuth();
    const { getCurrentUser } = useUser();
    const { getCurrentProfile } = useProfile();
    const navigate = useNavigate();
    const location = useLocation();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Закрытие меню при клике вне его
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Загрузка данных пользователя
    useEffect(() => {
        if (authorized) {
            getCurrentProfile().then(setProfile);
        }
    }, [authorized]);

    // Определяем, находимся ли мы не в чатах (показываем кнопку назад)
    const isNotChats = !location.pathname.includes('/new/chats');

    const handleBack = () => {
        navigate('/new/chats');
    };

    const handleProfileClick = async () => {
        setIsMenuOpen(false);
        const user = await getCurrentUser();
        navigate(`/new/profile/${user?.username}`);
    };

    const handleSettingsClick = () => {
        setIsMenuOpen(false);
        navigate('/new/settings');
    };

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await logout();
        navigate('/new/login');
    };

    if (!authorized) {
        return null;
    }

    return (
        <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Левая часть: кнопка назад и логотип */}
                    <div className="flex items-center gap-4">
                        {isNotChats && (
                            <button
                                onClick={handleBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Назад"
                            >
                                <svg
                                    className="w-5 h-5 text-gray-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 19l-7-7 7-7"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Правая часть: аватар пользователя */}
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-2 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
                                {profile?.username ? profile.username[0].toUpperCase() : 'U'}
                            </div>
                            <svg
                                className={`w-4 h-4 text-gray-600 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* Контекстное меню */}
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-3 w-56 bg-white  shadow-lg border border-gray-200 py-1 z-50">
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">
                                        {profile?.username || 'Пользователь'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {profile?.email || ''}
                                    </p>
                                </div>

                                <button
                                    onClick={handleProfileClick}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                >
                                    <ProfileIcon />
                                    Профиль
                                </button>

                                <button
                                    onClick={handleSettingsClick}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                >
                                    <SettingsIcon />
                                    Настройки
                                </button>

                                <div className="border-t border-gray-100 my-1"></div>

                                <button
                                    onClick={handleLogout}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 flex items-center gap-3"
                                >
                                    <LogoutIcon />
                                    Выйти
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
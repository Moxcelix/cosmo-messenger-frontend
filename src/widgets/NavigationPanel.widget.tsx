import { redirect, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const NavigationPanel = () => {
    const { logout, authorized } = useAuth();
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate("/new/profile")
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!authorized) {
        //console.log("aboba")
        //redirect('/new/login');
    }

    return (
        <div className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Лого/Название */}
                    <div className="flex-shrink-0">
                        <h1 className="text-xl font-bold text-gray-800">Cosmo Messenger</h1>
                    </div>

                    {/* Навигационные кнопки */}
                    <div className="flex items-center space-x-4">
                        {/* Кнопка Профиль */}
                        <button
                            onClick={handleProfileClick}
                            className="px-4 py-2 text-sm font-medium text-gray-500 bg-gray-100 rounded-lg "
                        >
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                Профиль
                            </div>
                        </button>

                        {/* Кнопка Выйти */}
                        <button
                            onClick={handleLogout}
                            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center"
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Выйти
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
import { useEffect, useState } from "react";
import { redirect, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { NavButton } from "../components/NavButton";
import { ProfileIcon, ChatsIcon, LogoutIcon } from "../components/Icons";

export type NavigationTab = "chats" | "profile";

export const NavigationPanel = () => {
    const { logout, authorized } = useAuth();
    const navigate = useNavigate();

    // Получаем текущий активный таб из URL
    const getActiveTabFromPath = (): NavigationTab => {
        const path = window.location.pathname;
        if (path.includes("/new/profile")) return "profile";
        return "chats"; // по умолчанию
    };

    const [activeTab, setActiveTab] = useState<NavigationTab>(getActiveTabFromPath());

    // Обновляем активный таб при изменении пути
    useEffect(() => {
        setActiveTab(getActiveTabFromPath());
    }, [window.location.pathname]);

    const handleChatsClick = () => {
        setActiveTab("chats");
        navigate("/new/chats");
    };

    const handleProfileClick = () => {
        setActiveTab("profile");
        navigate("/new/profile");
    };

    if (!authorized) {
        // Перенаправление на страницу логина
        // redirect('/new/login');
    }

    return (
        <div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">

                    {/* Контейнер для навигационных кнопок */}
                    <div className="absolute left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center space-x-4">
                            <NavButton
                                onClick={handleChatsClick}
                                icon={<ChatsIcon />}
                                isActive={activeTab === "chats"}
                                className="min-w-[120px] justify-center"
                            >
                                Чаты
                            </NavButton>

                            <NavButton
                                onClick={handleProfileClick}
                                icon={<ProfileIcon />}
                                isActive={activeTab === "profile"}
                                className="min-w-[120px] justify-center"
                            >
                                Профиль
                            </NavButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useActivate } from "../hooks/useActivate";
import { translateAuthError } from "../utils/translateAuthError";

export const ActivationWidget = () => {
    const { status, message, loading } = useActivate();
    const navigate = useNavigate();
    const [progress, setProgress] = useState(10);
    const progressInterval = useRef<number | null>(null);

    useEffect(() => {
        if (status === 'success') {
            let currentProgress = 10;
            progressInterval.current = setInterval(() => {
                currentProgress -= 1;
                setProgress(currentProgress);

                if (currentProgress < 0) {
                    if (progressInterval.current) {
                        clearInterval(progressInterval.current);
                    }
                    navigate('/new/chats');
                }
            }, 1000);

            return () => {
                if (progressInterval.current) {
                    clearInterval(progressInterval.current);
                }
            };
        }
    }, [status, navigate]);

    useEffect(() => {
        return () => {
            if (progressInterval.current) {
                clearInterval(progressInterval.current);
            }
        };
    }, []);

    const renderContent = () => {
        switch (status) {
            case 'loading':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-center">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                                Подтверждение аккаунта
                            </h2>
                            <p className="text-gray-600 text-center">
                                Проверяем вашу ссылку активации...
                            </p>
                        </div>
                    </div>
                );

            case 'success':
                return (
                    <div className="space-y-8">
                        <div className="text-center">
                            <div className="relative inline-block">
                                <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <div className="absolute -top-2 -right-2">
                                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                                        <div className="w-6 h-6 bg-yellow-400 rounded-full animate-ping"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold text-gray-800 text-center">
                                Поздравляем!
                            </h2>
                            <p className="text-gray-600 text-center text-lg">
                                Ваш аккаунт успешно активирован.
                            </p>
                            <p className="text-gray-500 text-center text-sm">
                                Сейчас вы будете перенаправлены в ваш профиль.
                            </p>
                        </div>

                        {/* Прогресс-бар */}
                        <div className="space-y-3">
                            <div className="flex justify-center mb-2">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-gray-800 mb-1">
                                        {Math.max(0, progress)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                onClick={() => navigate('/new/chats')}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium rounded-lg transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
                            >
                                Перейти в профиль сейчас
                            </button>
                        </div>
                    </div>
                );

            case 'error':
                const translatedError = translateAuthError(message);

                return (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ошибка активации</h2>
                        <p className="text-gray-600 mb-6">{translatedError}</p>

                        <div className="space-y-4 mt-8">
                            <button
                                onClick={() => window.location.href = '/new/login'}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm hover:shadow"
                            >
                                Перейти к входу
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                Попробовать снова
                            </button>
                        </div>
                    </div>
                );

            case 'invalid':
                return (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.308 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Недействительная ссылка</h2>
                        <p className="text-gray-600 mb-6">Ссылка активации не содержит токена или имеет неверный формат.</p>

                        <div className="space-y-4">
                            <button
                                onClick={() => navigate('/new/login')}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                            >
                                Войти в аккаунт
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (

        <div>
            <div className="p-8">
                {renderContent()}
            </div>
        </div>
    );
};
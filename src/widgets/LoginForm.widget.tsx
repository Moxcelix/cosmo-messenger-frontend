import { useState } from 'react';
import { translateAuthError } from '../utils/translateAuthError';
import { useAuth } from '../context/AuthContext';

interface LoginFormProps {
    onSuccess?: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, error } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(username, password);
            if (!error) {
                onSuccess?.();
            }
        } catch (err) {
            console.log(err);
        }
    };

    const hasUsername = username.length > 0;

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
                Вход в Cosmo
            </h1>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Ошибка входа</h3>
                            <div className="mt-1 text-sm text-red-700">
                                <p>{translateAuthError(error)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Имя пользователя или Email *
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Введите имя пользователя или email"
                        required
                        autoComplete="off"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Пароль *
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Введите пароль"
                        required
                        autoComplete="off"
                    />
                    <div className="mt-2 text-right">
                        <a
                            href="/forgot-password"
                            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
                        >
                            Забыли пароль?
                        </a>
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Вход...
                            </>
                        ) : 'Войти'}
                    </button>
                </div>

            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
                <p>
                    Нет аккаунта?{' '}
                    <a href="/new/register" className="text-blue-600 hover:text-blue-700 font-medium">
                        Зарегистрироваться
                    </a>
                </p>
            </div>
        </div>
    );
};
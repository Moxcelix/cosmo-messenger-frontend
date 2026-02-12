import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../context/AuthContext';
import { translateAuthError } from '../utils/translateAuthError';
import { EditIcon } from '../components/Icons';
import { User } from '../types/models/User';
import { LoadingSpinner } from '../components/LoadingSpinner';

interface SettingsWidgetProps {
    onCancel?: () => void;
    onSave?: () => void;
}

type EditableField = 'email' | 'login' | null;

export const SettingsWidget = ({ onCancel, onSave }: SettingsWidgetProps) => {
    const { changeEmail, getCurrentUser, error: apiError, loading: userLoading } = useUser();
    const { authorized, loading: authLoading } = useAuth();

    const [user, setUser] = useState<User | null>(null);
    const [editingField, setEditingField] = useState<EditableField>(null);
    const [emailValue, setEmailValue] = useState('');
    const [loginValue, setLoginValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [emailError, setEmailError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    const loading = authLoading || userLoading;

    useEffect(() => {
        if (authorized && !userLoading) {
            getCurrentUser().then(setUser).catch(console.error);
        }
    }, [authorized]);

    // Инициализация значений при загрузке пользователя
    useEffect(() => {
        if (user) {
            setEmailValue(user.email);
            setLoginValue(user.username);
        }
    }, [user]);

    // Отслеживание изменений
    useEffect(() => {
        if (user) {
            const emailChanged = emailValue !== user.email;
            const loginChanged = loginValue !== user.username;
            const passwordChanged = passwordValue !== '';

            setHasChanges(emailChanged || loginChanged || passwordChanged);
        }
    }, [emailValue, loginValue, passwordValue, user]);

    // Обработка ошибок API
    useEffect(() => {
        if (apiError) {
            setSaveError(translateAuthError(apiError));
        }
    }, [apiError]);

    const validateEmail = (email: string): boolean => {
        const isValid = email.includes('@');
        if (!isValid) {
            setEmailError('Email должен содержать символ @');
        } else {
            setEmailError(null);
        }
        return isValid;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmailValue(value);
        validateEmail(value);
    };

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginValue(e.target.value);
    };

    const handleEditClick = (field: EditableField) => {
        setEditingField(field);
        setEmailError(null);
        setSaveError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: EditableField) => {
        if (e.key === 'Enter') {
            setEditingField(null);
        }
        if (e.key === 'Escape') {
            // Отмена изменений
            if (field === 'email' && user) {
                setEmailValue(user.email);
            }
            if (field === 'login' && user) {
                setLoginValue(user.username);
            }

            setEditingField(null);
            setEmailError(null);
            setSaveError(null);
        }
    };

    const handleBlur = (field: EditableField) => {
        // Возвращаем исходное значение, если поле пустое или невалидное
        if (field === 'email' && user) {
            if (!emailValue || !validateEmail(emailValue)) {
                setEmailValue(user.email);
                setEmailError(null);
            }
        }
        if (field === 'login' && user) {
            if (!loginValue) {
                setLoginValue(user.username);
            }
        }

        setEditingField(null);
    };

    const handleSave = async () => {
        setSaveError(null);

        // Валидация email перед сохранением
        if (!validateEmail(emailValue)) {
            return;
        }

        try {
            // Сохраняем только измененные поля
            if (emailValue !== user?.email) {
                await changeEmail(emailValue);
            }

            // Здесь будут вызовы для смены логина и пароля
            // if (loginValue !== user?.username) {
            //     await changeUsername(loginValue);
            // }

            // if (passwordValue) {
            //     await changePassword(passwordValue);
            // }

            // Очищаем поле пароля после сохранения
            setPasswordValue('');
            setEditingField(null);
            onSave?.();
        } catch (err) {
            console.error('Ошибка сохранения:', err);
        }
    };

    const handleCancel = () => {
        // Восстанавливаем исходные значения
        if (user) {
            setEmailValue(user.email);
            setLoginValue(user.username);
        }
        setPasswordValue('');
        setEditingField(null);
        setEmailError(null);
        setSaveError(null);
        onCancel?.();
    };

    if (!user) {
        return (
            <LoadingSpinner />
        );
    }

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Настройки</h2>

            <div className="space-y-6">
                {/* Логин */}
                <div className="pb-4 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Логин
                    </label>
                    <div className="flex items-center justify-between group">
                        {editingField === 'login' ? (
                            <input
                                type="text"
                                value={loginValue}
                                onChange={handleLoginChange}
                                onKeyDown={(e) => handleKeyDown(e, 'login')}
                                onBlur={() => handleBlur('login')}
                                className="flex-1 text-lg text-gray-800 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                autoFocus
                                placeholder="Введите логин"
                            />
                        ) : (
                            <div className="flex-1 text-lg font-semibold text-gray-800">
                                {loginValue}
                            </div>
                        )}
                        <button
                            onClick={() => handleEditClick('login')}
                            className="ml-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Редактировать логин"
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Минимум 3 символа, только латиница и цифры
                    </p>
                </div>

                {/* Email */}
                <div className="pb-4 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email
                        {!user.is_active && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Не подтверждён
                            </span>
                        )}
                    </label>
                    <div className="flex items-center justify-between group">
                        {editingField === 'email' ? (
                            <div className="flex-1">
                                <input
                                    type="email"
                                    value={emailValue}
                                    onChange={handleEmailChange}
                                    onKeyDown={(e) => handleKeyDown(e, 'email')}
                                    onBlur={() => handleBlur('email')}
                                    className={`w-full text-lg text-gray-800 bg-gray-50 border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${emailError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    autoFocus
                                    placeholder="Введите email"
                                />
                                {emailError && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {emailError}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1">
                                <div className="text-lg font-semibold text-gray-800">
                                    {emailValue}
                                </div>
                                {!user.is_active && (
                                    <p className="text-xs text-yellow-600 mt-1">
                                        Подтвердите email, чтобы активировать аккаунт
                                    </p>
                                )}
                            </div>
                        )}
                        <button
                            onClick={() => handleEditClick('email')}
                            className="ml-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Редактировать email"
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Пароль */}
                <div className="pb-4 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Пароль
                    </label>
                    <div className="flex items-center justify-between group">

                        <div className="flex-1 text-lg font-semibold text-gray-800">
                            ••••••••
                        </div>

                        <button
                            // onClick={() => handleEditClick('password')}
                            className="ml-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Изменить пароль"
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Минимум 8 символов, заглавные и строчные буквы, цифры, спецсимволы
                    </p>
                </div>
            </div>

            {/* Ошибка сохранения */}
            {saveError && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">
                        {saveError}
                    </p>
                </div>
            )}

            {/* Кнопки действий */}
            <div className="mt-8 grid grid-cols-2 gap-4">
                <button
                    onClick={handleSave}
                    disabled={!hasChanges || loading || !!emailError}
                    className={`
                        flex-1 px-6 py-2.5 rounded-lg font-medium transition-all
                        ${hasChanges && !loading && !emailError
                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    {loading ? 'Сохранение...' : 'Сохранить'}
                </button>

                <button
                    onClick={handleCancel}
                    disabled={!hasChanges || loading}
                    className={`
                        px-6 py-2.5 rounded-lg font-medium border transition-all
                        ${hasChanges && !loading
                            ? 'border-gray-300 hover:bg-gray-50 text-gray-700'
                            : 'border-gray-200 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    Отменить
                </button>
            </div>
        </div>
    );
};
import { useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../context/AuthContext';
import { translateAuthError } from '../utils/translateAuthError';
import { EditIcon } from '../components/Icons';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ChangePasswordModal } from '../components/ChangePassword.modal';
import { DeleteAccountModal } from '../components/DeleteAccount.modal';
import { useProfile } from '../context/ProfileContext';
import { Profile } from '../types/models/Profile';

interface SettingsWidgetProps {
    onCancel?: () => void;
    onSave?: () => void;
}

type EditableField = 'email' | 'login' | null;

export const SettingsWidget = ({ onCancel, onSave }: SettingsWidgetProps) => {
    const {
        changeUsername,
        changeEmail,
        resetAllErrors,
        emailError,
        usernameError,
        loading: userLoading
    } = useUser();
    const { authorized, loading: authLoading } = useAuth();
    const { profile, error: profileError, loading: profileLoading, updateUsername, updateEmail } = useProfile()

    const [editingField, setEditingField] = useState<EditableField>(null);
    const [emailValue, setEmailValue] = useState('');
    const [loginValue, setLoginValue] = useState('');
    const [passwordValue, setPasswordValue] = useState('');
    const [emailFormatError, setEmailFormatError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const loading = authLoading || userLoading || profileLoading;

    // Инициализация значений при загрузке пользователя
    useEffect(() => {
        if (profile) {
            setEmailValue(profile.email);
            setLoginValue(profile.username);
        }
    }, [profile]);

    // Отслеживание изменений
    useEffect(() => {
        if (profile) {
            const emailChanged = emailValue !== profile.email;
            const loginChanged = loginValue !== profile.username;
            const passwordChanged = passwordValue !== '';

            setHasChanges(emailChanged || loginChanged || passwordChanged);
        }
    }, [emailValue, loginValue, passwordValue, profile]);

    // Обработка ошибок от API
    useEffect(() => {
        if (emailError) {
            setSaveError(translateAuthError(emailError));
        }
    }, [emailError]);

    useEffect(() => {
        if (usernameError) {
            setSaveError(translateAuthError(usernameError));
        }
    }, [usernameError]);

    const validateEmailFormat = (email: string): boolean => {
        const isValid = email.includes('@');
        if (!isValid) {
            setEmailFormatError('Email должен содержать символ @');
        } else {
            setEmailFormatError(null);
        }
        return isValid;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmailValue(value);
        validateEmailFormat(value);
        // Очищаем ошибку сохранения при редактировании
        setSaveError(null);
    };

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginValue(e.target.value);
        setSaveError(null);
    };

    const handleEditClick = (field: EditableField) => {
        setEditingField(field);
        setEmailFormatError(null);
        setSaveError(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, field: EditableField) => {
        if (e.key === 'Enter') {
            setEditingField(null);
        }
        if (e.key === 'Escape') {
            // Отмена изменений
            if (field === 'email' && profile) {
                setEmailValue(profile.email);
            }
            if (field === 'login' && profile) {
                setLoginValue(profile.username);
            }

            setEditingField(null);
            setEmailFormatError(null);
            setSaveError(null);
        }
    };

    const handleBlur = (field: EditableField) => {
        // Возвращаем исходное значение, если поле пустое или невалидное
        if (field === 'email' && profile) {
            if (!emailValue || !validateEmailFormat(emailValue)) {
                setEmailValue(profile.email);
                setEmailFormatError(null);
            }
        }
        if (field === 'login' && profile) {
            if (!loginValue) {
                setLoginValue(profile.username);
            }
        }

        setEditingField(null);
    };

    const handleSave = async () => {
        setSaveError(null);

        // Валидация email перед сохранением
        if (!validateEmailFormat(emailValue)) {
            return;
        }

        try {
            // Сохраняем email отдельно и проверяем ошибку
            if (emailValue !== profile?.email) {
                await changeEmail(emailValue);
                updateEmail(emailValue)
            }

            // Сохраняем логин отдельно и проверяем ошибку
            if (loginValue !== profile?.username) {
                await changeUsername(loginValue);
                updateUsername(loginValue)
            }

            setEditingField(null);
            onSave?.();

        } catch (err) {
            console.error('Ошибка сохранения:', err);
            // Ошибки уже будут обработаны через emailError/usernameError
        }
    };

    const handleCancel = () => {
        // Восстанавливаем исходные значения
        if (profile) {
            setEmailValue(profile.email);
            setLoginValue(profile.username);
        }
        setPasswordValue('');
        setEditingField(null);
        setEmailFormatError(null);
        setSaveError(null);
        onCancel?.();
    };

    if (!profile) {
        return <LoadingSpinner />;
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
                </div>

                {/* Email */}
                <div className="pb-4 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email
                        {!profile.is_active && (
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
                                    className={`w-full text-lg text-gray-800 bg-gray-50 border rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${emailFormatError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                        }`}
                                    autoFocus
                                    placeholder="Введите email"
                                />
                                {emailFormatError && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {emailFormatError}
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="flex-1">
                                <div className="text-lg font-semibold text-gray-800">
                                    {emailValue}
                                </div>
                                {!profile.is_active && (
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
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="ml-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Изменить пароль"
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                    </div>
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
                    disabled={!hasChanges || loading || !!emailFormatError}
                    className={`
                        flex-1 px-6 py-2.5 rounded-lg font-medium transition-all
                        ${hasChanges && !loading && !emailFormatError
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

            <div className="mt-4 grid grid-cols-1 gap-4">
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    disabled={loading}
                    className={`
                        px-6 py-2.5 rounded-lg font-medium border transition-all
                        ${!loading
                            ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }
                    `}
                >
                    Удалить аккаунт
                </button>
            </div>

            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onSuccess={() => { }}
            />

            <DeleteAccountModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </div>
    );
};
import { useState, useCallback } from 'react';
import { useRegister } from '../hooks/useRegister';
import { useUser } from '../hooks/useUser';
import { translateAuthError } from '../utils/translateAuthError';
import PasswordInput from '../components/PasswordInput';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const ChangePasswordModal = ({ isOpen, onClose, onSuccess }: ChangePasswordModalProps) => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isChecked, setIsChecked] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { validatePassword, setPasswordError, passwordError, loading: passwordLoading } = useRegister();
    const { changePassword, error: apiError, loading: userLoading } = useUser();

    const loading = passwordLoading || userLoading || isSubmitting;

    const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value);
        // Сбрасываем проверку при изменении пароля
        setIsChecked(false);
        setPasswordError(null);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const handlePasswordBlur = useCallback(async () => {
        if (!newPassword) return;

        try {
            setIsChecked(true);
            await validatePassword(newPassword);
        } catch (err: unknown) {
            console.log(err);
        }
    }, [newPassword, validatePassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword) {
            setPasswordError('Введите новый пароль');
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError('Пароли не совпадают');
            return;
        }

        try {
            await validatePassword(newPassword);
        } catch (err: unknown) {
            return;
        }

        setIsSubmitting(true);
        try {
            await changePassword(newPassword);
            // Очищаем форму
            setNewPassword('');
            setConfirmPassword('');
            setIsChecked(false);
            setPasswordError(null);
            onSuccess?.();
            onClose();
        } catch (err: unknown) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        
        // Очищаем форму при закрытии
        setNewPassword('');
        setConfirmPassword('');
        setIsChecked(false);
        setPasswordError(null);
        onClose();
    };

    const passwordsMatch = newPassword === confirmPassword;
    const hasConfirmPassword = confirmPassword.length > 0;
    const hasNewPassword = newPassword.length > 0;
    const noErrors = passwordError == null;
    const showValidation = newPassword !== '' && isChecked;
    const passwordNotEmpty = newPassword !== '';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Оверлей */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleClose}
            />

            {/* Модалка */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                    {/* Заголовок */}
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            Смена пароля
                        </h2>
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="text-gray-400 hover:text-gray-600 disabled:text-gray-300 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Ошибка API */}
                    {apiError && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Ошибка при смене пароля</h3>
                                    <div className="mt-1 text-sm text-red-700">
                                        <p>{translateAuthError(apiError)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                        

                        {/* Новый пароль */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Новый пароль *
                            </label>
                            <PasswordInput
                                name="newPassword"
                                value={newPassword}
                                onChange={handleNewPasswordChange}
                                onBlur={handlePasswordBlur}
                                placeholder="Введите новый пароль"
                                isValid={passwordError == null}
                                showValidation={showValidation}
                                required={true}
                                hasValue={hasNewPassword}
                                autoComplete="new-password"
                            />
                            {passwordError && (
                                <p className="text-red-500 text-sm mt-2">
                                    {translateAuthError(passwordError)}
                                </p>
                            )}
                            {showValidation && noErrors && (
                                <p className="text-green-500 text-sm mt-2">
                                    ✓ Пароль соответствует требованиям
                                </p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                                Минимум 8 символов, включая заглавные буквы, цифры и специальные символы
                            </p>
                        </div>

                        {/* Подтверждение нового пароля */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Подтверждение пароля *
                            </label>
                            <PasswordInput
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                onBlur={() => {}}
                                placeholder="Повторите новый пароль"
                                isValid={hasConfirmPassword && passwordsMatch}
                                showValidation={showValidation}
                                required={true}
                                hasValue={hasConfirmPassword}
                                autoComplete="off"
                            />
                            {hasConfirmPassword && !passwordsMatch && (
                                <p className="text-red-500 text-sm mt-2">
                                    Пароли не совпадают
                                </p>
                            )}
                            {hasConfirmPassword && passwordsMatch && (
                                <p className="text-green-500 text-sm mt-2">
                                    ✓ Пароли совпадают
                                </p>
                            )}
                        </div>

                        {/* Предупреждение о безопасности */}
                        {noErrors && passwordsMatch && passwordNotEmpty && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm text-blue-700">
                                            После смены пароля старый пароль будет недействителен.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Кнопки действий */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={
                                    loading ||
                                    !hasNewPassword ||
                                    !hasConfirmPassword ||
                                    !passwordsMatch ||
                                    !noErrors ||
                                    !passwordNotEmpty
                                }
                                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Сохранение...
                                    </>
                                ) : 'Сменить пароль'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
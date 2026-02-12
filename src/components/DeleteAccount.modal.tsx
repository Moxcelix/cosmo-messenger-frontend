import { useState } from 'react';
import { useUser } from '../hooks/useUser';
import { useAuth } from '../context/AuthContext';
import { translateAuthError } from '../utils/translateAuthError';
import PasswordInput from './PasswordInput';

interface DeleteAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const DeleteAccountModal = ({ isOpen, onClose, onSuccess }: DeleteAccountModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const { deleteUser, error: apiError, loading: userLoading } = useUser();
    const { logout } = useAuth();

    const loading = userLoading || isSubmitting;


    const handleConfirmTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmText(e.target.value);
        setDeleteError(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (confirmText !== 'УДАЛИТЬ') {
            setDeleteError('Введите УДАЛИТЬ для подтверждения');
            return;
        }

        setIsSubmitting(true);
        try {
            await deleteUser();
            
            // Разлогиниваем пользователя после удаления
            await logout();
            
            // Очищаем форму
            setConfirmText('');
            setDeleteError(null);
            
            onSuccess?.();
            onClose();
            

        } catch (err: unknown) {
            console.error('Ошибка удаления аккаунта:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (loading) return;
        
        // Очищаем форму при закрытии
        setConfirmText('');
        setDeleteError(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Оверлей с затемнением */}
            <div 
                className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                onClick={handleClose}
            />

            {/* Модалка */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
                    {/* Иконка предупреждения и заголовок */}
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                                Удаление аккаунта
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Это действие необратимо
                            </p>
                        </div>
                    </div>

                    {/* Предупреждение */}
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Вы точно хотите удалить аккаунт?
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Все ваши данные будут удалены</li>
                                        <li>Доступ к сервисам будет закрыт</li>
                                        <li>Восстановление аккаунта невозможно</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Подтверждение текстом */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Введите <span className="font-bold text-red-600">УДАЛИТЬ</span> для подтверждения *
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={handleConfirmTextChange}
                                disabled={loading}
                                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                                    confirmText === 'УДАЛИТЬ'
                                        ? 'border-green-500 focus:ring-green-500 bg-green-50'
                                        : 'border-gray-300 focus:ring-red-500'
                                } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                placeholder="Введите УДАЛИТЬ"
                                autoComplete="off"
                                autoFocus
                            />
                            {confirmText === 'УДАЛИТЬ' && (
                                <p className="text-green-600 text-sm mt-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Подтверждено
                                </p>
                            )}
                        </div>


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
                                    confirmText !== 'УДАЛИТЬ'
                                }
                                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Удаление...
                                    </>
                                ) : 'Удалить аккаунт'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
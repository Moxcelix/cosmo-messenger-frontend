import { useState } from 'react';

interface ChangeEmailModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (newEmail: string) => Promise<void>;
    currentEmail: string;
    loading: boolean;
    error: string | null;
}

const ChangeEmailModal = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    currentEmail,
    loading,
    error 
}: ChangeEmailModalProps) => {
    const [newEmail, setNewEmail] = useState('');
    const [confirmEmail, setConfirmEmail] = useState('');
    const [localError, setLocalError] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        // Валидация на клиенте
        if (newEmail !== confirmEmail) {
            setLocalError('Email адреса не совпадают');
            return;
        }

        if (newEmail === currentEmail) {
            setLocalError('Новый email должен отличаться от текущего');
            return;
        }

        try {
            await onSubmit(newEmail);
            // Очищаем поля только при успехе
            setNewEmail('');
            setConfirmEmail('');
        } catch (err) {
            // Ошибка уже в пропсе error из useUser
            // Ничего не делаем, модалка не закрывается
        }
    };

    const handleClose = () => {
        setNewEmail('');
        setConfirmEmail('');
        setLocalError('');
        onClose();
    };

    // Показываем либо локальную ошибку (валидация), либо ошибку из useUser (с бека)
    const displayError = error;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-gray-800">
                        Изменить email
                    </h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-500 hover:text-gray-700 transition-colors"
                        disabled={loading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Текущий email
                        </label>
                        <input
                            type="email"
                            value={currentEmail}
                            disabled
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Новый email
                        </label>
                        <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                displayError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Введите новый email"
                            required
                            disabled={loading}
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Подтвердите новый email
                        </label>
                        <input
                            type="email"
                            value={confirmEmail}
                            onChange={(e) => setConfirmEmail(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                displayError ? 'border-red-500 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder="Подтвердите новый email"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Отображение ошибки */}
                    {displayError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="font-medium text-red-800 mb-1">
                                        Ошибка
                                    </h4>
                                    <p className="text-sm text-red-700">
                                        {displayError}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 text-gray-800 font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Сохранение...
                                </span>
                            ) : 'Сохранить'}
                        </button>
                    </div>

                    {/* Подсказка для EMAIL_ALREADY_TAKEN */}
                    {displayError?.includes('уже существует') && (
                        <p className="mt-3 text-xs text-gray-500 text-center">
                            Попробуйте использовать другой email адрес
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ChangeEmailModal;
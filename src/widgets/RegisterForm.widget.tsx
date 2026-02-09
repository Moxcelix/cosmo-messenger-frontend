import { useState, useCallback } from 'react';
import { useRegister } from '../hooks/useRegister';
import { getErrorMessage } from '../utils/getErrorMessage';
import PasswordInput from '../components/PasswordInput';
import { translateAuthError } from '../utils/translateAuthError';

interface RegisterFormProps {
    onSuccess?: () => void;
}

export const RegisterForm = ({ onSuccess } : RegisterFormProps) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isTermsAccepted, setIsTermsAccepted] = useState(false);

    const { register, validatePassword, setPasswordError, registerError, passwordError, loading } = useRegister();

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmPassword(e.target.value);
    };

    const handleTermsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsTermsAccepted(e.target.checked);
    };

    const handlePasswordBlur = useCallback(async () => {
        if (!password) return;

        try {
            await validatePassword(password);
        } catch (err: unknown) {
            console.log(err)
        }
    }, [password, validatePassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password) {
            try {
                await validatePassword(password);
            } catch (err: unknown) {
                setPasswordError(getErrorMessage(err));
                return;
            }
        }

        try {
            await register(username, password, email);
            onSuccess?.(); 
        } catch (err: unknown) {
            console.log(err)
        }
    };

    const validateUsername = (username: string) => {
        return /^[a-zA-Z0-9_]+$/.test(username)
    }

    const passwordsMatch = password === confirmPassword
    const hasConfirmPassword = confirmPassword.length > 0
    const isUsernameValid = validateUsername(username)
    const hasUsername = username.length > 0
    const noErrors = passwordError == null

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
                Регистрация в Cosmo
            </h1>

            {registerError && (
                <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Ошибка регистрации</h3>
                            <div className="mt-1 text-sm text-red-700">
                                <p>{translateAuthError(registerError)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Имя пользователя для входа *
                    </label>
                    <input
                        type="text"
                        name="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${hasUsername && !isUsernameValid
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-300 focus:ring-blue-500'
                            } ${loading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        placeholder="Только латинские буквы и цифры"
                        required
                        autoComplete="off"
                    />
                    {hasUsername && !isUsernameValid && (
                        <p className="text-red-500 text-sm mt-2">
                            Можно использовать только a-z, 0-9 и _
                        </p>
                    )}
                    {hasUsername && isUsernameValid && (
                        <p className="text-green-500 text-sm mt-2">✓ Корректный формат</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                        Это имя будет использоваться для входа в систему
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email адрес *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                        placeholder="you@example.com"
                        required
                        autoComplete="off"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Пароль *
                    </label>
                    <PasswordInput
                        name="password"
                        value={password}
                        autoComplete="off"
                        onChange={handlePasswordChange}
                        onBlur={handlePasswordBlur}
                        placeholder="Введите пароль"
                        isValid={passwordError == null}
                        showValidation={true}
                        required={true}
                        hasValue={true}
                    />
                    {passwordError && (
                        <p className="text-red-500 text-sm mt-2">{translateAuthError(passwordError)}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                        Минимум 8 символов, включая заглавные буквы, цифры и специальные символы
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Подтверждение пароля *
                    </label>
                    <PasswordInput
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        onBlur={() => { }}
                        autoComplete="off"
                        placeholder="Повторите пароль"
                        isValid={hasConfirmPassword && passwordsMatch}
                        showValidation={true}
                        required={true}
                        hasValue={true}
                    />
                    {hasConfirmPassword && !passwordsMatch && (
                        <p className="text-red-500 text-sm mt-2">Пароли не совпадают</p>
                    )}
                    {hasConfirmPassword && passwordsMatch && (
                        <p className="text-green-500 text-sm mt-2">✓ Пароли совпадают</p>
                    )}
                </div>

                <div className="flex items-center pt-2">
                    <input
                        id="terms"
                        name="terms"
                        type="checkbox"
                        required={true}
                        disabled={loading}
                        checked={isTermsAccepted}
                        onChange={handleTermsChange}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    />
                    <label htmlFor="terms" className="ml-3 block text-sm text-gray-900">
                        Я согласен с{' '}
                        <a href="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                            условиями использования
                        </a>
                    </label>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading || !isUsernameValid || !hasConfirmPassword || !passwordsMatch || !noErrors || !isTermsAccepted}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex justify-center items-center"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Регистрация...
                            </>
                        ) : 'Зарегистрироваться'}
                    </button>
                </div>
            </form>

            <div className="mt-8 text-center text-sm text-gray-600">
                <p>
                    Уже есть аккаунт?{' '}
                    <a href="/new/login" className="text-blue-600 hover:text-blue-700 font-medium">
                        Войти
                    </a>
                </p>
            </div>
        </div>
    );
};
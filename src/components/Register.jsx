import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

import PasswordInput from './PasswordInput'

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',      
        name: '',          
        password: '',
        confirmPassword: '',
        bio: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    const validateUsername = (username) => {
        return /^[a-zA-Z0-9_]+$/.test(username)
    }

    const validateForm = () => {
        if (!validateUsername(formData.username)) {
            setError('Имя пользователя может содержать только латинские буквы, цифры и символ _')
            return false
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают')
            return false
        }

        if (formData.password.length < 3) {
            setError('Пароль должен содержать минимум 3 символа')
            return false
        }

        return true
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        if (!validateForm()) {
            setLoading(false)
            return
        }

        try {
            const response = await fetch('/api/v1/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.username,
                    name: formData.name,
                    password: formData.password,
                    bio: formData.bio
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Ошибка регистрации')
            }

            setSuccess(data.message || 'Регистрация успешна!')

            setTimeout(() => {
                navigate('/login')
            }, 1000)

        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const passwordsMatch = formData.password === formData.confirmPassword
    const hasConfirmPassword = formData.confirmPassword.length > 0
    const isUsernameValid = validateUsername(formData.username)
    const hasUsername = formData.username.length > 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
                <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
                    Регистрация в Cosmo
                </h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Имя пользователя для входа *
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                                hasUsername && !isUsernameValid 
                                    ? 'border-red-500 focus:ring-red-500' 
                                    : 'border-gray-300 focus:ring-green-500'
                            }`}
                            placeholder="Только латинские буквы и цифры"
                            required
                        />
                        {hasUsername && !isUsernameValid && (
                            <p className="text-red-500 text-xs mt-1">
                                Можно использовать только a-z, 0-9 и _
                            </p>
                        )}
                        {hasUsername && isUsernameValid && (
                            <p className="text-green-500 text-xs mt-1">✓ Корректный формат</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Это имя будет использоваться для входа в систему
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ваше имя для отображения *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Можно использовать русские буквы"
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Это имя будут видеть другие пользователи
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Пароль *
                        </label>
                        <PasswordInput
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Введите пароль"
                            required={true}
                        />
                        <p className="text-xs text-gray-500 mt-1">Минимум 3 символа</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Подтверждение пароля *
                        </label>
                        <PasswordInput
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Повторите пароль"
                            required={true}
                            showValidation={true}
                            isValid={passwordsMatch}
                            hasValue={hasConfirmPassword}
                        />
                        {hasConfirmPassword && !passwordsMatch && (
                            <p className="text-red-500 text-xs mt-1">Пароли не совпадают</p>
                        )}
                        {hasConfirmPassword && passwordsMatch && (
                            <p className="text-green-500 text-xs mt-1">✓ Пароли совпадают</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            О себе
                        </label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Расскажите о себе..."
                            rows="3"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                            {success}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || !isUsernameValid || (hasConfirmPassword && !passwordsMatch)}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>Уже есть аккаунт? <Link to="/login" className="text-green-500 hover:text-green-600">Войти</Link></p>
                </div>
            </div>
        </div>
    )
}

export default Register
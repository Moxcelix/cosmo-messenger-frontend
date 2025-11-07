import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const UserSearch = ({ onUserFound }) => {
    const { authFetch } = useAuth()
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!username.trim()) return

        setLoading(true)
        setError('')

        try {
            const response = await authFetch(`/api/v1/users/find?username=${encodeURIComponent(username.trim())}`)
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Пользователь не найден')
                }
                if (response.status === 400) {
                    throw new Error('Введите username')
                }
                throw new Error('Ошибка поиска')
            }

            const userData = await response.json()
            onUserFound(userData)
            setUsername('')
            
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-sm border border-white/50">
            <div className="flex items-center space-x-2 mb-3">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <h3 className="font-semibold text-gray-800">Найти пользователя</h3>
            </div>
            
            <form onSubmit={handleSearch} className="flex space-x-3">
                <div className="flex-1">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUsername(e.target.value)
                            setError('')
                        }}
                        placeholder="Введите username пользователя..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        disabled={loading}
                    />
                </div>
                <button
                    type="submit"
                    disabled={!username.trim() || loading}
                    className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:from-gray-300 disabled:to-gray-400 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 shadow-sm flex items-center space-x-2"
                >
                    {loading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span>Найти</span>
                        </>
                    )}
                </button>
            </form>
            
            {error && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
        </div>
    )
}

export default UserSearch
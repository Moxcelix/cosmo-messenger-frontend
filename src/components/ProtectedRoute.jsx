import React from 'react'
import { useAuth } from '../context/AuthContext'
import SessionExpiredModal from './SessionExpiredModal'

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading, showSessionExpired } = useAuth()

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="text-xl">Загрузка...</div>
            </div>
        )
    }

    if (!isAuthenticated) {
        return (
            <>
                <div className="h-screen flex items-center justify-center">
                    <div className="text-xl">Доступ запрещен</div>
                </div>
                {showSessionExpired && <SessionExpiredModal />}
            </>
        )
    }

    return (
        <>
            {children}
        </>
    )
}

export default ProtectedRoute
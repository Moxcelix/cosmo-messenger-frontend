import React, { createContext, useState, useContext, useEffect, useRef } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [accessToken, setAccessToken] = useState(null)
    const [refreshToken, setRefreshToken] = useState(null)
    const [loading, setLoading] = useState(true)

    const isRefreshing = useRef(false)
    const refreshPromise = useRef(null)

    useEffect(() => {
        const token = localStorage.getItem('accessToken')
        const storedUser = localStorage.getItem('user')
        const storedRefreshToken = localStorage.getItem('refreshToken')

        if (token && storedUser) {
            setAccessToken(token)
            setRefreshToken(storedRefreshToken)
            setUser(JSON.parse(storedUser))
        }
        setLoading(false)
    }, [])

    const refreshAccessToken = async () => {
        if (isRefreshing.current) {
            return refreshPromise.current
        }

        if (!refreshToken) {
            logout()
            return null
        }

        if (isTokenExpired(refreshToken)) {
            logout()
            return null
        }

        isRefreshing.current = true

        refreshPromise.current = (async () => {
            try {
                const response = await fetch('/api/v1/auth/refresh', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refresh_token: refreshToken }),
                })

                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(`Refresh failed: ${response.status} - ${errorText}`)
                }

                const data = await response.json()
                const newAccessToken = data.access_token

                setAccessToken(newAccessToken)
                localStorage.setItem('accessToken', newAccessToken)

                return newAccessToken
            } catch (error) {
                logout()
                return null
            } finally {
                isRefreshing.current = false
                refreshPromise.current = null
            }
        })
        return refreshPromise.current
    }
    const authFetch = async (url, options = {}) => {

        let currentToken = accessToken

        if (isTokenExpired(currentToken)) {
            try {
                currentToken = await refreshAccessToken()
                if (!currentToken) {
                    throw new Error('Failed to refresh token')
                }
            } catch (error) {
                throw new Error('Session expired')
            }
        }

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentToken}`,
                ...options.headers,
            },
        }

        let response = await fetch(url, config)

        if (response.status === 401) {
            try {
                const newToken = await refreshAccessToken()
                if (newToken) {
                    config.headers.Authorization = `Bearer ${newToken}`
                    response = await fetch(url, config)
                } else {
                    logout()
                    throw new Error('Session expired')
                }
            } catch (error) {
                logout()
                throw new Error('Session expired')
            }
        }

        return response
    }

    const login = (authData) => {
        const { access_token, refresh_token } = authData

        setAccessToken(access_token)
        setRefreshToken(refresh_token)

        const userData = decodeJWT(access_token)
        setUser(userData)

        localStorage.setItem('accessToken', access_token)
        localStorage.setItem('refreshToken', refresh_token)
        localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
        setUser(null)
        setAccessToken(null)
        setRefreshToken(null)

        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
    }

    const decodeJWT = (token) => {
        try {
            const payload = token.split('.')[1]
            const decoded = JSON.parse(atob(payload))
            return {
                id: decoded.userID,
            }
        } catch (error) {
            return null
        }
    }

    const isTokenExpired = (token) => {
        if (!token) {
            return true
        }
        try {
            const payload = token.split('.')[1]
            const decoded = JSON.parse(atob(payload))
            const expiryTime = decoded.exp * 1000
            const currentTime = Date.now()
            const isExpired = expiryTime < currentTime

            return isExpired
        } catch (error) {
            return true
        }
    }

    const value = {
        user,
        accessToken,
        refreshToken,
        login,
        logout,
        loading,
        isAuthenticated: !!accessToken && !isTokenExpired(accessToken),
        authFetch,
        refreshAccessToken,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const getCurrentUserId = () => {
    const userData = localStorage.getItem('user')
    if (userData) {
        try {
            const user = JSON.parse(userData)
            return user.id
        } catch {
            return null
        }
    }
    return null
}

export const useCurrentUser = () => {
    const { user } = useAuth()
    return user?.id
}
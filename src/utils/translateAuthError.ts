export const translateAuthError = (errorMessage: string): string => {
    if (errorMessage.includes('INVALID_CREDENTIALS')) return 'Неверный логин или пароль';
    if (errorMessage.includes('PASSWORD_TOO_SHORT')) return 'Пароль должен содержать минимум 8 символов';
    if (errorMessage.includes('PASSWORD_MISSING_UPPERCASE')) return 'Пароль должен содержать хотя бы одну заглавную букву';
    if (errorMessage.includes('PASSWORD_MISSING_LOWERCASE')) return 'Пароль должен содержать хотя бы одну строчную букву';
    if (errorMessage.includes('PASSWORD_MISSING_DIGIT')) return 'Пароль должен содержать хотя бы одну цифру';
    if (errorMessage.includes('PASSWORD_MISSING_SPECIAL')) return 'Пароль должен содержать хотя бы один специальный символ';
    if (errorMessage.includes('EMAIL_ALREADY_TAKEN')) return 'Пользователь с таким email уже существует';
    if (errorMessage.includes('USERNAME_ALREADY_TAKEN')) return 'Этот username занят'
    if (errorMessage.includes('USER_NOT_FOUND')) return 'Пользователь не найден'
    if (errorMessage.includes('USER_ALREADY_ACTIVATED')) return 'Пользователь уже активирован'
    if (errorMessage.includes('CANNOT_ACTIVATE_DELETED_USER')) return 'Пользователь удален'
    if (errorMessage.includes('INACTIVE_USER')) return 'Пользователь не подтвердил почту'
    if (errorMessage.includes('TOKEN_EXPIRED')) return 'Время жизни токена сочтено...'


    return errorMessage;
};
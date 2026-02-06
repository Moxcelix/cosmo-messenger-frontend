export const translateAuthError = (errorMessage: string): string => {
  const lowerError = errorMessage.toLowerCase();

  if (lowerError.includes('long')) return 'Пароль должен содержать минимум 8 символов';
  if (lowerError.includes('uppercase')) return 'Пароль должен содержать хотя бы одну заглавную букву';
  if (lowerError.includes('lowercase')) return 'Пароль должен содержать хотя бы одну строчную букву';
  if (lowerError.includes('digit')) return 'Пароль должен содержать хотя бы одну цифру';
  if (lowerError.includes('special')) return 'Пароль должен содержать хотя бы один специальный символ';
  if (lowerError.includes('email')) return 'Пользователь с таким email уже существует';
  if (lowerError.includes('username')) return 'Пользователь с таким username уже существует'


  return errorMessage;
};
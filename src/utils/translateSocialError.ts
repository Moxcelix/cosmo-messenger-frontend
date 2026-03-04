export const translateSocialError = (errorMessage: string): string => {
    if (errorMessage.includes('LONG_DISPLAY_NAME')) return 'Имя должно быть не больше 32 символов';
    if (errorMessage.includes('LONG_BIO')) return '"О себе" должно быть не более 500 символов';

    return errorMessage;
};
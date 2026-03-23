import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { EditIcon, SettingsIcon, CheckIcon, XIcon, CameraIcon } from '../components/Icons';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useProfile } from '../context/ProfileContext';
import { Profile } from '../types/models/Profile';
import { User } from '../types/models/User';
import { translateSocialError } from '../utils/translateSocialError';

interface UserAccountProps {
    username?: string;
    onLogout?: () => void;
    onEmailResent?: () => void;
}

type EditableField = 'bio' | 'display_name' | null;

export const UserProfile = ({ username, onLogout, onEmailResent }: UserAccountProps) => {
    const navigate = useNavigate();
    const { authorized, logout, loading: authLoading } = useAuth();
    const { getCurrentUser, resendActivationEmail, error: userError, loading: userLoading } = useUser();
    const {
        profile: myProfile,
        getUserProfile,
        changeBio,
        changeDisplayName,
        changeAvatar,
        resetAllErrors,
        updateAvatar,
        error: profileError,
        loading: profileLoading,
        bioError,
        displayNameError,
        avatarError,
    } = useProfile();

    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [resending, setResending] = useState(false);
    const [logoutLoading, setLogoutLoading] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Состояния для редактирования
    const [editingField, setEditingField] = useState<EditableField>(null);
    const [bioValue, setBioValue] = useState('');
    const [displayNameValue, setDisplayNameValue] = useState('');
    const [saveError, setSaveError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isMine, setIsMine] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const loading = authLoading || userLoading || logoutLoading || (profileLoading && !profile);

    useEffect(()=>{
        setIsMine(authorized && profile?.user_id === user?.id)
    }, [authLoading])

    useEffect(() => {
        const loadData = async () => {
            try {
                setProfile(null)

                if (username) {
                    const profileData = await getUserProfile(username);
                    setProfile(profileData)
                    console.log(profileData)
                    console.log(profileData?.is_active)
                    if (profileData) {
                        setBioValue(profileData.bio || '');
                        setDisplayNameValue(profileData.display_name || '');
                    }
                }

                const userData = await getCurrentUser();
                setUser(userData);
            } catch (error) {
                console.error('Ошибка загрузки:', error);
            }
        };

        loadData();

    }, [authorized, username]);

    useEffect(() => {
        if (!profileLoading) {
            if (!profile) return;
            if (bioValue !== profile.bio) {
                if (!bioError) {
                    setEditingField(null);
                }
                else {
                    setSaveError(bioError);
                }
            } else if (displayNameValue !== profile.display_name) {
                if (!displayNameError) {
                    setEditingField(null);
                }
                else {
                    setSaveError(displayNameError);
                }
            }
        }
    }, [profileLoading])

    useEffect(() => {
        if (isMine) {
            setProfile(myProfile)
        }
    }, [myProfile])

    const handleResend = async () => {
        setResending(true);
        try {
            await resendActivationEmail();
            alert('Письмо отправлено повторно! Проверьте ваш почтовый ящик.');
            onEmailResent?.();
        } catch (err) {
            console.error('Ошибка при повторной отправке:', err);
        } finally {
            setResending(false);
        }
    };

    const handleLogout = async () => {
        setLogoutLoading(true);
        try {
            await logout();
            onLogout?.();
        } catch (err) {
            console.error('Ошибка при выходе:', err);
        } finally {
            setLogoutLoading(false);
        }
    };

    const handleSettingsClick = () => {
        navigate('/new/settings');
    };

    // Обработчики редактирования
    const handleEditClick = (field: EditableField) => {
        setEditingField(field);
        setSaveError(null);
    };

    const handleCancelEdit = () => {
        // Возвращаем исходные значения
        if (profile) {
            setBioValue(profile.bio || '');
            setDisplayNameValue(profile.display_name || '');
        }
        setEditingField(null);
        setSaveError(null);
    };

    const handleSave = async () => {
        if (!profile) return;

        setIsSaving(true);
        resetAllErrors();

        if (editingField === 'bio' && bioValue !== profile.bio) {
            await changeBio(bioValue);

        } else if (editingField === 'display_name' && displayNameValue !== profile.display_name) {
            await changeDisplayName(displayNameValue);
        }
        setIsSaving(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent, field: EditableField) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancelEdit();
        }
    };

    const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setBioValue(e.target.value);
        //setSaveError(null);
    };

    const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDisplayNameValue(e.target.value);
        //setSaveError(null);
    };

    const handleAvatarClick = () => {
        if (isMine && profile?.is_active) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        console.log(file)

        const meta = await changeAvatar(file)

        //updateAvatar()
    };

    if (loading && !profile) {
        return <LoadingSpinner />;
    }

    if (!profile) {
        return (
            <div className="rounded-lg bg-red-50 p-6 border border-red-200">
                <div className="flex items-start">
                    <svg className="w-6 h-6 text-red-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                        <h3 className="text-lg font-medium text-red-800 mb-1">Ошибка загрузки</h3>
                        <p className="text-red-700">
                            {profileError || 'Не удалось загрузить данные пользователя. Пожалуйста, попробуйте позже.'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white w-full">
            {/* Шапка профиля */}
            <div className="flex items-center justify-between mb-6">
                <div
                    className="flex items-center gap-3 group"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                >
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isMine ? 'Мой профиль' : `Профиль ${profile.username}`}
                    </h2>

                    {/* Кнопка настроек (только для своего профиля) */}
                    {isMine && (
                        <button
                            onClick={handleSettingsClick}
                            className={`
                                p-2 rounded-lg transition-all duration-200
                                ${isHovering
                                    ? 'opacity-100 bg-gray-100 hover:bg-gray-200'
                                    : 'opacity-0 pointer-events-none'
                                }
                                text-gray-600 hover:text-gray-800
                            `}
                            aria-label="Настройки"
                        >
                            <SettingsIcon />
                        </button>
                    )}
                </div>

                <div className="relative">
                    <div
                        className={`w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden ${isMine && profile?.is_active ? 'cursor-pointer group' : ''
                            }`}
                        onClick={handleAvatarClick}
                    >
                        {profile?.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt="avatar"
                                className={`w-full h-full object-cover transition-all duration-200 ${isMine && profile?.is_active ? 'group-hover:brightness-50' : ''
                                    }`}
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                {profile?.username?.charAt(0).toUpperCase() || '?'}
                            </div>
                        )}

                        {/* Иконка фотоаппарата при наведении */}
                        {isMine && profile?.is_active && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <CameraIcon className="w-8 h-8 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Скрытый input для загрузки файла */}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        className="hidden"
                    />
                </div>


            </div>

            {/* Информация профиля */}
            <div className="space-y-4 mb-6">
                {/* Username (нередактируемый) */}
                <div className="pb-4 border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-1">Имя пользователя</label>
                    <div className="text-lg font-semibold text-gray-800">{profile.username}</div>
                </div>

                {/* Display Name (редактируется только если isMine) */}
                {(profile.display_name || isMine) && (
                    <div className="pb-4 border-b border-gray-100">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Отображаемое имя
                        </label>

                        {isMine && editingField === 'display_name' ? (
                            <div className="space-y-2">
                                <div className="flex flex-col items-left gap-2">
                                    <input
                                        type="text"
                                        value={displayNameValue}
                                        onChange={handleDisplayNameChange}
                                        onKeyDown={(e) => handleKeyDown(e, 'display_name')}
                                        className="flex-1 text-lg text-gray-800 bg-gray-50 border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        autoFocus
                                        placeholder="Введите отображаемое имя"
                                        disabled={isSaving}
                                    />
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                        >
                                            {isSaving ? 'Сохранение...' : 'Сохранить'}
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            disabled={isSaving}
                                            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                        >
                                            Отмена
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ) : (
                            <div className="flex items-center justify-between group">
                                <div className="text-lg text-gray-800">
                                    {profile.display_name || 'Не указано'}
                                </div>
                                {isMine && (
                                    <button
                                        onClick={() => handleEditClick('display_name')}
                                        className="ml-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                        aria-label="Редактировать отображаемое имя"
                                    >
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                        {isMine && displayNameError && (
                            <p className="text-sm text-red-600">{translateSocialError(displayNameError)}</p>
                        )}
                    </div>
                )}


                {profile.email && (<div className="border-b border-gray-100">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                        Email
                        {isMine && (profile.is_active ? (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Подтверждён
                            </span>
                        ) : (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Не подтверждён
                            </span>
                        ))}
                    </label>
                    <div className="text-lg font-semibold text-gray-800 flex items-center  pb-4">
                        {profile.email}
                    </div>
                    {isMine && !profile.is_active && (
                        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start">
                                <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h4 className="font-medium text-yellow-800 mb-1">Требуется подтверждение email</h4>
                                    <p className="text-yellow-700 text-sm mb-3">
                                        Пожалуйста, проверьте вашу почту и перейдите по ссылке в письме для активации аккаунта.
                                    </p>
                                    <button
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="inline-flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-300 text-white text-sm font-medium rounded-lg transition-colors"
                                    >
                                        {resending ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Отправка...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                Отправить письмо повторно
                                            </>
                                        )}
                                    </button>

                                    {userError && (
                                        <p className="mt-2 text-red-600 text-sm">
                                            {userError}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>)}


                {/* Bio (редактируется только если isMine) */}
                {(profile.bio || isMine) && (
                    <div className="pb-4 border-b border-gray-100">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            О себе
                        </label>

                        {isMine && editingField === 'bio' ? (
                            <div className="space-y-2">
                                <textarea
                                    value={bioValue}
                                    onChange={handleBioChange}
                                    onKeyDown={(e) => handleKeyDown(e, 'bio')}
                                    className="w-full text-gray-800 bg-gray-50 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows={3}
                                    autoFocus
                                    placeholder="Расскажите о себе"
                                    disabled={isSaving}
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isSaving ? 'Сохранение...' : 'Сохранить'}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        disabled={isSaving}
                                        className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start justify-between group">
                                <div className="text-gray-700 whitespace-pre-wrap">
                                    {profile.bio || 'Не заполнено'}
                                </div>
                                {isMine && (
                                    <button
                                        onClick={() => handleEditClick('bio')}
                                        className="ml-3 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                                        aria-label="Редактировать био"
                                    >
                                        <EditIcon className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        )}
                        {isMine && bioError && (
                            <p className="text-sm text-red-600">{translateSocialError(bioError)}</p>
                        )}
                    </div>
                )}

                {/* Дата регистрации (для всех) */}
                {profile.created_at && (
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1">Дата регистрации</label>
                        <div className="text-gray-700">
                            {new Date(profile.created_at).toLocaleDateString('ru-RU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
};
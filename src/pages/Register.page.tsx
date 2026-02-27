import styles from '../styles/AuthPage.module.css'

import { RegisterForm } from '../widgets/RegisterForm.widget';
import { useNavigate } from 'react-router-dom';
import { useLoginRedirect } from '../hooks/useLoginRedirect';
import SpacePattern from '../components/SpacePattern';

export const RegisterPage = () => {
    const { loading } = useLoginRedirect('/new/chats');

    const navigate = useNavigate();

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
            <SpacePattern opacity={0.45} />
            <div className={styles.authContainer}>
                <RegisterForm
                    onSuccess={() => {navigate('/new/login')}}
                />
            </div>
        </div>
    );
};
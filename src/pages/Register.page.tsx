import styles from '../styles/AuthPage.module.css'

import { RegisterForm } from '../widgets/RegisterForm.widget';
import { useNavigate } from 'react-router-dom';
import { useLoginRedirect } from '../hooks/useLoginRedirect';

export const RegisterPage = () => {
    const { loading } = useLoginRedirect('/new/chats');

    const navigate = useNavigate();

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
            <div className={styles.authContainer}>
                <RegisterForm
                    onSuccess={() => {navigate('/new/login')}}
                />
            </div>
        </div>
    );
};
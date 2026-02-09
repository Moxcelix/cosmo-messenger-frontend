import styles from '../styles/AuthPage.module.css'

import { LoginForm } from '../widgets/LoginForm.widget';
import { useLoginRedirect } from '../hooks/useLoginRedirect';


export const LoginPage = () => {
    const { loading, authorized } = useLoginRedirect('/new/chats');

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-600 flex items-center justify-center">
            <div className={styles.authContainer}>
                <LoginForm/>
            </div>
        </div>
    );
};
import styles from '../styles/AuthPage.module.css'

import { LoginForm } from '../widgets/LoginForm.widget';
import { useLoginRedirect } from '../hooks/useLoginRedirect';
import SpaceBackground from '../components/SpaceBackground';
import SpacePattern from '../components/SpacePattern';


export const LoginPage = () => {
    const { loading, authorized } = useLoginRedirect('/new/chats');

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
            <SpacePattern opacity={0.45} />
            <div className={styles.authContainer}>
                <LoginForm />
            </div>  
        </div>
    );
};
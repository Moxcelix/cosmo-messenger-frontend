import SpacePattern from '../components/SpacePattern';
import styles from '../styles/AuthPage.module.css'

import { ActivationWidget } from "../widgets/Activate.widget";

export const ActivationPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
            <SpacePattern opacity={0.45} />
            <div className={styles.authContainer}>
                <ActivationWidget />
            </div>
        </div>
    );
};
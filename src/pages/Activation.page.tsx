import styles from '../styles/AuthPage.module.css'

import { ActivationWidget } from "../widgets/Activate.widget";

export const ActivationPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-300 to-blue-300 flex items-center justify-center">
            <div className={styles.authContainer}>
                <ActivationWidget />
            </div>
        </div>
    );
};
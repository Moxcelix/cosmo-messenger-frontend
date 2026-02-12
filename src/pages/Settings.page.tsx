import styles from '../styles/BasePage.module.css'

import { useLogoutRedirect } from "../hooks/useLogoutRedirect";
import { NavigationPanel } from "../widgets/NavigationPanel.widget";
import { NavigationLayout } from '../layout/Navigation.layout';
import { SettingsWidget } from '../widgets/Settings.widget';

export const SettingsPage = () => {
    const { loading } = useLogoutRedirect('/new/login');

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-300 to-blue-300 flex items-center justify-center">
            <div className={styles.baseContainer}>
                <NavigationLayout>
                    <NavigationPanel />
                    <SettingsWidget />
                </NavigationLayout>
            </div>
        </div>
    );
}
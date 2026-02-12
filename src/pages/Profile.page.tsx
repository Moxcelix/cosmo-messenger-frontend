import styles from '../styles/BasePage.module.css'

import { useLogoutRedirect } from "../hooks/useLogoutRedirect";
import { NavigationPanel } from "../widgets/NavigationPanel.widget";
import { UserAccount } from "../widgets/UserAccount.widget";
import { NavigationLayout } from '../layout/Navigation.layout';

export const ProfilePage = () => {
    const { loading } = useLogoutRedirect('/new/login');

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-300 to-blue-300 flex items-center justify-center">
            <div className={styles.baseContainer}>
                <NavigationLayout>
                    <NavigationPanel />
                    <UserAccount />
                </NavigationLayout>
            </div>
        </div>
    );
}
import styles from '../styles/BasePage.module.css'

import { useLogoutRedirect } from "../hooks/useLogoutRedirect";
import { NavigationPanel } from "../widgets/NavigationPanel.widget";
import { UserProfile } from "../widgets/UserProfile.widget";
import { NavigationLayout } from '../layout/Navigation.layout';
import SpacePattern from '../components/SpacePattern';
import { useParams } from 'react-router-dom';

export const ProfilePage = () => {
    //const { loading } = useLogoutRedirect('/new/login');
    const { username } = useParams<{ username?: string }>();

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
            <SpacePattern opacity={0.45} />
            <div className={styles.baseContainer}>
                <NavigationLayout>
                    <NavigationPanel />
                    <UserProfile 
                        username={username} 
                    />
                </NavigationLayout>
            </div>
        </div>
    );
}
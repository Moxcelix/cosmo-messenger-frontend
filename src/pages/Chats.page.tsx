import styles from '../styles/BasePage.module.css'

import { useLogoutRedirect } from '../hooks/useLogoutRedirect';
import { NavigationLayout } from '../layout/Navigation.layout';
import SpacePattern from '../components/SpacePattern';
import { useChat } from '../hooks/useChat';
import { useEffect } from 'react';
import { ChatCompositeWidget } from '../widgets/ChatComposite.widget';

export const ChatsPage = () => {
    const { loading } = useLogoutRedirect('/new/login');

    return (
        <div className="h-screen w-full overflow-hidden bg-gradient-to-br from-purple-400 to-blue-400">
            <SpacePattern opacity={0.45} />
            <div className={styles.baseContainer} >
                <NavigationLayout>
                    <ChatCompositeWidget />
                </NavigationLayout>
            </div>
        </div>
    );
};
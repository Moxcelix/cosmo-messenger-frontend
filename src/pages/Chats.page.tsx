import styles from '../styles/BasePage.module.css'

import { useLogoutRedirect } from '../hooks/useLogoutRedirect';
import { NavigationLayout } from '../layout/Navigation.layout';
import SpacePattern from '../components/SpacePattern';

export const ChatsPage = () => {

    const { loading } = useLogoutRedirect('/new/login');

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center">
            <SpacePattern opacity={0.45} />
            <div className={styles.baseContainer}>
                <NavigationLayout>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Чаты</h1>

                        <div className="bg-white rounded-lg shadow p-6">
                            <p className="text-gray-600">Список чатов будет здесь...</p>
                        </div>
                    </div>
                </NavigationLayout>
            </div>
        </div>
    );
};
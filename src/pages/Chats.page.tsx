import styles from '../styles/BasePage.module.css'

import { useLogoutRedirect } from '../hooks/useLogoutRedirect';
import { NavigationPanel } from '../widgets/NavigationPanel.widget';

export const ChatsPage = () => {

    const { loading } = useLogoutRedirect('/new/login');

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-300 to-blue-300 flex items-center justify-center">
            <div className={styles.baseContainer}>
                <NavigationPanel />

                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Чаты</h1>

                    <div className="bg-white rounded-lg shadow p-6">
                        <p className="text-gray-600">Список чатов будет здесь...</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
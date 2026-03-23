import { ReactNode } from 'react';
import { NavigationPanel } from '../widgets/NavigationPanel.widget';

interface LayoutProps {
    children: ReactNode;
}

export const NavigationLayout = ({ children }: LayoutProps) => {
    return (
        <div className="w-full h-full overflow-hidden">
            <NavigationPanel />
            <main className="h-full overflow-hidden pt-16">
                {children}
            </main>
        </div>
    );
};
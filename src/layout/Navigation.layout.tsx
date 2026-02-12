import { ReactNode } from 'react';
import { NavigationPanel } from '../widgets/NavigationPanel.widget';

interface LayoutProps {
    children: ReactNode;
}

export const NavigationLayout = ({ children }: LayoutProps) => {
    return (
        <div>
            <NavigationPanel />
            <main className="pt-16">
                {children}
            </main>
        </div>
    );
};
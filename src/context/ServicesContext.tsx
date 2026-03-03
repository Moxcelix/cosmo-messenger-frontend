import { createContext, useContext, ReactNode, useMemo } from 'react';
import { AuthApi } from '../data/api/AuthApi';
import { AuthLocalStorage } from '../data/storage/AuthLocalStorage';
import { AuthService } from '../types/services/AuthService';
import { SocialService } from '../types/services/SocialService';
import { SocialApi } from '../data/api/SocialApi';

export interface Services {
    authService: AuthService;
    authStorage: AuthLocalStorage;
    socialService: SocialService;
}

const ServicesContext = createContext<Services | undefined>(undefined);

interface ServicesProviderProps {
    children: ReactNode;
}

export const useServices = (): Services => {
    const context = useContext(ServicesContext);

    if (context === undefined) {
        throw new Error('useServices must be used within ServicesProvider');
    }

    return context;
};

export const ServicesProvider: React.FC<ServicesProviderProps> = ({ children }) => {
    const services = useMemo<Services>(() => ({
        authService: new AuthApi(),
        authStorage: new AuthLocalStorage(),
        socialService: new SocialApi(),
    }), []);

    return (
        <ServicesContext.Provider value={services}>
            {children}
        </ServicesContext.Provider>
    );
};

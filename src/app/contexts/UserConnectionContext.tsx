// src/contexts/UserConnectionContext.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useKeepKeyWallet } from './WalletProvider';
interface UserConnectionContextType {
    isConnected: boolean;
    setIsConnected: (isConnected: boolean) => void;
    selectedChains: string[];
    setSelectedChains: (chains: string[]) => void;
}

const UserConnectionContext = createContext<UserConnectionContextType | undefined>(undefined);

export const useUserConnection = () => {
    const context = useContext(UserConnectionContext);
    if (context === undefined) {
        throw new Error('useUserConnection must be used within a UserConnectionProvider');
    }
    return context;
};

export const UserConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isConnected, setIsConnected] = useState(false);
    const [selectedChains, setSelectedChains] = useState<string[]>([]);

    useEffect(() => {
        const connectedStatus = localStorage.getItem('isConnected') === 'true';
        setIsConnected(connectedStatus);

        // You might also want to save/load selectedChains from localStorage
        const chains = localStorage.getItem('selectedChains');
        setSelectedChains(chains ? JSON.parse(chains) : []);
    }, []);

    useEffect(() => {
        localStorage.setItem('isConnected', isConnected.toString());
        // Save selectedChains to localStorage
        localStorage.setItem('selectedChains', JSON.stringify(selectedChains));
    }, [isConnected, selectedChains]);

    return (
        <UserConnectionContext.Provider value={{ isConnected, setIsConnected, selectedChains, setSelectedChains }}>
            {children}
        </UserConnectionContext.Provider>
    );
};

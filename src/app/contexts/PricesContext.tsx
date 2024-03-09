import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Price {
    [key: string]: { usd: number };
}
type CoinGeckoIdMap = {
    [key: string]: string;
};
interface PricesContextType {
    prices: { [key: string]: number }; // Simplified price object for easy access
    fetchPrices: () => Promise<void>;
}

const PricesContext = createContext<PricesContextType | undefined>(undefined);

export const PricesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [prices, setPrices] = useState<{ [key: string]: number }>({});

    const coinGeckoIdMap: CoinGeckoIdMap = {
        BTC: 'bitcoin',
        ETH: 'ethereum',
        USDT: 'tether',
        THOR: 'thorchain',
        LTC: 'litecoin',
        DOGE: 'dogecoin',
        MAYA: 'maya',
        CACAO: 'cacao',
        FOX: 'shapeshift-fox-token',
        RUNE: 'thorchain',
        ZCASH: 'zcash',
        XRP: 'ripple',
        DASH: 'dash',
        GTC: 'gitcoin',
        USDC: 'usd-coin',
        OSMO: 'osmosis',
        GAIA: 'gaia',
        ATOM: 'cosmos',
        STETH: 'staked-ether',
        OP: 'optimism',

        // Add more mappings as needed
    };

    const fetchPrices = async () => {
        const ids = Object.values(coinGeckoIdMap).join(',');
        const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
        try {
            const response = await fetch(url);
            const data: Price = await response.json();
            const simplifiedPrices = Object.keys(coinGeckoIdMap).reduce((acc, symbol) => {
                const id = coinGeckoIdMap[symbol as keyof typeof coinGeckoIdMap];
                acc[symbol] = data[id]?.usd || 0;
                return acc;
            }, {} as { [key: string]: number });
            setPrices(simplifiedPrices);
        } catch (error) {
            console.error("Error fetching prices from CoinGecko:", error);
        }
    };

    // Fetch prices on component mount and set to refetch every 5 minutes
    useEffect(() => {
        fetchPrices();
        const interval = setInterval(fetchPrices, 300000); // 5 minutes
        return () => clearInterval(interval); // Cleanup interval on component unmount
    }, []);

    return (
        <PricesContext.Provider value={{ prices, fetchPrices }}>
            {children}
        </PricesContext.Provider>
    );
};

export const usePrices = () => {
    const context = useContext(PricesContext);
    if (context === undefined) {
        throw new Error('usePrices must be used within a PricesProvider');
    }
    return context;
};

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserWallet } from '../../service/userService';

interface WalletContextProps {
  wallet: number | null;
  refreshWallet: () => Promise<void>;
  setWallet: React.Dispatch<React.SetStateAction<number | null>>;
}

const WalletContext = createContext<WalletContextProps>({
  wallet: null,
  refreshWallet: async () => {},
  setWallet: () => {},
});

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [wallet, setWallet] = useState<number | null>(null);

  const refreshWallet = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      const w = await getUserWallet(userId);
      setWallet(w);
    }
  };

  useEffect(() => {
    refreshWallet();
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, refreshWallet, setWallet }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);

import React, { createContext, useContext, ReactNode } from 'react';

type Currency = 'INR';

interface CurrencyContextType {
  currency: Currency;
  formatCurrency: (amount: number, compact?: boolean) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const currency: Currency = 'INR';

  const formatCurrency = (amount: number, compact: boolean = false) => {
    // Assuming underlying data is in USD, we convert to INR
    // 1 USD approx 84.5 INR
    const rate = 84.5; 
    const value = amount * rate;
    const locale = 'en-IN';
    
    if (compact) {
       return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: 'INR',
        notation: 'compact',
        maximumFractionDigits: 1
      }).format(value);
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <CurrencyContext.Provider value={{ currency, formatCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
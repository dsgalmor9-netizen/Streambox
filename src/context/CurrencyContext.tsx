import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'COP' | 'USD' | 'MXN';
export type BillingPeriod = 'MONTHLY' | 'ANNUAL';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  rateToCOP: number; // 1 unit in foreign currency = X COP
  decimals: number;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  COP: {
    code: 'COP',
    symbol: '$',
    name: 'Peso Colombiano',
    rateToCOP: 1,
    decimals: 0,
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Dólar USA',
    rateToCOP: 4200,
    decimals: 2,
  },
  MXN: {
    code: 'MXN',
    symbol: '$',
    name: 'Peso Mexicano',
    rateToCOP: 210,
    decimals: 0,
  },
};

// 25% discount when billed annually (equivalent to ~2-3 months free)
export const ANNUAL_DISCOUNT_PERCENT = 25;
export const ANNUAL_MULTIPLIER = 0.75;

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (code: CurrencyCode) => void;
  billingPeriod: BillingPeriod;
  setBillingPeriod: (period: BillingPeriod) => void;
  toggleBillingPeriod: () => void;
  formatAmount: (amountCOP: number | null | undefined, overridePeriod?: BillingPeriod) => string;
  formatRawValue: (amountCOP: number | null | undefined, overridePeriod?: BillingPeriod) => {
    formatted: string;
    value: number;
    currency: CurrencyCode;
    symbol: string;
    originalCOP: number;
  } | null;
  convertAmount: (amountCOP: number, overridePeriod?: BillingPeriod) => number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem('streambox_currency');
      if (saved === 'COP' || saved === 'USD' || saved === 'MXN') return saved;
    } catch {
      // ignore
    }
    return 'COP';
  });

  const [billingPeriod, setBillingPeriodState] = useState<BillingPeriod>(() => {
    try {
      const saved = localStorage.getItem('streambox_billing_period');
      if (saved === 'MONTHLY' || saved === 'ANNUAL') return saved;
    } catch {
      // ignore
    }
    return 'MONTHLY';
  });

  const setCurrency = (code: CurrencyCode) => {
    setCurrencyState(code);
    try {
      localStorage.setItem('streambox_currency', code);
    } catch {
      // ignore
    }
  };

  const setBillingPeriod = (period: BillingPeriod) => {
    setBillingPeriodState(period);
    try {
      localStorage.setItem('streambox_billing_period', period);
    } catch {
      // ignore
    }
  };

  const toggleBillingPeriod = () => {
    const next = billingPeriod === 'MONTHLY' ? 'ANNUAL' : 'MONTHLY';
    setBillingPeriod(next);
  };

  const convertAmount = (amountCOP: number, overridePeriod?: BillingPeriod): number => {
    const period = overridePeriod || billingPeriod;
    const cfg = CURRENCY_CONFIGS[currency];
    
    // Base conversion
    let converted = amountCOP / cfg.rateToCOP;

    // Annual discount calculation (if viewing annual price per month/equivalent)
    if (period === 'ANNUAL') {
      converted = converted * ANNUAL_MULTIPLIER;
    }

    return converted;
  };

  const formatAmount = (amountCOP: number | null | undefined, overridePeriod?: BillingPeriod): string => {
    if (amountCOP === null || amountCOP === undefined || isNaN(amountCOP)) {
      return 'Por verificar';
    }

    const period = overridePeriod || billingPeriod;
    const cfg = CURRENCY_CONFIGS[currency];
    const converted = convertAmount(amountCOP, period);

    let formattedNum: string;
    if (cfg.decimals > 0) {
      formattedNum = converted.toLocaleString(currency === 'USD' ? 'en-US' : 'es-CO', {
        minimumFractionDigits: cfg.decimals,
        maximumFractionDigits: cfg.decimals,
      });
    } else {
      formattedNum = Math.round(converted).toLocaleString('es-CO');
    }

    return `${cfg.symbol}${formattedNum} ${currency}`;
  };

  const formatRawValue = (amountCOP: number | null | undefined, overridePeriod?: BillingPeriod) => {
    if (amountCOP === null || amountCOP === undefined || isNaN(amountCOP)) return null;
    const period = overridePeriod || billingPeriod;
    const cfg = CURRENCY_CONFIGS[currency];
    const converted = convertAmount(amountCOP, period);

    return {
      formatted: formatAmount(amountCOP, period),
      value: converted,
      currency,
      symbol: cfg.symbol,
      originalCOP: amountCOP,
    };
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        billingPeriod,
        setBillingPeriod,
        toggleBillingPeriod,
        formatAmount,
        formatRawValue,
        convertAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

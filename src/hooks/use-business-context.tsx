
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
    products as demoProducts, 
    customers as demoCustomers,
    suppliers as demoSuppliers,
    sales as demoSales,
    accountsPayable as demoAccountsPayable,
    accountsReceivable as demoAccountsReceivable,
    paymentMethods as demoPaymentMethods,
    exchangeRates as demoExchangeRates,
    supplierRates as demoSupplierRates,
    cashMovements as demoCashMovements,
    businessCategories
} from '@/lib/placeholder-data';
import { Customer } from '@/lib/types';


type BusinessContextType = {
  isActivated: boolean;
  businessName: string;
  businessCategory: string;
  activateLicense: (name: string, category: string) => void;
  // This is just for the demo/simulated mode
  setBusinessCategory: (category: string) => void; 
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const [isActivated, setIsActivated] = useState(false);
  const [businessName, setBusinessName] = useState("Negocio de Demostración");
  const [businessCategory, setBusinessCategory] = useState<string>(businessCategories[0]);

  const activateLicense = (name: string, category: string) => {
    setIsActivated(true);
    setBusinessName(name);
    setBusinessCategory(category);
  };
  
  // This function is purely for the sidebar simulation before activation
  const handleSetCategoryForDemo = (category: string) => {
      if (!isActivated) {
          setBusinessCategory(category);
      }
  }

  return (
    <BusinessContext.Provider value={{ 
        isActivated, 
        businessName, 
        businessCategory,
        activateLicense,
        setBusinessCategory: handleSetCategoryForDemo
    }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusinessContext = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusinessContext must be used within a BusinessProvider');
  }
  return context;
};

// This is a simulation. In a real app, this logic would be handled by fetching data from a backend
// based on the authenticated user's license.
export const useData = () => {
    const { isActivated } = useBusinessContext();
    
    // In a real app, you would have a loading state here.
    const [data, setData] = useState({
        products: demoProducts,
        customers: demoCustomers,
        suppliers: demoSuppliers,
        sales: demoSales,
        accountsPayable: demoAccountsPayable,
        accountsReceivable: demoAccountsReceivable,
        paymentMethods: demoPaymentMethods,
        exchangeRates: demoExchangeRates,
        supplierRates: demoSupplierRates,
        cashMovements: demoCashMovements,
    });

    useEffect(() => {
        if (isActivated) {
            // If the license is activated, we simulate loading a clean slate.
            setData({
                products: [],
                customers: [],
                suppliers: [],
                sales: [],
                accountsPayable: [],
                accountsReceivable: [],
                paymentMethods: [],
                exchangeRates: [],
                supplierRates: [],
                cashMovements: [],
            });
        } else {
             // If not activated, use the demo data.
             setData({
                products: demoProducts,
                customers: demoCustomers,
                suppliers: demoSuppliers,
                sales: demoSales,
                accountsPayable: demoAccountsPayable,
                accountsReceivable: demoAccountsReceivable,
                paymentMethods: demoPaymentMethods,
                exchangeRates: demoExchangeRates,
                supplierRates: demoSupplierRates,
                cashMovements: demoCashMovements,
            });
        }
    }, [isActivated]);

    return data;
}

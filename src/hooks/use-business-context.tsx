
"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { businessCategories } from '@/lib/placeholder-data';

type BusinessContextType = {
  businessCategory: string;
  setBusinessCategory: (category: string) => void;
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const [businessCategory, setBusinessCategory] = useState<string>(businessCategories[0]);

  return (
    <BusinessContext.Provider value={{ businessCategory, setBusinessCategory }}>
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

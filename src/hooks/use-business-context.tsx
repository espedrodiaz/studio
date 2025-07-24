
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type UserData = {
    uid: string;
    fullName: string;
    businessName: string;
    businessCategory: string;
    rif: string;
    email: string | null;
    licenseKey: string;
    status: 'Trial' | 'Active' | 'Suspended' | 'Expired';
    createdAt: string;
    trialEndsAt: string;
    licenseExpiresAt?: string;
}

type BusinessContextType = {
  isLoading: boolean;
  user: User | null;
  userData: UserData | null;
  isLicenseInvalid: boolean;
  activateLicense: (licenseKey: string) => boolean; 
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLicenseInvalid, setIsLicenseInvalid] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setUser(user);
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);
          
          let licenseIsInvalid = false;
          if (data.status === 'Trial') {
            const trialEndDate = new Date(data.trialEndsAt);
            licenseIsInvalid = new Date() > trialEndDate;
          } else if (data.status === 'Active' && data.licenseExpiresAt) {
            const licenseEndDate = new Date(data.licenseExpiresAt);
            licenseIsInvalid = new Date() > licenseEndDate;
          } else if (data.status === 'Suspended' || data.status === 'Expired') {
             licenseIsInvalid = true;
          }
          setIsLicenseInvalid(licenseIsInvalid);

        } else {
            // User is authenticated but doesn't have a user document.
            // Create their document with placeholder data.
            const licenseKey = `FPV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            
            const newUserDocData: UserData = {
                uid: user.uid,
                fullName: user.displayName || "Usuario de Google",
                businessName: "Mi Negocio (Google)", // Placeholder
                businessCategory: "Otro", // Placeholder
                rif: "J-00000000-0", // Placeholder
                email: user.email,
                licenseKey,
                status: "Trial",
                createdAt: new Date().toISOString(),
                trialEndsAt: sevenDaysFromNow.toISOString(),
            };
            
            await setDoc(userDocRef, newUserDocData);
            setUserData(newUserDocData);
            setIsLicenseInvalid(false);
        }

      } else {
        setUser(null);
        setUserData(null);
        setIsLicenseInvalid(false);
        const publicRoutes = ['/login', '/signup', '/'];
        if (!publicRoutes.includes(window.location.pathname)) {
           router.push('/login');
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const activateLicense = (licenseKey: string): boolean => {
    if (userData && licenseKey === userData.licenseKey) {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        const updatedUserData: UserData = { 
            ...userData, 
            status: 'Active',
            licenseExpiresAt: oneYearFromNow.toISOString()
        };
        setUserData(updatedUserData); 
        setIsLicenseInvalid(false);
        
        const userDocRef = doc(db, "users", userData.uid);
        setDoc(userDocRef, { 
            status: 'Active',
            licenseExpiresAt: oneYearFromNow.toISOString()
        }, { merge: true });

        return true;
    }
    return false;
  };

  return (
    <BusinessContext.Provider value={{ 
        isLoading,
        user,
        userData,
        isLicenseInvalid: isLicenseInvalid,
        activateLicense,
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

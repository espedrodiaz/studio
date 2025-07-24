
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
    status: 'Trial' | 'Active' | 'Suspended' | 'Expired' | 'Pending Activation';
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
  createUserDataInFirestore: (user: User, data: { fullName: string, businessName: string, businessCategory: string, rif: string }) => Promise<void>;
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLicenseInvalid, setIsLicenseInvalid] = useState(false);
  const router = useRouter();

  const createUserDataInFirestore = async (user: User, data: { fullName: string, businessName: string, businessCategory: string, rif: string }) => {
    const userDocRef = doc(db, "users", user.uid);
    
    // Check if user is "espedrodiaz94@gmail.com" to assign specific data
    if (user.email === 'espedrodiaz94@gmail.com') {
      const glendaFamilyData = {
        id: 'USER005',
        uid: user.uid,
        fullName: 'Pedro Díaz',
        businessName: 'Glenda Family',
        businessCategory: 'Venta de Repuestos',
        rif: 'V-25695305',
        licenseKey: 'F4C1-L1T0-P05V-ZL41',
        status: 'Pending Activation',
        email: user.email,
        createdAt: new Date().toISOString(),
        trialEndsAt: new Date(0).toISOString(), // No trial
      };
      await setDoc(userDocRef, glendaFamilyData);
      return;
    }

    const licenseKey = `FPV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const newUserDocData: UserData = {
        uid: user.uid,
        fullName: data.fullName,
        businessName: data.businessName,
        businessCategory: data.businessCategory,
        rif: data.rif,
        email: user.email,
        licenseKey,
        status: "Trial",
        createdAt: new Date().toISOString(),
        trialEndsAt: sevenDaysFromNow.toISOString(),
    };
    await setDoc(userDocRef, newUserDocData);
  }

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
          } else if (data.status === 'Suspended' || data.status === 'Expired' || data.status === 'Pending Activation') {
             licenseIsInvalid = true;
          }
          setIsLicenseInvalid(licenseIsInvalid);

        } else {
          // This case handles new sign-ups, especially from Google, where user data is not yet in Firestore.
          // It's a "soft" state; we don't know their business details yet.
          // The form in signup page will handle creating the full document.
          // If a Google user lands on dashboard without data, we can prompt them.
          // For now, we will create a basic document and let them update it in settings.
           const sevenDaysFromNow = new Date();
           sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
           await createUserDataInFirestore(user, {
              fullName: user.displayName || "Nuevo Usuario",
              businessName: "Mi Negocio",
              businessCategory: "Otro",
              rif: "J-00000000-0"
           })
           // Re-fetch the newly created document
           const newUserDoc = await getDoc(userDocRef);
           if(newUserDoc.exists()){
             setUserData(newUserDoc.data() as UserData);
           }
           setIsLicenseInvalid(false); // They are in trial period.
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
        isLicenseInvalid,
        activateLicense,
        createUserDataInFirestore,
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

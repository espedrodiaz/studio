
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { clearDemoData } from '@/lib/placeholder-data';

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
  createUserDataInFirestore: (user: User, data?: Partial<{ fullName: string, businessName: string, businessCategory: string, rif: string }>) => Promise<void>;
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLicenseInvalid, setIsLicenseInvalid] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const createUserDataInFirestore = async (user: User, data: Partial<{ fullName: string, businessName: string, businessCategory: string, rif: string }> = {}) => {
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      return;
    }

    // If user does not exist, create new document
    const licenseKey = `FPV-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const newUserDocData: UserData = {
        uid: user.uid,
        fullName: data.fullName || user.displayName || "Nuevo Usuario",
        businessName: data.businessName || "Mi Negocio",
        businessCategory: data.businessCategory || "Otro",
        rif: data.rif || "J-00000000-0",
        email: user.email,
        licenseKey,
        status: "Trial",
        createdAt: new Date().toISOString(),
        trialEndsAt: sevenDaysFromNow.toISOString(),
    };
    
    // Specific override for admin/demo user
    if (user.email === 'espedrodiaz94@gmail.com') {
      newUserDocData.licenseKey = 'F4C1-L1T0-P05V-ZL41';
      newUserDocData.businessName = 'Glenda Family';
      newUserDocData.businessCategory = 'Venta de Repuestos';
      newUserDocData.fullName = 'Pedro Díaz';
      newUserDocData.rif = 'V-25695305';
      newUserDocData.status = 'Pending Activation';
    }
    
    await setDoc(userDocRef, newUserDocData);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setIsLoading(true);
      if (currentUser) {
        await createUserDataInFirestore(currentUser);
        
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUser(currentUser);
          setUserData(data);

          let licenseIsInvalid = false;
          if (data.status === 'Trial') {
              const trialEndDate = new Date(data.trialEndsAt);
              licenseIsInvalid = new Date() > trialEndDate;
          } else if (data.status === 'Active' && data.licenseExpiresAt) {
              const licenseEndDate = new Date(data.licenseExpiresAt);
              licenseIsInvalid = new Date() > licenseEndDate;
          } else if (['Suspended', 'Pending Activation', 'Expired'].includes(data.status)) {
              licenseIsInvalid = true;
          }
          setIsLicenseInvalid(licenseIsInvalid);
        } else {
            // This case might happen if firestore document creation failed
            setUser(null);
            setUserData(null);
            setIsLicenseInvalid(false);
        }

      } else {
        setUser(null);
        setUserData(null);
        setIsLicenseInvalid(false);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const publicRoutes = ['/login', '/signup', '/'];
    const isPublicRoute = publicRoutes.includes(pathname);

    if (!user && !isPublicRoute) {
        router.replace('/login');
    } else if (user && isPublicRoute) {
        router.replace('/dashboard');
    }

  }, [user, isLoading, pathname, router]);


  const activateLicense = (licenseKey: string): boolean => {
    if (userData && licenseKey === userData.licenseKey) {
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

        const updatedUserData: UserData = { 
            ...userData, 
            status: 'Active',
            licenseExpiresAt: oneYearFromNow.toISOString()
        };
        
        const userDocRef = doc(db, "users", userData.uid);
        setDoc(userDocRef, { 
            status: 'Active',
            licenseExpiresAt: oneYearFromNow.toISOString()
        }, { merge: true }).then(() => {
            setUserData(updatedUserData); 
            setIsLicenseInvalid(false);
            clearDemoData();
            window.location.reload();
        });

        return true;
    }
    return false;
  };

  const contextValue = {
    isLoading,
    user,
    userData,
    isLicenseInvalid,
    activateLicense,
    createUserDataInFirestore,
  };

  return (
    <BusinessContext.Provider value={contextValue}>
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

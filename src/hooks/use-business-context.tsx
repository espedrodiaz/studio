
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
  createUserDataInFirestore: (user: User, data: { fullName: string, businessName: string, businessCategory: string, rif: string }) => Promise<void>;
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLicenseInvalid, setIsLicenseInvalid] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const createUserDataInFirestore = async (user: User, data: { fullName: string, businessName: string, businessCategory: string, rif: string }) => {
    const userDocRef = doc(db, "users", user.uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
        console.log("User data already exists, merging new info.");
        await setDoc(userDocRef, {
            fullName: data.fullName || user.displayName || 'Usuario Existente',
            businessName: data.businessName || 'Negocio Existente',
            businessCategory: data.businessCategory || 'Otro',
            rif: data.rif || 'J-00000000-0',
            email: user.email,
        }, { merge: true });
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
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        let userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
           await createUserDataInFirestore(user, {
              fullName: user.displayName || "Nuevo Usuario",
              businessName: "Mi Negocio",
              businessCategory: "Otro",
              rif: "J-00000000-0"
           });
           userDoc = await getDoc(userDocRef);
        }

        const data = userDoc.data() as UserData;
        setUser(user);
        setUserData(data);

        let licenseIsInvalid = false;
        if (data.status === 'Trial') {
            const trialEndDate = new Date(data.trialEndsAt);
            licenseIsInvalid = new Date() > trialEndDate;
        } else if (data.status === 'Active' && data.licenseExpiresAt) {
            const licenseEndDate = new Date(data.licenseExpiresAt);
            licenseIsInvalid = new Date() > licenseEndDate;
        } else if (['Suspended', 'Pending Activation'].includes(data.status)) {
            licenseIsInvalid = true;
        }
        setIsLicenseInvalid(licenseIsInvalid);

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
        router.push('/login');
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
        setUserData(updatedUserData); 
        setIsLicenseInvalid(false);
        
        const userDocRef = doc(db, "users", userData.uid);
        setDoc(userDocRef, { 
            status: 'Active',
            licenseExpiresAt: oneYearFromNow.toISOString()
        }, { merge: true });

        clearDemoData();
        window.location.reload();

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

    
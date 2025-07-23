
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
    status: 'Trial' | 'Active' | 'Suspended';
    createdAt: string;
    trialEndsAt: string;
}

type BusinessContextType = {
  isLoading: boolean;
  user: User | null;
  userData: UserData | null;
  isTrialExpired: boolean;
  activateLicense: (licenseKey: string) => boolean; 
};

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export const BusinessProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTrialExpired, setIsTrialExpired] = useState(false);
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
          if (data.status !== 'Active') {
            const trialEndDate = new Date(data.trialEndsAt);
            setIsTrialExpired(new Date() > trialEndDate);
          } else {
            setIsTrialExpired(false);
          }
        } else {
            // User is authenticated (likely from Google Sign-In) but doesn't have a user document.
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
            setIsTrialExpired(false);
            // In a real app, you might redirect to a profile completion page here.
            // For now, they can edit it in settings.
        }

      } else {
        setUser(null);
        setUserData(null);
        setIsTrialExpired(false);
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
        // This is a simulation. A backend would update the doc and this client would get the update via a listener.
        const updatedUserData = { ...userData, status: 'Active' as 'Active' };
        setUserData(updatedUserData); 
        setIsTrialExpired(false);
        // In a real app, you would also update the document in Firestore.
        const userDocRef = doc(db, "users", userData.uid);
        setDoc(userDocRef, { status: 'Active' }, { merge: true });
        return true;
    }
    return false;
  };

  return (
    <BusinessContext.Provider value={{ 
        isLoading,
        user,
        userData,
        isTrialExpired,
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

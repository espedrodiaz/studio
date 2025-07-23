
"use client";

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

type UserData = {
    businessName: string;
    businessCategory: string;
    status: 'Trial' | 'Active' | 'Suspended';
    trialEndsAt: string;
    licenseKey: string;
}

type BusinessContextType = {
  isLoading: boolean;
  user: User | null;
  userData: UserData | null;
  isTrialExpired: boolean;
  activateLicense: (licenseKey: string) => boolean; // This is now a placeholder, real logic would be a backend call
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
        // Fetch user data from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data() as UserData;
          setUserData(data);

          // Check license and trial status
          if (data.status !== 'Active') {
            const trialEndDate = new Date(data.trialEndsAt);
            if (new Date() > trialEndDate) {
              setIsTrialExpired(true);
            } else {
              setIsTrialExpired(false);
            }
          } else {
              setIsTrialExpired(false);
          }
        } else {
            // This case might happen if a user is created in Auth but not in Firestore, e.g. Google Sign-in first time
            // Or if we need to log them out because their data is missing.
             setUserData(null);
             router.push('/login');
        }

      } else {
        setUser(null);
        setUserData(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const activateLicense = (licenseKey: string): boolean => {
    // In a REAL app, this would trigger a backend call (e.g., a Firebase Function)
    // to validate the key and update the user's status in Firestore.
    // For now, we simulate this.
    if (userData && licenseKey === userData.licenseKey) {
        // This is a simulation. A backend would update the doc and this client would get the update via a listener.
        const updatedUserData = { ...userData, status: 'Active' as 'Active' };
        setUserData(updatedUserData); 
        setIsTrialExpired(false);
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

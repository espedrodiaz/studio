
"use client";

import { useState, useEffect } from 'react';
import { useBusinessContext } from './use-business-context';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Product, Customer, Supplier, Sale, Account, PaymentMethod, ExchangeRate, SupplierRate, CashMovement } from '@/lib/types'; // Assuming you will create these types

// Define more specific types if needed, importing from a central types file is best practice
// For example, in src/lib/types.ts
// export type Product = { id: string, name: string, ... };

const useData = <T>(collectionName: string) => {
    const { user } = useBusinessContext();
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!user) {
            // If there's no user, we don't fetch data, maybe clear it.
            setData([]);
            setLoading(false);
            return;
        };

        const fetchData = async () => {
            setLoading(true);
            try {
                // All data collections will be structured with a 'userId' field to ensure data isolation.
                const q = query(collection(db, collectionName), where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);
                const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
                setData(items);
            } catch (err: any) {
                setError(err);
                console.error(`Error fetching ${collectionName}:`, err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

    }, [user, collectionName]); // Re-fetch when user or collectionName changes

    // We can also return functions to add, update, delete data
    // For simplicity, this is left out for now but would be added here.
    // e.g., const addDocument = async (newData) => { ... }

    return { data, loading, error };
};

export default useData;



export type Vehicle = {
    brand: string;
    model: string;
    engine: string;
    year: number | string;
};

export type Customer = {
    id: string;
    name: string;
    idNumber: string;
    address: string;
    phone: string;
    secondaryPhone?: string;
    vehicles: Vehicle[];
};

export type Product = {
    id: string;
    name: string;
    ref: string;
    model: string;
    longDescription: string;
    stock: number;
    purchasePrice: number;
    salePrice: number;
    categoryId: string;
    brandId: string;
    location: string;
};

export type CartItem = Product & { quantity: number; salePrice: number };

export type SalePayment = {
    methodId: string;
    amount: number;
    method?: {
        name: string;
        currency: string;
    }
};

export type Sale = {
    id: string;
    date: string;
    customer: string;
    total: number;
    status: 'Pagada' | 'Anulada';
    items: {
        productId: string;
        name: string;
        quantity: number;
        price: number;
    }[];
    payments: { methodId: string, amount: number }[];
    changeGiven: { methodId: string, amount: number }[];
    customerData?: Customer | null;
};

// Type for the Digital Ticket component props
export type SaleDataForTicket = {
    id: string;
    date: string;
    customer: Customer | null;
    items: CartItem[];
    subtotal: number;
    payments: { method?: { name: string; currency: string; }; amount: number }[];
    totalPaid: number;
    changeGiven: { method?: { name: string; currency: string; }; amount: number }[];
    totalChange: number;
};
    
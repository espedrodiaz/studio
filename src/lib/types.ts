

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
    

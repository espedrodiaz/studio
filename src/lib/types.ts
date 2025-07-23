
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

    
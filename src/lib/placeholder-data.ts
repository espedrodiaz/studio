

import { Customer, Product, Sale } from "./types";

// A simple in-memory pub/sub system for real-time rate updates across components.
// In a real app, this would be replaced by a state management library like Redux or Zustand.
type Subscriber = (rate: number) => void;

const createSubject = () => {
  let subscribers: Subscriber[] = [];
  return {
    subscribe: (callback: Subscriber) => {
      subscribers.push(callback);
      return {
        unsubscribe: () => {
          subscribers = subscribers.filter(s => s !== callback);
        }
      };
    },
    next: (data: number) => {
      subscribers.forEach(callback => callback(data));
    }
  };
};

export const bcvRateSubject = createSubject();

export const businessCategories = [
    "Abastos y Bodegas",
    "Restaurantes y Cafés",
    "Farmacias",
    "Ferreterías",
    "Tiendas de Ropa y Accesorios",
    "Servicios Profesionales",
    "Venta de Repuestos",
    "Supermercados",
    "Panaderías y Pastelerías",
    "Otro",
];


export let products: Product[] = [
  { 
    id: 'PROD001', 
    name: 'Café Molido 500g', 
    ref: 'CAFE-G-500',
    model: 'Gourmet',
    longDescription: 'Café de variedad arábica, tostado oscuro y molido finamente.',
    stock: 150, 
    purchasePrice: 4.50, 
    salePrice: 7.00, 
    categoryId: 'cat-03', 
    brandId: 'brand-02',
    location: 'Estante A1'
  },
  { 
    id: 'PROD002', 
    name: 'Harina de Maíz 1kg', 
    ref: 'HAR-PAN-1KG',
    model: 'Precocida',
    longDescription: 'Harina de maíz blanco precocida, ideal para arepas y empanadas.',
    stock: 200, 
    purchasePrice: 0.80, 
    salePrice: 1.50, 
    categoryId: 'cat-01', 
    brandId: 'brand-01',
    location: 'Estante A2'
  },
  { 
    id: 'PROD003', 
    name: 'Arroz Blanco 1kg', 
    ref: 'ARR-MARY-1KG',
    model: 'Tipo I',
    longDescription: 'Arroz de grano entero tipo I, seleccionado para una cocción perfecta.',
    stock: 180, 
    purchasePrice: 1.00, 
    salePrice: 1.80, 
    categoryId: 'cat-01', 
    brandId: 'brand-03',
    location: 'Estante A2'
  },
  { 
    id: 'PROD004', 
    name: 'Pasta Larga 500g', 
    ref: 'PASTA-MARY-500',
    model: 'Spaghetti',
    longDescription: 'Pasta de sémola de trigo durum, perfecta para cualquier salsa.',
    stock: 120, 
    purchasePrice: 0.90, 
    salePrice: 1.60, 
    categoryId: 'cat-01', 
    brandId: 'brand-03',
    location: 'Estante B1'
  },
  { 
    id: 'PROD005', 
    name: 'Aceite de Girasol 1L', 
    ref: 'ACE-VAT-1L',
    model: 'Mezcla',
    longDescription: 'Aceite de girasol y soya, ideal para freir y cocinar.',
    stock: 90, 
    purchasePrice: 2.50, 
    salePrice: 4.00, 
    categoryId: 'cat-02', 
    brandId: 'brand-04',
    location: 'Estante B3'
  },
  { 
    id: 'PROD006', 
    name: 'Azúcar Refinada 1kg', 
    ref: 'AZUC-MONT-1KG',
    model: 'Refinada',
    longDescription: 'Azúcar de caña blanca refinada de alta pureza.',
    stock: 250, 
    purchasePrice: 1.10, 
    salePrice: 2.00, 
    categoryId: 'cat-01', 
    brandId: 'brand-05',
    location: 'Estante A1'
  },
];

export const customers: Customer[] = [
  { 
    id: 'CUST001', 
    name: 'Ana Pérez', 
    idNumber: 'V-12345678', 
    address: 'Av. Libertador, Edif. Miranda, Apto. 10A, Caracas', 
    phone: '0414-1234567',
    vehicles: [
        { brand: 'Toyota', model: 'Corolla', engine: '1.8L', year: 2021 }
    ]
  },
  { 
    id: 'CUST002', 
    name: 'Carlos Gómez', 
    idNumber: 'V-87654321', 
    address: 'Calle El Sol, Casa #5, Maracaibo', 
    phone: '0412-8765432',
    vehicles: []
  },
  { 
    id: 'CUST003', 
    name: 'María Rodríguez', 
    idNumber: 'V-11223344', 
    address: 'Urb. Las Acacias, Qta. "La Nuestra", Valencia', 
    phone: '0424-1122334',
    vehicles: [
        { brand: 'Ford', model: 'Fiesta', engine: '1.6L', year: 2018 },
        { brand: 'Chevrolet', model: 'Aveo', engine: '1.6L', year: 2015 }
    ]
  },
  { 
    id: 'CUST004', 
    name: 'Luis Hernández', 
    idNumber: 'E-55667788', 
    address: 'Av. Bolívar Norte, C.C. Global, Local 55, Barquisimeto', 
    phone: '0416-5566778',
    vehicles: []
  },
];

export const suppliers = [
  { id: 'SUP001', name: 'Distribuidora Alimentos Polar', contact: 'Juan González', phone: '0212-2027111' },
  { id: 'SUP002', name: 'Café Fama de América C.A.', contact: 'Beatriz Rivas', phone: '0212-9915555' },
  { id: 'SUP003', name: 'Inversiones Primor', contact: 'Ricardo Solis', phone: '0241-8745011' },
];

export let sales: Sale[] = [
  { id: 'SALE001', date: '2024-07-29T10:00:00Z', customer: 'Ana Pérez', total: 10.00, status: 'Pagada', items: [{ productId: 'PROD001', name: 'Café Molido 500g', quantity: 1, price: 7.00}, { productId: 'PROD002', name: 'Harina de Maíz 1kg', quantity: 2, price: 1.50}], payments: [{ methodId: 'pay-01', amount: 10}], changeGiven: [], customerData: customers.find(c => c.name === 'Ana Pérez'), bcvRate: 40.50 },
  { id: 'SALE002', date: '2024-07-29T14:30:00Z', customer: 'Carlos Gómez', total: 25.50, status: 'Pagada', items: [{ productId: 'PROD005', name: 'Aceite de Girasol 1L', quantity: 5, price: 4.00}, {productId: 'PROD006', name: 'Azúcar Refinada 1kg', quantity: 2, price: 2.00}, {productId: 'PROD002', name: 'Harina de Maíz 1kg', quantity: 1, price: 1.50}], payments: [{ methodId: 'pay-03', amount: 25.50}], changeGiven: [], customerData: customers.find(c => c.name === 'Carlos Gómez'), bcvRate: 40.50 },
  { id: 'SALE003', date: '2024-07-28T11:20:00Z', customer: 'María Rodríguez', total: 5.40, status: 'Pagada', items: [{productId: 'PROD004', name: 'Pasta Larga 500g', quantity: 3, price: 1.80}], payments: [{ methodId: 'pay-02', amount: 216 }], changeGiven: [], customerData: customers.find(c => c.name === 'María Rodríguez'), bcvRate: 40.00 },
  { id: 'SALE004', date: '2024-07-28T09:05:00Z', customer: 'Cliente Ocasional', total: 12.80, status: 'Pagada', items: [{productId: 'PROD003', name: 'Arroz Blanco 1kg', quantity: 4, price: 1.80}, {productId: 'PROD005', name: 'Aceite de Girasol 1L', quantity: 2, price: 2.80}], payments: [{ methodId: 'pay-04', amount: 512 }], changeGiven: [], customerData: null, bcvRate: 40.00 },
  { id: 'SALE005', date: '2024-07-27T16:45:00Z', customer: 'Ana Pérez', total: 7.00, status: 'Pagada', items: [{ productId: 'PROD001', name: 'Café Molido 500g', quantity: 1, price: 7.00}], payments: [{ methodId: 'pay-01', amount: 10}], changeGiven: [{ methodId: 'pay-01', amount: 3}], customerData: customers.find(c => c.name === 'Ana Pérez'), bcvRate: 39.80 },
  { id: 'SALE006', date: '2024-06-20T16:45:00Z', customer: 'Luis Hernández', total: 50.00, status: 'Pagada', items: [{ productId: 'PROD006', name: 'Azúcar Refinada 1kg', quantity: 25, price: 2.00}], payments: [{ methodId: 'pay-01', amount: 50}], changeGiven: [], customerData: customers.find(c => c.name === 'Luis Hernández'), bcvRate: 38.00 },
  { id: 'SALE007', date: '2024-07-29T18:00:00Z', customer: 'Luis Hernández', total: 50.00, status: 'Pagada', items: [{ productId: 'PROD006', name: 'Azúcar Refinada 1kg', quantity: 25, price: 2.00}], payments: [{ methodId: 'pay-02', amount: 810 }, { methodId: 'pay-04', amount: 405 }, { methodId: 'pay-05', amount: 810 }], changeGiven: [], customerData: customers.find(c => c.name === 'Luis Hernández'), bcvRate: 40.50 },
];

type SaleInput = Omit<Sale, 'id' | 'date'>;

export const addSale = (sale: SaleInput) => {
    const newSale = {
        ...sale,
        id: `SALE${new Date().getTime()}`,
        date: new Date().toISOString(),
    };
    sales.unshift(newSale); // Add to the beginning of the array
    return newSale;
}

export const voidSale = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    if (sale) {
        sale.status = 'Anulada';
        // In a real app, you would also revert inventory and financial records.
        // For this placeholder, we just update the status.
        console.log(`Sale ${saleId} has been voided.`);
        // Simulate returning items to stock
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                product.stock += item.quantity;
                console.log(`Returned ${item.quantity} of ${product.name} to stock.`);
            }
        });
    }
    return sale;
}


export const accountsPayable = [
    { id: 'AP001', supplier: 'Distribuidora Alimentos Polar', amount: 1500.00, dueDate: '2024-08-15', status: 'Pendiente' },
    { id: 'AP002', supplier: 'Café Fama de América C.A.', amount: 850.50, dueDate: '2024-08-10', status: 'Pendiente' },
    { id: 'AP003', supplier: 'Inversiones Primor', amount: 2200.00, dueDate: '2024-07-30', status: 'Pagada' },
];

export const accountsReceivable = [
    { id: 'AR001', customer: 'María Rodríguez', amount: 5.40, dueDate: '2024-08-05', status: 'Pendiente' },
    { id: 'AR002', customer: 'Constructora XYZ', amount: 350.00, dueDate: '2024-08-20', status: 'Pendiente' },
];

export let paymentMethods = [
    { id: 'pay-01', name: 'Efectivo USD', currency: '$', type: 'Efectivo', givesChange: true, managesOpeningBalance: true },
    { id: 'pay-02', name: 'Efectivo VES', currency: 'Bs', type: 'Efectivo', givesChange: true, managesOpeningBalance: true },
    { id: 'pay-03', name: 'Zelle', currency: '$', type: 'Digital', givesChange: false, managesOpeningBalance: false },
    { id: 'pay-04', name: 'Pago Móvil', currency: 'Bs', type: 'Digital', givesChange: false, managesOpeningBalance: false },
    { id: 'pay-05', name: 'Tarjeta', currency: 'Bs', type: 'Digital', givesChange: false, managesOpeningBalance: false },
    { id: 'pay-06', name: 'Crédito', currency: '$', type: 'Digital', givesChange: false, managesOpeningBalance: false },
];

export const getPaymentMethods = () => [...paymentMethods];

export const addPaymentMethod = (method: Omit<typeof paymentMethods[0], 'id'>) => {
    const newMethod = { ...method, id: `pay-${new Date().getTime()}`};
    paymentMethods.push(newMethod);
    return newMethod;
}

export const updatePaymentMethod = (id: string, updates: Partial<Omit<typeof paymentMethods[0], 'id'>>) => {
    let methodToUpdate = paymentMethods.find(m => m.id === id);
    if(methodToUpdate) {
        Object.assign(methodToUpdate, updates);
    }
    return methodToUpdate;
}

export const deletePaymentMethod = (id: string) => {
    paymentMethods = paymentMethods.filter(m => m.id !== id);
}


export let exchangeRates = [
    { id: 'RATE003', date: '2024-07-29T09:00:00.000Z', rate: 40.50 },
    { id: 'RATE002', date: '2024-07-28T09:05:00.000Z', rate: 40.00 },
    { id: 'RATE001', date: '2024-07-27T08:55:00.000Z', rate: 39.80 },
];

let currentBcvRate = [...exchangeRates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

export const getCurrentBcvRate = () => {
    return currentBcvRate?.rate || 0;
}

export const updateCurrentBcvRate = (newRate: Partial<typeof exchangeRates[0]>) => {
    if (newRate.rate) {
        currentBcvRate = { ...currentBcvRate, ...newRate };
    }
    if (newRate.id && !exchangeRates.find(r => r.id === newRate.id)) {
        exchangeRates.push(newRate as typeof exchangeRates[0]);
    }
    bcvRateSubject.next(currentBcvRate.rate);
};

// Supplier Rates
export let supplierRates = [
    { id: 'SRATE001', name: 'Proveedor A', rate: 41.50, lastUpdated: '2024-07-25T10:00:00.000Z' },
    { id: 'SRATE002', name: 'Proveedor B (Importación)', rate: 40.80, lastUpdated: '2024-07-24T15:30:00.000Z' },
];

export const addSupplierRate = (rate: {name: string, rate: number}) => {
    const newRate = {
        id: `SRATE${new Date().getTime()}`,
        ...rate,
        lastUpdated: new Date().toISOString()
    };
    supplierRates.push(newRate);
    return newRate;
}

export const updateSupplierRate = (id: string, updates: {name: string, rate: number}) => {
    let rateToUpdate = supplierRates.find(r => r.id === id);
    if (rateToUpdate) {
        rateToUpdate.name = updates.name;
        rateToUpdate.rate = updates.rate;
        rateToUpdate.lastUpdated = new Date().toISOString();
    }
    return rateToUpdate;
}

export const deleteSupplierRate = (id: string) => {
    supplierRates = supplierRates.filter(r => r.id !== id);
}

// Cash Drawer Movements
export let cashMovements = [
    { id: 'CM001', date: '2024-07-25T11:00:00.000Z', type: 'Salida', amount: 20, paymentMethodId: 'pay-01', concept: 'Pago a proveedor de limpieza' }
];

type CashMovement = Omit<typeof cashMovements[0], 'id' | 'date'>;

export const addCashMovement = (movement: CashMovement) => {
    const newMovement = { 
        ...movement,
        id: `CM${new Date().getTime()}`,
        date: new Date().toISOString()
    };
    cashMovements.push(newMovement);
    return newMovement;
}

// Registered Users for Admin View
export type RegisteredUser = {
    id: string;
    fullName: string;
    businessName: string;
    businessCategory: string;
    rif: string;
    licenseKey: string;
    status: 'Pending Activation' | 'Active' | 'Suspended';
}

let registeredUsers: RegisteredUser[] = [
    { id: 'USER001', fullName: 'Pedro Pascal', businessName: 'Bodega La Bendición', businessCategory: 'Abastos y Bodegas', rif: 'J-12345678-9', licenseKey: 'AAAA-BBBB-CCCC-DDDD', status: 'Pending Activation' },
    { id: 'USER002', fullName: 'Isabella Castillo', businessName: 'Restaurante El Rincón del Sabor', businessCategory: 'Restaurantes y Cafés', rif: 'J-98765432-1', licenseKey: 'EEEE-FFFF-GGGG-HHHH', status: 'Active' },
    { id: 'USER003', fullName: 'Ricardo Mendoza', businessName: 'Auto Partes El Piston', businessCategory: 'Venta de Repuestos', rif: 'J-11223344-5', licenseKey: 'IIII-JJJJ-KKKK-LLLL', status: 'Suspended' },
    { id: 'USER004', fullName: 'Carolina Herrera', businessName: 'Boutique CHic', businessCategory: 'Tiendas de Ropa y Accesorios', rif: 'J-55667788-9', licenseKey: 'MMMM-NNNN-OOOO-PPPP', status: 'Active' },
];

export const getRegisteredUsers = () => [...registeredUsers];

export const updateUserStatus = (userId: string, status: 'Active' | 'Suspended') => {
    const user = registeredUsers.find(u => u.id === userId);
    if (user) {
        user.status = status;
    }
}

export const deleteUser = (userId: string) => {
    registeredUsers = registeredUsers.filter(u => u.id !== userId);
}


// Categories
export let categories = [
    { id: 'cat-01', name: 'Alimentos Secos' },
    { id: 'cat-02', name: 'Aceites y Grasas' },
    { id: 'cat-03', name: 'Bebidas' },
    { id: 'cat-04', name: 'Lácteos' },
];

// Brands
export let brands = [
    { id: 'brand-01', name: 'P.A.N.' },
    { id: 'brand-02', name: 'Fama de América' },
    { id: 'brand-03', name: 'Mary' },
    { id: 'brand-04', name: 'Vatel' },
    { id: 'brand-05', name: 'Montalbán' },
];


// Inventory Movements History
export const getInventoryMovements = () => [
    { id: 'IM001', date: '2024-07-26T10:00:00Z', product: 'Harina de Maíz 1kg', type: 'Entrada por Compra', quantityChange: 50, finalStock: 200, user: 'Admin' },
    { id: 'IM002', date: '2024-07-26T14:30:00Z', product: 'Café Molido 500g', type: 'Salida por Venta', quantityChange: -2, finalStock: 150, user: 'Cajero 1' },
    { id: 'IM003', date: '2024-07-25T09:15:00Z', product: 'Aceite de Girasol 1L', type: 'Ajuste por Reconteo', quantityChange: -1, finalStock: 90, user: 'Admin' },
    { id: 'IM004', date: '2024-07-25T18:00:00Z', product: 'Arroz Blanco 1kg', type: 'Salida por Venta', quantityChange: -5, finalStock: 180, user: 'Cajero 1' },
];

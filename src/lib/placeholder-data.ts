
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


export let products = [
  { id: 'PROD001', name: 'Café Molido 500g', stock: 150, purchasePrice: 4.50, salePrice: 7.00 },
  { id: 'PROD002', name: 'Harina de Maíz 1kg', stock: 200, purchasePrice: 0.80, salePrice: 1.50 },
  { id: 'PROD003', name: 'Arroz Blanco 1kg', stock: 180, purchasePrice: 1.00, salePrice: 1.80 },
  { id: 'PROD004', name: 'Pasta Larga 500g', stock: 120, purchasePrice: 0.90, salePrice: 1.60 },
  { id: 'PROD005', name: 'Aceite de Girasol 1L', stock: 90, purchasePrice: 2.50, salePrice: 4.00 },
  { id: 'PROD006', name: 'Azúcar Refinada 1kg', stock: 250, purchasePrice: 1.10, salePrice: 2.00 },
];

export const customers = [
  { id: 'CUST001', name: 'Ana Pérez', idNumber: 'V-12345678', email: 'ana.perez@email.com', phone: '0414-1234567' },
  { id: 'CUST002', name: 'Carlos Gómez', idNumber: 'V-87654321', email: 'carlos.gomez@email.com', phone: '0412-8765432' },
  { id: 'CUST003', name: 'María Rodríguez', idNumber: 'V-11223344', email: 'maria.r@email.com', phone: '0424-1122334' },
  { id: 'CUST004', name: 'Luis Hernández', idNumber: 'E-55667788', email: 'luis.h@email.com', phone: '0416-5566778' },
];

export const suppliers = [
  { id: 'SUP001', name: 'Distribuidora Alimentos Polar', contact: 'Juan González', phone: '0212-2027111' },
  { id: 'SUP002', name: 'Café Fama de América C.A.', contact: 'Beatriz Rivas', phone: '0212-9915555' },
  { id: 'SUP003', name: 'Inversiones Primor', contact: 'Ricardo Solis', phone: '0241-8745011' },
];

export const sales = [
  { id: 'SALE001', date: '2024-07-20T10:00:00.000Z', customer: 'Ana Pérez', total: 10.00, status: 'Pagada' },
  { id: 'SALE002', date: '2024-07-20T14:30:00.000Z', customer: 'Carlos Gómez', total: 25.50, status: 'Pagada' },
  { id: 'SALE003', date: '2024-07-21T11:20:00.000Z', customer: 'María Rodríguez', total: 5.40, status: 'Pendiente' },
  { id: 'SALE004', date: '2024-07-22T09:05:00.000Z', customer: 'Cliente Ocasional', total: 12.80, status: 'Pagada' },
  { id: 'SALE005', date: '2024-07-22T16:45:00.000Z', customer: 'Ana Pérez', total: 7.00, status: 'Pagada' },
];

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
    { id: 'pay-01', name: 'Efectivo USD', currency: '$', type: 'Efectivo', givesChange: true },
    { id: 'pay-02', name: 'Efectivo VES', currency: 'Bs', type: 'Efectivo', givesChange: true },
    { id: 'pay-03', name: 'Zelle', currency: '$', type: 'Digital', givesChange: false },
    { id: 'pay-04', name: 'Pago Móvil', currency: 'Bs', type: 'Digital', givesChange: false },
    { id: 'pay-05', name: 'Punto de Venta', currency: 'Bs', type: 'Digital', givesChange: false },
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
    { id: 'RATE003', date: '2024-07-25T09:00:00.000Z', rate: 100.00 },
    { id: 'RATE002', date: '2024-07-24T09:05:00.000Z', rate: 98.50 },
    { id: 'RATE001', date: '2024-07-23T08:55:00.000Z', rate: 99.20 },
];

let currentBcvRate = [...exchangeRates].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

export const getCurrentBcvRate = () => {
    return currentBcvRate.rate || 0;
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
    { id: 'SRATE001', name: 'Proveedor A', rate: 101.50, lastUpdated: '2024-07-25T10:00:00.000Z' },
    { id: 'SRATE002', name: 'Proveedor B (Importación)', rate: 99.80, lastUpdated: '2024-07-24T15:30:00.000Z' },
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

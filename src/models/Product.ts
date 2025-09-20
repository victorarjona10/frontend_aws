export interface Product {
  _id: string;
  name: string;
  rating: number;
  description: string;
  price: number;
  available?: boolean;
  image?: string;
  category?: string;
  stock?: number;
  quantity: number; // Añadido para la gestión de cantidades en el carrito
  companyId: string; // Añadido para la gestión de productos por empresa
}

export interface IProduct {
  _id?: string;
  name: string;
  rating?: number;
  description: string;
  price: number;
  available?: boolean;
  image?: string;
  category?: string;
  stock?: number;
  quantity?: number; // Añadido para la gestión de cantidades en el carrito
  companyId: string; // Añadido para la gestión de productos por empresa
}

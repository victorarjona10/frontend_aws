

// Definición de la interfaz IPedido
export interface IOrder {
  _id: string;
  user_id: string;
  products: {
    product_id:{
      _id: string;
      name: string;
      description: string;
      price: number;
      image: string;
      category: string;
      stock: number;
    }
    quantity: number;
    //unit_price: number;
  }[];
  company_id: string;
  orderDate: Date;
  status: string;
}


export interface Order{
  _id?: string;
  user_id: string;
  products: {
      product_id: string;  
      quantity: number;
    //unit_price: number;
  }[];
  orderDate: string;
  status: string;
  company_id: string;
}
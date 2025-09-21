import { IOrder, Order } from '../models/Order';
import api from './axiosInstance';

const apiURL = '/api/orders';

export const getOrdersByUserId = async (userId: string): Promise<IOrder[]> => {
  try {
    const response = await api.get(`${apiURL}/AllOrdersByUser/${userId}`);

    if (response.status !== 200) {
      throw new Error('Failed to fetch orders');
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const createOrder = async (order: Order): Promise<IOrder> => {
  try {
    const response = await api.post(apiURL, order);
    if (response.status !== 200) {
      throw new Error('Failed to create order');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const GetAllCompanyOrders = async (
  companyId: string,
): Promise<Order[]> => {
  try {
    const response = await api.get<Order[]>(
      `${apiURL}/AllOrdersByCompany/${companyId}`,
    );

    if (response.status !== 200) {
      throw new Error('Failed to get company orders');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting company orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
): Promise<IOrder> => {
  try {
    const response = await api.put<IOrder>(
      `${apiURL}/updateStatus/${orderId}`,
      { status },
    );
    if (response.status !== 200) {
      throw new Error('Failed to update order status');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

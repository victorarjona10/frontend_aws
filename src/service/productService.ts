import { I } from 'framer-motion/dist/types.d-DDSxwf0n';
import { IProduct } from '../models/Product';
import api from './axiosInstance';

const apiURL = 'http://miapi:40000/api/products';
export const CreateProduct = async (
  productData: IProduct,
): Promise<IProduct> => {
  try {
    const completeProductData = {
      ...productData,
      rating: 0,
      image: '',
      category: '',
      stock: 0,
      quantity: 0,
    };

    const response = await api.post(`${apiURL}`, completeProductData);

    if (response.status !== 201 && response.status !== 200) {
      throw new Error('Failed to create product');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (
  productId: string,
  productData: IProduct,
): Promise<IProduct> => {
  try {
    const response = await api.put<IProduct>(
      `${apiURL}/${productId}`,
      productData,
    );

    if (response.status !== 200) {
      throw new Error('Failed to update product');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

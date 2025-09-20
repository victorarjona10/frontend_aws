import { Company } from '../models/Company';
import api from './axiosInstance';
import { Product } from '../models/Product';
import { IReview } from '../models/Review';
import { Order } from '../models/Order';

const apiURL = 'http://localhost:40000/api/company';

export const GetAllCompanies = async (): Promise<Company[]> => {
  try {
    const response = await api.get<Company[]>(`${apiURL}`);
    console.log(response.data);
    if (response.status !== 200) {
      throw new Error('Failed to getCompanies');
    }
    return response.data; // Devuelve los datos del usuario
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

export const UpdateCompanyById = async (
  companyId: string,
  companyData: any,
): Promise<Company> => {
  try {
    const response = await api.put(`${apiURL}/${companyId}`, companyData);

    if (response.status !== 200) {
      throw new Error('Failed to update company');
    }

    return response.data;
  } catch (error: any) {
    // Manejar error específico de email duplicado
    if (
      error.response &&
      error.response.data &&
      error.response.data.message === 'El email ya está registrado'
    ) {
      throw new Error('El email ya está registrado');
    }
    console.error('Error updating company:', error);
    throw error;
  }
};

export const CreateProduct = async (productData: any): Promise<Product> => {
  try {
    const completeProductData = {
      ...productData,
      rating: 0, // Añadir el rating como campo con valor 0
    };
    const response = await api.post(
      `http://localhost:40000/api/products`,
      completeProductData,
    );

    if (response.status !== 201 && response.status !== 200) {
      throw new Error('Failed to create product');
    }

    return response.data;
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const GetCompanyById = async (id: string): Promise<Company> => {
  try {
    const response = await api.get<Company>(`${apiURL}/${id}/products`);
    if (response.status !== 200) {
      throw new Error('Failed to getCompanyById');
    }
    return response.data; // Devuelve los datos del usuario
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

// Función para añadir un producto a una empresa
export const AddProductToCompany = async (
  companyId: string,
  productId: string,
): Promise<Company> => {
  try {
    const response = await api.put(`${apiURL}/${companyId}/addProduct`, {
      productId,
    });

    if (response.status !== 200) {
      throw new Error('Failed to add product to company');
    }

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error('Error adding product to company:', error);
    throw error;
  }
};

export const GetUserCompanies = async (userId: string): Promise<Company[]> => {
  try {
    // NOTA: Aquí está la URL que podría necesitar corrección
    // Debería ser /api/users/companies/:id o /api/companies/:id según tu backend
    const response = await api.get<Company[]>(
      `http://localhost:40000/api/users/companies/${userId}`,
    );

    if (response.status !== 200) {
      throw new Error('Failed to get user companies');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting user companies:', error);
    throw error;
  }
};

export const RateCompany = async (
  companyId: string,
  rating: number,
): Promise<Company> => {
  try {
    const response = await api.put<Company>(`${apiURL}/rate/${companyId}`, {
      rating,
    });
    if (response.status !== 200) {
      throw new Error('Failed to rate company');
    }
    return response.data; // Devuelve los datos del usuario
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

export const ReviewCompany = async (review: IReview): Promise<IReview> => {
  try {
    const response = await api.post<IReview>(
      `${apiURL}/review/${review.company_id}`,
      { review },
    );
    if (response.status !== 200) {
      throw new Error('Failed to review company');
    }
    return response.data; // Devuelve los datos del usuario
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

export const getCompanyReviews = async (
  companyId: string,
): Promise<IReview[]> => {
  try {
    const response = await api.get<IReview[]>(`${apiURL}/reviews/${companyId}`);
    if (response.status !== 200) {
      throw new Error('Failed to get company reviews');
    }
    return response.data;
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

export const AddCompany = async (companyData: any): Promise<Company> => {
  try {
    const response = await api.post<Company>(`${apiURL}`, companyData);
    if (response.status !== 200) {
      throw new Error('Failed to add company');
    }
    return response.data; // Devuelve los datos del usuario
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

export const LoginCompany = async (
  email: string,
  password: string,
): Promise<Company> => {
  try {
    console.log('Logging in company with email:', email);
    console.log('Logging in company with password:', password);
    const response = await api.post(`${apiURL}/login`, {
      email,
      password,
    });

    if (response.status !== 200) {
      throw new Error('Failed to login');
    }

    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    console.error('Error logging in company:', error);
    throw error;
  }
};

export const getCompanyByName = async (
  companyName: string,
): Promise<Company[]> => {
  try {
    const response = await api.get<Company[]>(
      `${apiURL}/search/${companyName}`,
    );
    if (response.status !== 200) {
      throw new Error('Failed to get company reviews');
    }
    return response.data;
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

export const getCompanyByNameWithCoord = async (
  companyName: string,
  lat?: number,
  lng?: number,
): Promise<Company[]> => {
  try {
    // Añade lat/lng como query params si existen
    let url = `${apiURL}/coordinatescompanies/${companyName}`;
    if (lat !== undefined && lng !== undefined) {
      url += `?lat=${lat}&lng=${lng}`;
    }
    const response = await api.get<Company[]>(url);
    if (response.status !== 200) {
      throw new Error('Failed to get company reviews');
    }
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

export const getCompanyByProductName = async (
  productName: string,
): Promise<Company[]> => {
  try {
    const response = await api.get<Company[]>(
      `${apiURL}/searchProduct/${productName}`,
    );
    if (response.status !== 200) {
      throw new Error('Failed to get company reviews');
    }
    return response.data;
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

export const UpdateCompanyProfilePicture = async (
  email: string,
  avatar: string,
): Promise<{ user: Company }> => {
  try {
    const response = await api.put(`${apiURL}/updateCompanyAvatar`, {
      email,
      avatar,
    });

    if (response.status !== 200) {
      throw new Error('Failed to update avatar');
    }

    return response.data;
  } catch (error) {
    console.error('Error updateing avatar:', error);
    throw error;
  }
};

export const GetPendingOrders = async (companyId: string): Promise<Order[]> => {
  try {
    const response = await api.get<Order[]>(
      `${apiURL}/PendingOrders/${companyId}`,
    );

    if (response.status !== 200) {
      throw new Error('Failed to get pending orders');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting pending orders:', error);
    throw error;
  }
};

export const putCompanyPhoto = async (
  companyId: string,
  photo: string,
): Promise<Company> => {
  try {
    const response = await api.put<Company>(
      `${apiURL}/putCompanyPhoto/${companyId}`,
      { photo },
    );
    if (response.status !== 200) {
      throw new Error('Failed to put company photo');
    }
    return response.data; // Devuelve los datos del usuario
  } catch (error) {
    console.error('Error', error);
    throw error;
  }
};

export const updateCompanyPhotos = async (
  companyId: string,
  photos: string[],
) => {
  return api.put(`${apiURL}/updateCompanyPhotos/${companyId}`, { photos });
};

//funcion para obtener las compañias que sigue un usuario
export const getFollowersCompanies = async (
  companId: string,
): Promise<any[]> => {
  try {
    const response = await api.get(`${apiURL}/followersCompanies/${companId}`);

    if (response.status !== 200) {
      throw new Error('Failed to fetch followed companies');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching followed companies:', error);
    throw error;
  }
};

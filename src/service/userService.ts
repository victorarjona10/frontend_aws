import { User } from '../models/User';
import api from './axiosInstance';

const apiURL = 'http://localhost:40000/api/users';

export const logInUser = async (
  email: string,
  password: string,
): Promise<{ token: string; user: User; refreshToken: string }> => {
  try {
    const response = await api.post(`${apiURL}/login`, {
      email,
      password,
    });

    if (response.status !== 200) {
      throw new Error('Failed to log in');
    }

    const { token, user, refreshToken } = response.data;

    // Opcional: Almacenar el token y refreshToken en localStorage o cookies
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
    // console.log("responseeee:", user);
    return { token, user, refreshToken };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const UpdateProfilePicture = async (
  email: string,
  avatar: string,
): Promise<{ user: User }> => {
  try {
    const response = await api.put(`${apiURL}/updateAvatar`, {
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

export const UpdateUserById = async (user: User): Promise<{ user: User }> => {
  try {
    const response = await api.put(`${apiURL}/${user._id}`, {
      user,
    });

    if (response.status !== 200) {
      throw new Error('Failed to update user');
    }

    return response.data;
  } catch (error) {
    console.error('Error updateing user:', error);
    throw error;
  }
};

export const getUserById = async (id: string): Promise<User> => {
  try {
    const response = await api.get(`${apiURL}/${id}`);

    if (response.status !== 200) {
      throw new Error('Failed to fetch user');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const FollowCompany = async (
  userId: string,
  companyId: string,
): Promise<{ user: User }> => {
  try {
    const response = await api.put(`${apiURL}/follows/${userId}`, {
      companyId,
    });

    if (response.status !== 200) {
      throw new Error('Failed to follow company');
    }

    return response.data;
  } catch (error) {
    console.error('Error following company:', error);
    throw error;
  }
};

export const UnfollowCompany = async (
  userId: string,
  companyId: string,
): Promise<{ user: User }> => {
  try {
    const response = await api.put(`${apiURL}/unfollow/${userId}`, {
      companyId,
    });

    if (response.status !== 200) {
      throw new Error('Failed to unfollow company');
    }

    return response.data;
  } catch (error) {
    console.error('Error unfollowing company:', error);
    throw error;
  }
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
): Promise<{ user: User }> => {
  try {
    const response = await api.post(`${apiURL}/`, {
      name,
      email,
      password,
    });

    if (response.status !== 201 && response.status !== 200) {
      throw new Error('Failed to register user');
    }

    return { user: response.data };
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

//funcion para obtener las compañias que sigue un usuario
export const getFollowedCompanies = async (userId: string): Promise<any[]> => {
  try {
    const response = await api.get(`${apiURL}/followedCompanies/${userId}`);

    if (response.status !== 200) {
      throw new Error('Failed to fetch followed companies');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching followed companies:', error);
    throw error;
  }
};

export const getFollowingUsers = async (userId: string): Promise<any[]> => {
  try {
    const response = await api.get(`${apiURL}/followingUsers/${userId}`);

    if (response.status !== 200) {
      throw new Error('Failed to fetch following users');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching following users:', error);
    throw error;
  }
};

export const getFollowedUsers = async (userId: string): Promise<any[]> => {
  try {
    const response = await api.get(`${apiURL}/followedUsers/${userId}`);

    if (response.status !== 200) {
      throw new Error('Failed to fetch followed users');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching followed users:', error);
    throw error;
  }
};

export const followUser = async (
  currentUserId: string,
  userId: string,
): Promise<{ user: User }> => {
  try {
    const response = await api.put(`${apiURL}/followUser/${userId}`, {
      currentUserId,
    });

    if (response.status !== 200) {
      throw new Error('Failed to follow user');
    }

    return response.data;
  } catch (error) {
    console.error('Error following user:', error);
    throw error;
  }
};

export const unfollowUser = async (
  currentUserId: string,
  userId: string,
): Promise<{ user: User }> => {
  try {
    const response = await api.put(`${apiURL}/Userunfollow/${userId}`, {
      currentUserId,
    });

    if (response.status !== 200) {
      throw new Error('Failed to unfollow user');
    }

    return response.data;
  } catch (error) {
    console.error('Error unfollowing user:', error);
    throw error;
  }
};

export const addMoneyToWallet = async (userId: string, amount: number) => {
  try {
    const response = await api.put(
      `${apiURL}/addMoney/${userId}`,
      { amount },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data; // Devuelve el usuario actualizado
  } catch (error: any) {
    console.error(
      'Error al añadir fondos:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

export async function getUserWallet(userId: string) {
  try {
    const response = await api.get(`${apiURL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data.wallet;
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return null;
  }
}

export const payOrder = async (userId: string, orderId: string) => {
  try {
    const response = await api.put(
      `${apiURL}/pay/${userId}`,
      { orderId }, // El body debe incluir orderId
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    console.error('Error paying order:', error.response?.data || error.message);
    throw error;
  }
};

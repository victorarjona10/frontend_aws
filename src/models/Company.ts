import { Product } from "./Product";
import { IReview } from "./Review"; // Asegúrate de que la ruta sea correcta

export interface Company {
  _id: string;
  ownerId: string;
  name: string;
  rating: number;
  userRatingsTotal: number;
  description: string;
  location: string;
  email: string;
  phone: string;
  password: string;
  wallet: number;
  // products: string[];
  coordenates_lat: number;
  coordenates_lng: number;
  icon: string;
  photos?: string[];
  products: Product[]; 
  followers: number;
  reviews: IReview[]; // Cambiado a IReview[]
  pendingOrders?: string[];
  user_Followers: FollowersCompany[];  
}

export interface FollowersCompany {
    user_id: string;
    _id: string;
  }

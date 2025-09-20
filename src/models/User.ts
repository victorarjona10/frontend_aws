export interface User {
    _id: string;
    name: string;
    email: string;
    password: string;
    phone?: string;
    wallet?: number;
    Flag?: boolean;
    description?: string;
    avatar?: string;
    refreshToken?: string; 
    refreshTokenExpiry?: Date; 
    googleId?: string; // Optional field for Google ID
    company_Followed: FollowedCompany[]; 
  }

  export interface FollowedCompany {
    company_id: string;
    _id: string;
  }
  
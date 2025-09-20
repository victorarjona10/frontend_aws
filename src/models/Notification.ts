export interface Notification {
  _id: string;
  user_id: string;
  company_id: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
  data?: {
    order?: any;
    company?: any;
    user?: any;
  };
}

export interface IUser {
  id: number;
  first_name: string;
  last_name?: string;
  username: string;
  email: string;
  createdAt: Date;
  password?: string;
  businessAddress?: string;
  businessName?: string;
  phone_numbers?: string;
  role: 'CUSTOMER' | 'ADMIN' | 'OWNER';
  clerkUserId: string;
  imageUrl?: string;
}

export type UserRole = 'CUSTOMER' | 'ADMIN' | 'OWNER';
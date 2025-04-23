import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'ADMIN' | 'OWNER' | 'CUSTOMER';
    };
  }

  interface User {
    id: string;
    role: 'ADMIN' | 'OWNER' | 'CUSTOMER';
  }
}

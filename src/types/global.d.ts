export {};

export type Roles = 'admin' | 'owner' | 'customer';

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles;
    };
  }
}

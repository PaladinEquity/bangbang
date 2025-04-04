/**
 * User and authentication related type definitions
 */

export type AuthUser = {
  userId: string;
  email: string;
  username?: string;
  name?: string;
  isAuthenticated: boolean;
  role?: string;
};

export type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
};

export type RouteProtectionProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
};

export type Address = {
  id: string;
  userId: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  phone?: string;
};

export type AddressFormData = {
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  phone: string;
};
/**
 * Admin-related type definitions
 */

// User type for admin management
export type AdminUser = {
  username: string;
  userId: string;
  email?: string;
  name?: string;
  status: string;
  createdAt: string;
  isAdmin: boolean;
  attributes: {
    email?: string;
    given_name?: string;
    family_name?: string;
    [key: string]: any;
  };
};

// User attribute edit modal props
export type EditAttributeModalProps = {
  user: AdminUser | null;
  onClose: () => void;
  onSave: (userId: string, attributes: Record<string, string>) => Promise<void>;
};

// Role change modal props
export type ChangeRoleModalProps = {
  user: AdminUser | null;
  onClose: () => void;
  onSave: (userId: string, role: 'admin' | 'user') => Promise<void>;
};

// Reset password confirmation modal props
export type ResetPasswordModalProps = {
  user: AdminUser | null;
  onClose: () => void;
  onConfirm: (userId: string) => Promise<void>;
};

// Status badge props
export type StatusBadgeProps = {
  status: string;
};

// Role badge props
export type RoleBadgeProps = {
  role: string;
};
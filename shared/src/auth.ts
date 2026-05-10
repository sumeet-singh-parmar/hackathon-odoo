import { z } from "zod";

export const UsernameSchema = z
  .string()
  .trim()
  .min(3, "Username must be at least 3 characters")
  .max(20, "Username can be up to 20 characters")
  .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores only");

export const PhoneSchema = z
  .string()
  .trim()
  .min(7, "Phone number is too short")
  .max(20, "Phone number is too long")
  .regex(/^\+?[0-9 ()-]+$/, "Use digits, spaces, +, -, ( )");

export const RegisterSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  username: UsernameSchema,
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(60, "First name is too long"),
  lastName: z
    .string()
    .trim()
    .min(1, "Last name is required")
    .max(60, "Last name is too long"),
  phoneNumber: PhoneSchema,
  city: z
    .string()
    .trim()
    .min(1, "City is required")
    .max(80, "City is too long"),
  country: z
    .string()
    .trim()
    .min(1, "Country is required")
    .max(80, "Country is too long"),
  additionalInfo: z
    .string()
    .trim()
    .max(2000, "Keep this under 2000 characters")
    .optional(),
});
export type RegisterInput = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type LoginInput = z.infer<typeof LoginSchema>;

export const RefreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
export type RefreshInput = z.infer<typeof RefreshSchema>;

export const LogoutSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
export type LogoutInput = z.infer<typeof LogoutSchema>;

export const UpdateMeSchema = z.object({
  username: UsernameSchema.optional(),
  firstName: z.string().trim().min(1, "First name is required").max(60, "First name is too long").optional(),
  lastName: z.string().trim().min(1, "Last name is required").max(60, "Last name is too long").optional(),
  phoneNumber: PhoneSchema.optional(),
  city: z.string().trim().min(1, "City is required").max(80, "City is too long").optional(),
  country: z.string().trim().min(1, "Country is required").max(80, "Country is too long").optional(),
  additionalInfo: z.string().trim().max(2000, "Keep this under 2000 characters").optional(),
  language: z.string().trim().max(10).optional(),
});
export type UpdateMeInput = z.infer<typeof UpdateMeSchema>;

export const ForgotPasswordSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
});
export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export type UserRole = "USER" | "ADMIN";

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  city: string;
  country: string;
  additionalInfo: string | null;
  role: UserRole;
  language: string | null;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

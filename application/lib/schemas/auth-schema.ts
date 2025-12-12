import { z } from "zod";

/**
 * Zod validation schemas for authentication forms
 * Implements FR-UX-005: All forms MUST validate input using Zod schemas
 */

/**
 * Sign in schema
 * - Email: Valid email format
 * - Password: Minimum 8 characters
 */
export const signInSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .min(1, "Password is required"),
});

export type SignInForm = z.infer<typeof signInSchema>;

/**
 * Sign up schema
 * - Email: Valid email format
 * - Password: Minimum 8 characters with complexity requirements
 * - Confirm password: Must match password
 * - Full name: 2-100 characters
 * - Company: Optional, max 100 characters
 */
export const signUpSchema = z
  .object({
    email: z
      .string()
      .email("Please enter a valid email address")
      .min(1, "Email is required"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    fullName: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name cannot exceed 100 characters")
      .trim(),
    company: z
      .string()
      .max(100, "Company name cannot exceed 100 characters")
      .trim()
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignUpForm = z.infer<typeof signUpSchema>;

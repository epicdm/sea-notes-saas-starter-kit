/**
 * Brand Profile Validation Schemas
 * Zod schemas for brand profile forms
 */

import { z } from "zod";

/**
 * Brand Profile Update Schema
 */
export const brandProfileUpdateSchema = z.object({
  companyName: z
    .string()
    .min(1, "Company name is required")
    .max(255, "Company name must be less than 255 characters"),
  industry: z.string().max(100).optional(),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  facebookUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  instagramUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  twitterUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  customBrandVoice: z.string().optional(),
  customToneGuidelines: z.string().optional(),
});

export type BrandProfileUpdate = z.infer<typeof brandProfileUpdateSchema>;

/**
 * Social Media Extract Schema
 */
export const socialExtractSchema = z.object({
  facebookUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  instagramUrl: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  websiteUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export type SocialExtractForm = z.infer<typeof socialExtractSchema>;

/**
 * Do's and Don'ts Schema
 */
export const dosAndDontsSchema = z.object({
  dos: z.array(z.string()),
  donts: z.array(z.string()),
});

export type DosAndDonts = z.infer<typeof dosAndDontsSchema>;

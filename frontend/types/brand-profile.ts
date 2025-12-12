/**
 * Brand Profile - Company identity and brand voice
 * One per user (or multiple for agencies managing multiple clients)
 */

export interface SocialMediaLinks {
  facebook_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;
}

export interface ExtractedBrandData {
  business_description?: string;
  brand_voice?: string; // "friendly and professional", "casual and fun", etc.
  tone_guidelines?: string; // "warm, empathetic, solution-focused"
  target_audience?: string; // "Small business owners", "Tech professionals"
  key_products?: string[]; // ["CRM Software", "Marketing Automation"]
  key_services?: string[]; // ["Consulting", "Implementation"]
  company_values?: string[]; // ["Customer-first", "Innovation", "Integrity"]
  unique_selling_points?: string[]; // What makes the company special
  common_questions?: string[]; // Frequently asked questions from social
  brand_personality?: string; // Overall personality description
  extracted_at?: string; // ISO timestamp
  extraction_source?: string; // "facebook" | "instagram" | "website" | "all"
}

export interface BrandProfile {
  id: string;
  user_id: string;

  // Company Info
  company_name: string;
  industry?: string;
  logo_url?: string;

  // Social Media
  social_media_links?: SocialMediaLinks;

  // Extracted Brand Data (AI-powered)
  brand_data?: ExtractedBrandData;

  // Manual Overrides
  custom_brand_voice?: string; // User can override AI-extracted brand voice
  custom_tone_guidelines?: string;
  dos_and_donts?: {
    dos: string[];
    donts: string[];
  };

  // Settings
  auto_extract_enabled: boolean; // Auto-update brand data from social media
  last_extraction_at?: string;

  // Stats
  persona_count?: number; // Number of personas linked to this brand
  agent_count?: number; // Number of agents linked to this brand

  created_at: string;
  updated_at: string;
}

export interface BrandProfileCreate {
  company_name: string;
  industry?: string;
  social_media_links?: SocialMediaLinks;
  custom_brand_voice?: string;
  custom_tone_guidelines?: string;
}

export interface BrandProfileUpdate {
  company_name?: string;
  industry?: string;
  logo_url?: string;
  social_media_links?: SocialMediaLinks;
  custom_brand_voice?: string;
  custom_tone_guidelines?: string;
  dos_and_donts?: {
    dos: string[];
    donts: string[];
  };
  auto_extract_enabled?: boolean;
}

export interface SocialExtractionRequest {
  urls: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
}

export interface SocialExtractionResponse {
  success: boolean;
  data: ExtractedBrandData;
  message?: string;
}

/**
 * Helper function to generate brand context for AI agents
 * This is what gets injected into agent instructions
 */
export function generateBrandContext(profile: BrandProfile): string {
  const brand = profile.brand_data;
  const custom = profile.custom_brand_voice || brand?.brand_voice;

  let context = `Company: ${profile.company_name}\n`;

  if (custom) {
    context += `Brand Voice: ${custom}\n`;
  }

  if (profile.custom_tone_guidelines || brand?.tone_guidelines) {
    context += `Communication Style: ${profile.custom_tone_guidelines || brand?.tone_guidelines}\n`;
  }

  if (brand?.target_audience) {
    context += `Target Audience: ${brand.target_audience}\n`;
  }

  if (brand?.key_products?.length) {
    context += `Key Products: ${brand.key_products.join(", ")}\n`;
  }

  if (brand?.key_services?.length) {
    context += `Key Services: ${brand.key_services.join(", ")}\n`;
  }

  if (brand?.company_values?.length) {
    context += `Company Values: ${brand.company_values.join(", ")}\n`;
  }

  if (profile.dos_and_donts?.dos?.length) {
    context += `\nDo's:\n${profile.dos_and_donts.dos.map(d => `- ${d}`).join("\n")}\n`;
  }

  if (profile.dos_and_donts?.donts?.length) {
    context += `\nDon'ts:\n${profile.dos_and_donts.donts.map(d => `- ${d}`).join("\n")}\n`;
  }

  return context.trim();
}

/**
 * Helper to check if brand profile is complete enough to use
 */
export function isBrandProfileComplete(profile: BrandProfile): boolean {
  return !!(
    profile.company_name &&
    (profile.brand_data?.brand_voice || profile.custom_brand_voice)
  );
}

/**
 * Helper to check if social extraction is needed
 */
export function needsSocialExtraction(profile: BrandProfile): boolean {
  if (!profile.social_media_links) return false;

  const hasUrls = !!(
    profile.social_media_links.facebook_url ||
    profile.social_media_links.instagram_url ||
    profile.social_media_links.website_url
  );

  const hasExtractedData = !!profile.brand_data?.extracted_at;

  return hasUrls && !hasExtractedData;
}

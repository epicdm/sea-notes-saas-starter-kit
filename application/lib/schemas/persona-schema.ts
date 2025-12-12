/**
 * Persona Validation Schemas
 * Zod schemas for multi-channel persona forms
 */

import { z } from "zod";

// ============================================================================
// Enums and Constants
// ============================================================================

/**
 * Communication capabilities
 */
export const personaCapabilities = [
  "voice",
  "chat",
  "whatsapp",
  "email",
  "sms",
] as const;

export type PersonaCapability = (typeof personaCapabilities)[number];

/**
 * Persona Types
 */
export const personaTypes = [
  "customer_support",
  "customer_service",
  "sales",
  "receptionist",
  "appointment_setter",
  "technical_support",
  "survey_collector",
  "custom",
] as const;

export type PersonaType = (typeof personaTypes)[number];

/**
 * Tone Options
 */
export const toneOptions = [
  "professional",
  "friendly",
  "casual",
  "formal",
  "empathetic",
] as const;

export type ToneOption = (typeof toneOptions)[number];

/**
 * Language Style Options
 */
export const languageStyleOptions = [
  "concise",
  "detailed",
  "conversational",
  "technical",
  "adaptable",
] as const;

export type LanguageStyleOption = (typeof languageStyleOptions)[number];

/**
 * Voice Providers
 */
export const voiceProviders = [
  "openai",
  "elevenlabs",
  "cartesia",
  "playht",
] as const;

export type VoiceProvider = (typeof voiceProviders)[number];

// ============================================================================
// Schema Components
// ============================================================================

/**
 * Voice Configuration Schema
 */
export const voiceConfigSchema = z.object({
  voice_id: z.string().min(1, "Voice ID is required"),
  provider: z.enum(voiceProviders, {
    message: "Please select a voice provider",
  }),
  model: z.string().optional(),
  speed: z.number().min(0.5).max(2.0).optional(),
  stability: z.number().min(0).max(1).optional(),
  similarity_boost: z.number().min(0).max(1).optional(),
  style: z.number().min(0).max(100).optional(),
});

export type VoiceConfigForm = z.infer<typeof voiceConfigSchema>;

/**
 * Tool Configuration Schema
 */
export const toolConfigSchema = z.object({
  name: z.string().min(1, "Tool name is required"),
  description: z.string().min(1, "Tool description is required"),
  enabled: z.boolean(),
  parameters: z.record(z.any()).optional(),
});

export type ToolConfigForm = z.infer<typeof toolConfigSchema>;

// ============================================================================
// Main Persona Schemas
// ============================================================================

/**
 * Create Persona Schema
 */
export const createPersonaSchema = z.object({
  name: z
    .string()
    .min(3, "Persona name must be at least 3 characters")
    .max(100, "Persona name must be less than 100 characters"),
  type: z.enum(personaTypes, {
    message: "Please select a persona type",
  }),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  instructions: z
    .string()
    .min(50, "Instructions must be at least 50 characters")
    .max(5000, "Instructions must be less than 5000 characters"),
  personalityTraits: z
    .array(z.string().max(50))
    .max(10, "Maximum 10 personality traits")
    .optional(),
  tone: z.enum(toneOptions).optional(),
  languageStyle: z.enum(languageStyleOptions).optional(),
  suggestedVoice: z
    .string()
    .max(100, "Voice ID must be less than 100 characters")
    .optional(),

  // Multi-Channel Configuration
  capabilities: z
    .array(z.enum(personaCapabilities))
    .min(1, "At least one capability must be enabled")
    .refine((caps) => caps.length > 0, {
      message: "At least one communication channel must be selected",
    }),
  voiceConfig: voiceConfigSchema.optional(),
  tools: z.array(toolConfigSchema).optional(),
  brandProfileId: z.string().uuid().optional(),
}).refine(
  (data) => {
    // If voice capability is selected, voice config is required
    if (data.capabilities.includes("voice")) {
      return data.voiceConfig !== undefined;
    }
    return true;
  },
  {
    message: "Voice configuration is required when voice capability is enabled",
    path: ["voiceConfig"],
  }
);

export type CreatePersonaForm = z.infer<typeof createPersonaSchema>;

/**
 * Update Persona Schema (all fields optional except what's being updated)
 */
export const updatePersonaSchema = z.object({
  name: z
    .string()
    .min(3, "Persona name must be at least 3 characters")
    .max(100, "Persona name must be less than 100 characters")
    .optional(),
  description: z
    .string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  instructions: z
    .string()
    .min(50, "Instructions must be at least 50 characters")
    .max(5000, "Instructions must be less than 5000 characters")
    .optional(),
  personalityTraits: z
    .array(z.string().max(50))
    .max(10, "Maximum 10 personality traits")
    .optional(),
  tone: z.enum(toneOptions).optional(),
  languageStyle: z.enum(languageStyleOptions).optional(),
  suggestedVoice: z
    .string()
    .max(100, "Voice ID must be less than 100 characters")
    .optional(),

  // Multi-Channel Configuration
  capabilities: z
    .array(z.enum(personaCapabilities))
    .min(1, "At least one capability must be enabled")
    .optional(),
  voiceConfig: voiceConfigSchema.optional(),
  tools: z.array(toolConfigSchema).optional(),
  brandProfileId: z.string().uuid().optional().nullable(),
}).refine(
  (data) => {
    // If voice capability is selected, voice config is required
    if (data.capabilities && data.capabilities.includes("voice")) {
      return data.voiceConfig !== undefined;
    }
    return true;
  },
  {
    message: "Voice configuration is required when voice capability is enabled",
    path: ["voiceConfig"],
  }
);

export type UpdatePersonaForm = z.infer<typeof updatePersonaSchema>;

/**
 * Create From Template Schema
 */
export const createFromTemplateSchema = z.object({
  templateId: z.string().min(1, "Template ID is required"),
  customName: z
    .string()
    .min(3, "Custom name must be at least 3 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  customizations: z
    .object({
      description: z.string().max(500).optional(),
      instructions: z.string().min(50).max(5000).optional(),
      personalityTraits: z.array(z.string().max(50)).max(10).optional(),
      tone: z.enum(toneOptions).optional(),
      languageStyle: z.enum(languageStyleOptions).optional(),
      suggestedVoice: z.string().max(100).optional(),
      capabilities: z.array(z.enum(personaCapabilities)).min(1).optional(),
      voiceConfig: voiceConfigSchema.optional(),
      tools: z.array(toolConfigSchema).optional(),
      brandProfileId: z.string().uuid().optional(),
    })
    .optional(),
});

export type CreateFromTemplateForm = z.infer<typeof createFromTemplateSchema>;

// ============================================================================
// Display Labels
// ============================================================================

/**
 * Capability Labels
 */
export const capabilityLabels: Record<PersonaCapability, string> = {
  voice: "Voice Calls",
  chat: "Live Chat",
  whatsapp: "WhatsApp",
  email: "Email",
  sms: "SMS",
};

/**
 * Persona Type Labels
 */
export const personaTypeLabels: Record<PersonaType, string> = {
  customer_support: "Customer Support",
  customer_service: "Customer Service",
  sales: "Sales Agent",
  receptionist: "Receptionist",
  appointment_setter: "Appointment Setter",
  technical_support: "Technical Support",
  survey_collector: "Survey Collector",
  custom: "Custom",
};

/**
 * Tone Labels
 */
export const toneLabels: Record<ToneOption, string> = {
  professional: "Professional",
  friendly: "Friendly",
  casual: "Casual",
  formal: "Formal",
  empathetic: "Empathetic",
};

/**
 * Language Style Labels
 */
export const languageStyleLabels: Record<LanguageStyleOption, string> = {
  concise: "Concise",
  detailed: "Detailed",
  conversational: "Conversational",
  technical: "Technical",
  adaptable: "Adaptable",
};

/**
 * Voice Provider Labels
 */
export const voiceProviderLabels: Record<VoiceProvider, string> = {
  openai: "OpenAI",
  elevenlabs: "ElevenLabs",
  cartesia: "Cartesia",
  playht: "PlayHT",
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get default voice config for a provider
 */
export function getDefaultVoiceConfig(provider: VoiceProvider = "openai"): VoiceConfigForm {
  const defaults: Record<VoiceProvider, VoiceConfigForm> = {
    openai: {
      voice_id: "nova",
      provider: "openai",
      model: "tts-1",
      speed: 1.0,
    },
    elevenlabs: {
      voice_id: "",
      provider: "elevenlabs",
      stability: 0.5,
      similarity_boost: 0.75,
    },
    cartesia: {
      voice_id: "",
      provider: "cartesia",
      speed: 1.0,
    },
    playht: {
      voice_id: "",
      provider: "playht",
      speed: 1.0,
    },
  };

  return defaults[provider];
}

/**
 * Get default tool config for a tool type
 */
export function getDefaultToolConfig(toolName: string): ToolConfigForm {
  const commonTools: Record<string, ToolConfigForm> = {
    knowledge_base: {
      name: "knowledge_base",
      description: "Search knowledge base for answers",
      enabled: true,
    },
    ticket_creation: {
      name: "ticket_creation",
      description: "Create support tickets",
      enabled: true,
    },
    calendar_booking: {
      name: "calendar_booking",
      description: "Schedule appointments",
      enabled: true,
    },
    call_routing: {
      name: "call_routing",
      description: "Route calls to appropriate department",
      enabled: true,
    },
    lead_qualification: {
      name: "lead_qualification",
      description: "Qualify and score leads",
      enabled: true,
    },
  };

  return commonTools[toolName] || {
    name: toolName,
    description: "",
    enabled: true,
  };
}

/**
 * Validate capabilities selection
 */
export function validateCapabilities(capabilities: PersonaCapability[]): string | null {
  if (capabilities.length === 0) {
    return "At least one capability must be enabled";
  }
  return null;
}

/**
 * Check if voice config is required
 */
export function isVoiceConfigRequired(capabilities: PersonaCapability[]): boolean {
  return capabilities.includes("voice");
}

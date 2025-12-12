import { z } from "zod";

/**
 * Visual Wizard Schema - Multi-channel 5-step flow with persona library
 * Step 1: Agent Type (Inbound/Outbound/Hybrid)
 * Step 2: Persona Selection (from library - shows multi-channel capabilities)
 * Step 3: Agent Details (Name, Custom Instructions, Deployment Mode)
 * Step 4: Channel Configuration (Configure enabled channels from persona)
 * Step 5: Review & Create (Final review before creation)
 */

// Channel configuration schemas
export const voiceChannelSchema = z.object({
  enabled: z.boolean(),
  phone_number_id: z.string().optional(),
  voice_override: z.string().optional(),
  model_override: z.string().optional(),
}).optional();

export const chatChannelSchema = z.object({
  enabled: z.boolean(),
  widget_title: z.string().optional(),
  widget_subtitle: z.string().optional(),
  widget_color: z.string().optional(),
}).optional();

export const whatsappChannelSchema = z.object({
  enabled: z.boolean(),
  phone_number: z.string().optional(),
  business_account_id: z.string().optional(),
}).optional();

export const emailChannelSchema = z.object({
  enabled: z.boolean(),
  email_address: z.string().optional(),
  signature: z.string().optional(),
}).optional();

export const smsChannelSchema = z.object({
  enabled: z.boolean(),
  phone_number: z.string().optional(),
  sender_id: z.string().optional(),
}).optional();

export const channelsConfigSchema = z.object({
  voice: voiceChannelSchema,
  chat: chatChannelSchema,
  whatsapp: whatsappChannelSchema,
  email: emailChannelSchema,
  sms: smsChannelSchema,
}).optional();

export const agentVisualWizardSchema = z.object({
  // Step 1: Agent Type
  agent_type: z.enum(["inbound", "outbound", "hybrid"], {
    required_error: "Please select an agent type",
  }),

  // Step 2: Persona Selection (from library)
  persona_id: z.string({
    required_error: "Please select a persona",
  }).min(1, "Please select a persona"),

  // Step 3: Agent Details
  name: z.string()
    .min(1, "Agent name is required")
    .min(3, "Agent name must be at least 3 characters")
    .max(100, "Agent name must be less than 100 characters"),

  description: z.string().optional(),

  custom_instructions: z.string()
    .max(2000, "Custom instructions must be less than 2000 characters")
    .optional(),

  deployment_mode: z.enum(["production", "staging", "development"])
    .default("production"),

  // Step 4: Channel Configuration
  channels: channelsConfigSchema,

  // AI Configuration (from persona, can be overridden)
  llm_model: z.string()
    .min(1, "AI model is required"),

  voice: z.string()
    .min(1, "Voice is required"),

  language: z.string()
    .default("en"),

  temperature: z.number()
    .min(0)
    .max(2)
    .default(0.7),

  // Phone number assignment (optional, backward compatibility)
  phone_number_ids: z.array(z.string()).optional(),

  // Advanced options (with defaults)
  vad_enabled: z.boolean().default(true),
  turn_detection: z.enum(["semantic", "vad_based"]).default("semantic"),
  noise_cancellation: z.boolean().default(true),
});

export const agentVisualWizardDefaults = {
  agent_type: undefined,
  persona_id: "",
  name: "",
  description: "",
  custom_instructions: "",
  deployment_mode: "production" as const,
  channels: {
    voice: { enabled: false },
    chat: { enabled: false },
    whatsapp: { enabled: false },
    email: { enabled: false },
    sms: { enabled: false },
  },
  llm_model: "gpt-4o-mini",
  voice: "echo",
  language: "en",
  temperature: 0.7,
  phone_number_ids: [],
  vad_enabled: true,
  turn_detection: "semantic" as const,
  noise_cancellation: true,
};

export type AgentVisualWizard = z.infer<typeof agentVisualWizardSchema>;

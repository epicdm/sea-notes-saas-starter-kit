import { z } from "zod";

/**
 * Simplified Agent Creation Schema
 * Only essential fields - advanced options configured later via edit page
 */
export const agentCreateSchemaSimple = z.object({
  // Step 1: Basic Info
  name: z.string()
    .min(1, "Agent name is required")
    .min(3, "Agent name must be at least 3 characters")
    .max(100, "Agent name must be less than 100 characters"),

  description: z.string()
    .min(1, "Description is required")
    .max(500, "Description must be less than 500 characters"),

  // Step 2: AI Configuration
  instructions: z.string()
    .min(10, "Instructions must be at least 10 characters")
    .max(5000, "Instructions must be less than 5000 characters"),

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

  // Default values for advanced options (will be configurable in edit page)
  vad_enabled: z.boolean().default(true),
  turn_detection: z.enum(["semantic", "vad_based"]).default("semantic"),
  noise_cancellation: z.boolean().default(true),
});

export const agentWizardDefaultsSimple = {
  name: "",
  description: "",
  instructions: "",
  llm_model: "gpt-4o-mini",
  voice: "echo",
  language: "en",
  temperature: 0.7,
  vad_enabled: true,
  turn_detection: "semantic" as const,
  noise_cancellation: true,
};

export type AgentCreateSimple = z.infer<typeof agentCreateSchemaSimple>;

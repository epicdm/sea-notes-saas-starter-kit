/**
 * Agent entity - AI voice agent configuration
 * References Persona and Brand Profile
 */

export enum AgentType {
  INBOUND = "inbound",
  OUTBOUND = "outbound",
  HYBRID = "hybrid",
}

export enum AgentStatus {
  INACTIVE = "inactive",
  DEPLOYING = "deploying",
  DEPLOYED = "deployed",
  ACTIVE = "active",
  FAILED = "failed",
  STOPPED = "stopped",
}

export enum DeploymentMode {
  PRODUCTION = "production",
  STAGING = "staging",
  DEVELOPMENT = "development",
}

export interface Agent {
  id: string;
  user_id: string;

  // Basic Info
  name: string;
  description?: string;
  agent_type: AgentType; // inbound, outbound, or hybrid

  // References
  persona_id: string; // References a Persona
  brand_profile_id?: string; // References Brand Profile (optional, default to user's main profile)

  // AI Configuration
  llm_model: string; // "gpt-4o-mini", "gpt-4o", etc.
  voice: string; // "echo", "alloy", etc.
  language: string; // "en", "es", etc.
  temperature: number; // 0-2

  // Advanced Settings
  vad_enabled: boolean;
  turn_detection: "semantic" | "vad_based";
  noise_cancellation: boolean;
  max_duration?: number;
  silence_timeout?: number;

  // Instructions (computed from persona + brand profile)
  instructions?: string; // This is computed: persona.instructions + brand_context
  custom_instructions?: string; // Agent-specific instruction overrides

  // Multi-Channel Configuration
  channels?: Record<string, any>; // Channel-specific configurations (from backend)
  deployment_mode?: DeploymentMode; // Production, staging, or development

  // Deployment Status
  is_deployed: boolean;
  status: AgentStatus; // Current agent status
  deployment_status?: "pending" | "deployed" | "failed" | "stopped";

  // LiveKit Integration
  livekit_agent_id?: string;
  livekit_worker_id?: string;

  created_at: string;
  updated_at: string;
}

export interface AgentCreate {
  name: string;
  description?: string;
  agent_type: AgentType;

  persona_id: string; // Required: must select a persona
  brand_profile_id?: string; // Optional: defaults to user's main profile

  // AI Config
  llm_model: string;
  voice: string;
  language?: string;
  temperature?: number;

  // Advanced (optional with defaults)
  vad_enabled?: boolean;
  turn_detection?: "semantic" | "vad_based";
  noise_cancellation?: boolean;
  max_duration?: number;
  silence_timeout?: number;

  // Phone numbers to assign (optional)
  phone_number_ids?: string[];

  // Multi-Channel Configuration (optional)
  custom_instructions?: string;
  channels?: Record<string, any>;
  deployment_mode?: DeploymentMode;
}

export interface AgentUpdate {
  name?: string;
  description?: string;
  agent_type?: AgentType;
  persona_id?: string;

  // Multi-Channel Configuration
  custom_instructions?: string;
  channels?: Record<string, any>;
  deployment_mode?: DeploymentMode;

  llm_model?: string;
  voice?: string;
  language?: string;
  temperature?: number;

  vad_enabled?: boolean;
  turn_detection?: "semantic" | "vad_based";
  noise_cancellation?: boolean;
  max_duration?: number;
  silence_timeout?: number;
}

/**
 * Agent with populated relationships
 */
export interface AgentWithRelations extends Agent {
  persona?: {
    id: string;
    name: string;
    type: string;
    icon?: string;
  };
  brand_profile?: {
    id: string;
    company_name: string;
  };
  phone_numbers?: Array<{
    id: string;
    phone_number: string;
  }>;
}

/**
 * Helper functions
 */

export function getAgentTypeIcon(type: AgentType): string {
  switch (type) {
    case AgentType.INBOUND:
      return "📥";
    case AgentType.OUTBOUND:
      return "📤";
    case AgentType.HYBRID:
      return "🔄";
    default:
      return "🤖";
  }
}

export function getAgentTypeLabel(type: AgentType): string {
  switch (type) {
    case AgentType.INBOUND:
      return "Inbound";
    case AgentType.OUTBOUND:
      return "Outbound";
    case AgentType.HYBRID:
      return "Hybrid";
    default:
      return "Agent";
  }
}

export function getAgentTypeDescription(type: AgentType): string {
  switch (type) {
    case AgentType.INBOUND:
      return "Receives incoming calls from customers";
    case AgentType.OUTBOUND:
      return "Makes outgoing calls to prospects or customers";
    case AgentType.HYBRID:
      return "Handles both incoming and outgoing calls";
    default:
      return "AI voice agent";
  }
}

export function getAgentStatusColor(status?: string): "success" | "warning" | "danger" | "default" {
  switch (status) {
    case "deployed":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    default:
      return "default";
  }
}

export function canDeployAgent(agent: Agent): boolean {
  return !!(
    agent.name &&
    agent.persona_id &&
    agent.llm_model &&
    agent.voice &&
    !agent.is_deployed
  );
}

export function canUndeployAgent(agent: Agent): boolean {
  return agent.is_deployed === true;
}

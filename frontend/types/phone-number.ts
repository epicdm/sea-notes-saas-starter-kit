/**
 * Phone Number entity types
 * Maps to backend PhoneNumber model and API responses
 */

/**
 * Phone number status enum
 */
export enum PhoneNumberStatus {
  PROVISIONING = "provisioning", // Magnus API call in progress
  AVAILABLE = "available", // Provisioned and ready to use (database status)
  ACTIVE = "active", // Provisioned and ready to use (API alias for AVAILABLE)
  ASSIGNED = "assigned", // Assigned to an agent
  FAILED = "failed", // Provisioning failed
  RELEASED = "released", // Released back to provider
}

/**
 * Phone number entity
 */
export interface PhoneNumber {
  id: string; // UUID
  user_id?: string; // UUID (multi-tenant isolation) - optional from API
  phone_number: string; // E.164 format (e.g., "+15551234567") - matches backend field name
  country_code: string; // ISO country code (e.g., "US", "UK")
  country?: string; // Full country name from API
  provider: string; // "EPIC Voice" or provider name
  provider_id?: string; // Provider's internal ID
  agent_id: string | null; // UUID of assigned agent (null if unassigned)
  agent_name?: string; // Name of assigned agent (from API)
  status: PhoneNumberStatus | string; // Status enum or string from API
  created_at: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
  assigned_at?: string; // ISO timestamp
  can_receive_calls?: boolean; // From API
  can_send_calls?: boolean; // From API
  monthly_cost?: number; // From API
  livekit_inbound_trunk?: string; // From API
  livekit_outbound_trunk?: string; // From API
  magnus_did_id?: string; // From API
}

/**
 * Phone number with agent details (joined data)
 */
export interface PhoneNumberWithAgent extends PhoneNumber {
  agent_name?: string; // Name of assigned agent (if assigned)
}

/**
 * Phone number provision payload
 */
export interface PhoneProvisionPayload {
  country_code: string; // 2-character ISO code
  area_code?: string; // Optional 3-digit code
  agent_id?: string; // Optional UUID for immediate assignment
}

/**
 * Phone number assignment payload
 */
export interface PhoneAssignPayload {
  phone_id: string; // UUID
  agent_id: string; // UUID
}

/**
 * Helper functions for phone number formatting
 */

/**
 * Format phone number in E.164 to human-readable format
 * @example formatPhoneNumber("+15551234567") => "+1 (555) 123-4567"
 */
export function formatPhoneNumber(phoneNumberOrString: string | PhoneNumber): string {
  // Handle both string and PhoneNumber object
  const number = typeof phoneNumberOrString === 'string'
    ? phoneNumberOrString
    : phoneNumberOrString.phone_number;

  if (!number) return '';

  // Simple US/CA format for now
  if (number.startsWith("+1") && number.length === 12) {
    const cleaned = number.substring(2);
    return `+1 (${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }

  // UK format
  if (number.startsWith("+44") && number.length === 13) {
    const cleaned = number.substring(3);
    return `+44 ${cleaned.substring(0, 4)} ${cleaned.substring(4)}`;
  }

  // Fallback: return as-is
  return number;
}

/**
 * Get flag emoji for country code
 */
export function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    US: "🇺🇸",
    CA: "🇨🇦",
    UK: "🇬🇧",
    GB: "🇬🇧",
    AU: "🇦🇺",
  };

  return flags[countryCode.toUpperCase()] || "🌍";
}

/**
 * Helper type guards
 */
export function isPhoneNumberProvisioning(phone: PhoneNumber): boolean {
  return phone.status === PhoneNumberStatus.PROVISIONING;
}

export function isPhoneNumberActive(phone: PhoneNumber): boolean {
  return phone.status === PhoneNumberStatus.ACTIVE;
}

export function isPhoneNumberAssigned(phone: PhoneNumber): boolean {
  return phone.status === PhoneNumberStatus.ASSIGNED;
}

export function isPhoneNumberFailed(phone: PhoneNumber): boolean {
  return phone.status === PhoneNumberStatus.FAILED;
}

export function canAssignPhoneNumber(phone: PhoneNumber): boolean {
  // Support both "active" and "available" status (database uses "available")
  const isAvailable =
    phone.status === PhoneNumberStatus.ACTIVE ||
    phone.status === PhoneNumberStatus.AVAILABLE;
  return isAvailable && phone.agent_id === null;
}

export function canUnassignPhoneNumber(phone: PhoneNumber): boolean {
  return phone.status === PhoneNumberStatus.ASSIGNED && phone.agent_id !== null;
}

import { projectId, publicAnonKey } from './supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-9d2dee99`;

export interface Agent {
  id: string;
  userId: string;
  name: string;
  type: 'voice' | 'chat';
  model: string;
  voice?: string;
  language: string;
  systemPrompt: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export async function signup(email: string, password: string, name: string) {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`
    },
    body: JSON.stringify({ email, password, name })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Signup error:', data.error);
    throw new Error(data.error || 'Failed to sign up');
  }

  return data;
}

export async function getAgents(accessToken: string): Promise<Agent[]> {
  console.log('🤖 [FRONTEND] Fetching agents...');
  console.log('🤖 [FRONTEND] API URL:', `${API_BASE_URL}/agents`);
  console.log('🤖 [FRONTEND] Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'MISSING');
  
  const response = await fetch(`${API_BASE_URL}/agents`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  console.log('🤖 [FRONTEND] Response Status:', response.status, response.statusText);
  
  const data = await response.json();
  console.log('🤖 [FRONTEND] Response Data:', data);
  console.log('🤖 [FRONTEND] Agents count:', data.agents?.length || 0);
  
  if (!response.ok) {
    console.error('🤖 [FRONTEND] ERROR:', data.error);
    throw new Error(data.error || 'Failed to fetch agents');
  }

  return data.agents;
}

export async function createAgent(accessToken: string, agentData: Partial<Agent>): Promise<Agent> {
  const response = await fetch(`${API_BASE_URL}/agents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(agentData)
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Create agent error:', data.error);
    throw new Error(data.error || 'Failed to create agent');
  }

  return data.agent;
}

export async function updateAgent(accessToken: string, agentId: string, updates: Partial<Agent>): Promise<Agent> {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(updates)
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Update agent error:', data.error);
    throw new Error(data.error || 'Failed to update agent');
  }

  return data.agent;
}

export async function deleteAgent(accessToken: string, agentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/agents/${agentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Delete agent error:', data.error);
    throw new Error(data.error || 'Failed to delete agent');
  }
}

// Dashboard Stats
export interface DashboardStats {
  total_agents: number;
  total_phone_numbers: number;
  total_calls_today: number;
  total_calls_month: number;
  total_cost_today_usd: string;
  total_cost_month_usd: string;
  trends: {
    agents: { value: string; isPositive: boolean };
    calls: { value: string; isPositive: boolean };
    costs: { value: string; isPositive: boolean };
  };
}

export async function getDashboardStats(accessToken: string): Promise<DashboardStats> {
  console.log('📊 [FRONTEND] Fetching dashboard stats...');
  console.log('📊 [FRONTEND] API URL:', `${API_BASE_URL}/dashboard/stats`);
  console.log('📊 [FRONTEND] Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'MISSING');
  
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  console.log('📊 [FRONTEND] Response Status:', response.status, response.statusText);
  
  const data = await response.json();
  console.log('📊 [FRONTEND] Response Data:', data);
  
  if (!response.ok) {
    console.error('📊 [FRONTEND] ERROR:', data.error);
    throw new Error(data.error || 'Failed to fetch dashboard stats');
  }

  console.log('📊 [FRONTEND] Stats received:', data.stats);
  return data.stats;
}

// Call Logs
export interface CallLog {
  id: string;
  userId: string;
  agentId: string;
  phoneNumber: string;
  direction: 'inbound' | 'outbound';
  duration: number;
  outcome: 'success' | 'failed' | 'voicemail' | 'busy' | 'no_answer';
  cost: string;
  createdAt: string;
  transcript?: string;
  recording?: string;
}

export async function getCalls(accessToken: string, limit: number = 50): Promise<{ calls: CallLog[]; total: number }> {
  console.log('📞 [FRONTEND] Fetching calls...');
  console.log('📞 [FRONTEND] API URL:', `${API_BASE_URL}/calls?limit=${limit}`);
  console.log('📞 [FRONTEND] Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'MISSING');
  
  const response = await fetch(`${API_BASE_URL}/calls?limit=${limit}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  console.log('📞 [FRONTEND] Response Status:', response.status, response.statusText);
  
  const data = await response.json();
  console.log('📞 [FRONTEND] Response Data:', data);
  console.log('📞 [FRONTEND] Calls count:', data.calls?.length || 0);
  
  if (!response.ok) {
    console.error('📞 [FRONTEND] ERROR:', data.error);
    throw new Error(data.error || 'Failed to fetch calls');
  }

  return data;
}

export async function getCallDetails(accessToken: string, callId: string): Promise<CallLog> {
  const response = await fetch(`${API_BASE_URL}/calls/${callId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Get call details error:', data.error);
    throw new Error(data.error || 'Failed to fetch call details');
  }

  return data.call;
}

// Phone Numbers
export interface PhoneNumber {
  id: string;
  userId: string;
  phoneNumber: string;
  formattedNumber: string;
  countryCode: string;
  status: 'active' | 'idle';
  assignedAgentId?: string;
  totalCalls: number;
  totalMinutes: number;
  totalCost: string;
  provisionedAt: string;
  capabilities?: {
    voice?: boolean;
    sms?: boolean;
    mms?: boolean;
  };
}

export async function getPhoneNumbers(accessToken: string): Promise<PhoneNumber[]> {
  const response = await fetch(`${API_BASE_URL}/phone-numbers`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Get phone numbers error:', data.error);
    throw new Error(data.error || 'Failed to fetch phone numbers');
  }

  return data.phoneNumbers;
}

export async function assignPhoneNumber(accessToken: string, phoneId: string, agentId: string | null): Promise<PhoneNumber> {
  const response = await fetch(`${API_BASE_URL}/phone-numbers/${phoneId}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ agentId })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Assign phone number error:', data.error);
    throw new Error(data.error || 'Failed to assign phone number');
  }

  return data.phoneNumber;
}

// Analytics
export interface AnalyticsData {
  summary: {
    totalCalls: number;
    successRate: string;
    avgDuration: number;
    totalCost: string;
  };
  callsByDate: Array<{ date: string; count: number }>;
  agentPerformance: Array<{
    agentId: string;
    agentName: string;
    calls: number;
    successRate: string;
    avgDuration: number;
    totalCost: string;
  }>;
}

export async function getAnalytics(accessToken: string): Promise<AnalyticsData> {
  const response = await fetch(`${API_BASE_URL}/analytics`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Get analytics error:', data.error);
    throw new Error(data.error || 'Failed to fetch analytics');
  }

  return data;
}

// Personas
export interface Persona {
  id: string;
  name: string;
  type: string;
  description: string;
  instructions: string;
  tone: string;
  style: string;
  personalityTraits: string[];
  channels: string[];
  tools: string[];
  brandProfileId?: string | null;
  isTemplate: boolean;
  usageCount?: number;
  createdAt: string;
}

export async function fetchPersonas(accessToken: string): Promise<{ personas: Persona[] }> {
  const response = await fetch(`${API_BASE_URL}/personas`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Fetch personas error:', data.error);
    throw new Error(data.error || 'Failed to fetch personas');
  }

  return data;
}

export async function createPersona(accessToken: string, personaData: Partial<Persona>): Promise<Persona> {
  const response = await fetch(`${API_BASE_URL}/personas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(personaData)
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Create persona error:', data.error);
    throw new Error(data.error || 'Failed to create persona');
  }

  return data.persona;
}

export async function updatePersona(accessToken: string, personaId: string, updates: Partial<Persona>): Promise<Persona> {
  const response = await fetch(`${API_BASE_URL}/personas/${personaId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(updates)
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Update persona error:', data.error);
    throw new Error(data.error || 'Failed to update persona');
  }

  return data.persona;
}

export async function deletePersona(accessToken: string, personaId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/personas/${personaId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Delete persona error:', data.error);
    throw new Error(data.error || 'Failed to delete persona');
  }
}

// Brand Profile
export interface BrandProfile {
  companyName?: string;
  industry?: string;
  website?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  extractedData?: any;
  brandVoice?: string;
  toneGuidelines?: string;
  dos?: string[];
  donts?: string[];
  extractedAt?: string;
}

export async function getBrandProfile(accessToken: string): Promise<{ brandProfile: BrandProfile | null }> {
  const response = await fetch(`${API_BASE_URL}/brand-profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Get brand profile error:', data.error);
    throw new Error(data.error || 'Failed to fetch brand profile');
  }

  return data;
}

export async function updateBrandProfile(accessToken: string, profileData: Partial<BrandProfile>): Promise<BrandProfile> {
  
  const response = await fetch(`${API_BASE_URL}/brand-profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify(profileData)
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Update brand profile error:', data.error);
    throw new Error(data.error || 'Failed to update brand profile');
  }

  return data.brandProfile;
}

export async function extractBrandVoice(accessToken: string, urls: string[]): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/brand-profile/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    },
    body: JSON.stringify({ urls })
  });

  const data = await response.json();
  
  if (!response.ok) {
    console.error('Extract brand voice error:', data.error);
    throw new Error(data.error || 'Failed to extract brand voice');
  }

  return data.extractedData;
}

"use client";

import { apiClient } from './api-client';

// Flask Backend API Client (DEPRECATED - use apiClient instead)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/user';

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

// Helper to get auth token from localStorage
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

// Helper to make authenticated requests
async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include', // Include cookies for NextAuth session
    cache: 'no-store', // Disable caching for authenticated requests
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data;
}

// Authentication (uses different base path than other endpoints)
const AUTH_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api/user', '') || 'http://localhost:5001';

export async function login(email: string, password: string) {
  const response = await fetch(`${AUTH_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies for session
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  // Store user data in localStorage
  if (typeof window !== 'undefined' && data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

export async function signup(email: string, password: string, name: string) {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Include cookies for session
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Signup failed');
  }

  // Store user data in localStorage
  if (typeof window !== 'undefined' && data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  return data;
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

// Agents
export async function getAgents(): Promise<Agent[]> {
  const response = await apiClient<{ success: boolean; data: Agent[] }>('/api/user/agents');
  return response.data || [];
}

export async function createAgent(agentData: Partial<Agent>): Promise<Agent> {
  const data = await fetchWithAuth('/agents', {
    method: 'POST',
    body: JSON.stringify(agentData),
  });
  return data.agent;
}

export async function updateAgent(agentId: string, updates: Partial<Agent>): Promise<Agent> {
  const data = await fetchWithAuth(`/agents/${agentId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.agent;
}

export async function deleteAgent(agentId: string): Promise<void> {
  await fetchWithAuth(`/agents/${agentId}`, {
    method: 'DELETE',
  });
}

// Dashboard Stats
export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiClient<{ success: boolean; data: DashboardStats }>('/api/user/stats');
  return response.data || response as any;
}

// Calls
export async function getCalls(limit: number = 50): Promise<{ calls: CallLog[]; total: number }> {
  const response = await apiClient<{ success: boolean; data: { calls: CallLog[]; total: number } }>(`/api/user/calls?limit=${limit}`);
  return response.data || { calls: [], total: 0 };
}

export async function getCallDetails(callId: string): Promise<CallLog> {
  const data = await fetchWithAuth(`/calls/${callId}`);
  return data.call;
}

// Phone Numbers
export async function getPhoneNumbers(): Promise<PhoneNumber[]> {
  const response = await apiClient<{ success: boolean; data: PhoneNumber[] }>('/api/user/phone-numbers');
  return response.data || [];
}

export async function assignPhoneNumber(phoneId: string, agentId: string | null): Promise<PhoneNumber> {
  const data = await fetchWithAuth(`/phone-numbers/${phoneId}/assign`, {
    method: 'POST',
    body: JSON.stringify({ agentId }),
  });
  return data.phoneNumber;
}

// Analytics
export async function getAnalytics(): Promise<AnalyticsData> {
  const response = await apiClient<{ success: boolean; data: AnalyticsData }>('/api/user/analytics');
  return response.data || response as any;
}

// Personas
export async function fetchPersonas(): Promise<{ personas: Persona[] }> {
  const response = await apiClient<{ success: boolean; data: Persona[] }>('/api/user/personas');
  return { personas: response.data || [] };
}

export async function createPersona(personaData: Partial<Persona>): Promise<Persona> {
  const data = await fetchWithAuth('/personas', {
    method: 'POST',
    body: JSON.stringify(personaData),
  });
  return data.persona;
}

export async function updatePersona(personaId: string, updates: Partial<Persona>): Promise<Persona> {
  const data = await fetchWithAuth(`/personas/${personaId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return data.persona;
}

export async function deletePersona(personaId: string): Promise<void> {
  await fetchWithAuth(`/personas/${personaId}`, {
    method: 'DELETE',
  });
}

// Brand Profile
export async function getBrandProfile(): Promise<{ brandProfile: BrandProfile | null }> {
  return await fetchWithAuth('/brand-profile');
}

export async function updateBrandProfile(profileData: Partial<BrandProfile>): Promise<BrandProfile> {
  const data = await fetchWithAuth('/brand-profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  return data.brandProfile;
}

export async function extractBrandVoice(urls: string[]): Promise<any> {
  const data = await fetchWithAuth('/brand-profile/extract', {
    method: 'POST',
    body: JSON.stringify({ urls }),
  });
  return data.extractedData;
}

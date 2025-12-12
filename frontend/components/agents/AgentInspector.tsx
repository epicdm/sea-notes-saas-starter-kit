'use client'

import { Agent } from '@/types/agent'
import { CallLog, CallStatus } from '@/types/call-log'
import { InspectorDrawer, InspectorSection, InspectorField } from '@/components/layout'
import { StatusBadge, StatusVariant } from '@/components/primitives'
import { AgentStatus } from '@/types/agent'
import { Tabs, Tab, Spinner } from '@heroui/react'
import {
  FileText,
  Mic,
  BarChart3,
  StickyNote,
  Phone,
  Clock,
  DollarSign,
  Calendar
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api-client'
import { Persona } from '@/types/persona'

export interface AgentInspectorProps {
  /** Agent to inspect */
  agent: Agent
  /** Call history for the agent */
  callHistory?: CallLog[]
  /** Whether drawer is open */
  open: boolean
  /** Close handler */
  onClose: () => void
}

/**
 * Map AgentStatus to StatusBadge variant
 */
function getAgentStatusVariant(status: AgentStatus): StatusVariant {
  switch (status) {
    case AgentStatus.ACTIVE:
    case AgentStatus.DEPLOYED:
      return 'running'
    case AgentStatus.DEPLOYING:
      return 'deploying'
    case AgentStatus.FAILED:
      return 'error'
    default:
      return 'inactive'
  }
}

/**
 * Map CallStatus to StatusBadge variant
 */
function getCallStatusVariant(status?: CallStatus): StatusVariant {
  switch (status) {
    case CallStatus.COMPLETED:
      return 'running'
    case CallStatus.IN_PROGRESS:
      return 'deploying'
    case CallStatus.FAILED:
      return 'error'
    default:
      return 'inactive'
  }
}

/**
 * Format CallStatus for display
 */
function formatCallStatus(status?: CallStatus): string {
  switch (status) {
    case CallStatus.COMPLETED:
      return 'Completed'
    case CallStatus.IN_PROGRESS:
      return 'In Progress'
    case CallStatus.FAILED:
      return 'Failed'
    case CallStatus.NO_ANSWER:
      return 'No Answer'
    case CallStatus.BUSY:
      return 'Busy'
    default:
      return 'Unknown'
  }
}

/**
 * Format duration in seconds to human readable
 */
function formatDuration(seconds?: number | null): string {
  if (!seconds) return 'N/A'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format cost in USD
 */
function formatCost(cost?: number | null): string {
  if (!cost) return '$0.00'
  return `$${cost.toFixed(4)}`
}

/**
 * Format date to human readable
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * AgentInspector - Detailed agent information drawer
 *
 * Features:
 * - Tabbed interface: Overview, Transcript, Recording, Analytics, Notes
 * - Overview: Agent configuration + last 10 calls
 * - InspectorDrawer wrapper with responsive design
 * - Call history with status indicators
 *
 * @example
 * ```tsx
 * <AgentInspector
 *   agent={selectedAgent}
 *   callHistory={agentCalls}
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 * />
 * ```
 */
export function AgentInspector({
  agent,
  callHistory = [],
  open,
  onClose
}: AgentInspectorProps) {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [persona, setPersona] = useState<Persona | null>(null)
  const [personaLoading, setPersonaLoading] = useState(false)

  // Get last 10 calls
  const recentCalls = callHistory.slice(0, 10)

  const agentStatusVariant = getAgentStatusVariant(agent.status)
  const agentStatusLabel = agent.status.charAt(0).toUpperCase() + agent.status.slice(1)

  // Fetch persona details when agent changes
  useEffect(() => {
    const fetchPersona = async () => {
      if (!agent.persona_id || !open) return

      try {
        setPersonaLoading(true)
        const personaData = await api.get<Persona>(`/api/user/personas/${agent.persona_id}`)
        setPersona(personaData)
      } catch (error) {
        console.error('Failed to fetch persona:', error)
        setPersona(null)
      } finally {
        setPersonaLoading(false)
      }
    }

    fetchPersona()
  }, [agent.persona_id, open])

  return (
    <InspectorDrawer
      open={open}
      onClose={onClose}
      title={agent.name}
      size="lg"
    >
      {/* Tabs */}
      <Tabs
        selectedKey={selectedTab}
        onSelectionChange={(key) => setSelectedTab(key as string)}
        className="w-full"
        classNames={{
          tabList: "w-full border-b border-border bg-background",
          cursor: "bg-primary",
          tab: "px-4 py-2",
          tabContent: "group-data-[selected=true]:text-foreground"
        }}
      >
        <Tab key="overview" title="Overview">
          <div className="space-y-6 p-4">
            {/* Basic Info */}
            <InspectorSection title="Agent Information">
              <div className="space-y-3">
                <InspectorField label="Status">
                  <StatusBadge variant={agentStatusVariant} label={agentStatusLabel} />
                </InspectorField>
                <InspectorField label="Persona">
                  {personaLoading ? (
                    <div className="flex items-center gap-2">
                      <Spinner size="sm" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  ) : persona ? (
                    <span className="font-medium">{persona.name}</span>
                  ) : (
                    <span className="text-muted-foreground">Not set</span>
                  )}
                </InspectorField>
                <InspectorField label="Description" value={agent.description || agent.instructions || 'No description'} />
                <InspectorField label="LLM Provider" value={agent.llm_provider} />
                <InspectorField label="LLM Model" value={agent.llm_model} />
                <InspectorField label="Voice" value={agent.voice || agent.realtime_voice || 'N/A'} />
              </div>
            </InspectorSection>

            {/* Configuration */}
            <InspectorSection title="Configuration">
              <div className="space-y-3">
                <InspectorField
                  label="Temperature"
                  value={agent.temperature?.toString() || 'Default'}
                />
                <InspectorField
                  label="Max Tokens"
                  value={agent.max_tokens?.toString() || 'Default'}
                />
                <InspectorField
                  label="VAD Enabled"
                  value={agent.vad_enabled ? 'Yes' : 'No'}
                />
                <InspectorField
                  label="VAD Threshold"
                  value={agent.vad_threshold?.toString() || 'Default'}
                />
                <InspectorField
                  label="Min Endpointing Delay"
                  value={agent.min_endpointing_delay ? `${agent.min_endpointing_delay}ms` : 'Default'}
                />
              </div>
            </InspectorSection>

            {/* Recent Calls */}
            <InspectorSection title="Recent Calls">
              {recentCalls.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No calls yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentCalls.map((call) => (
                    <div
                      key={call.id}
                      className="p-3 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {call.phone_number || call.caller_number || 'Unknown'}
                          </span>
                        </div>
                        <StatusBadge
                          variant={getCallStatusVariant(call.status)}
                          label={formatCallStatus(call.status)}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(call.duration_seconds)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatCost(call.cost_usd)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(call.started_at)}</span>
                        </div>
                      </div>

                      {call.room_name && (
                        <div className="mt-2 text-xs text-muted-foreground">
                          Room: <span className="font-mono">{call.room_name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </InspectorSection>
          </div>
        </Tab>

        <Tab
          key="transcript"
          title={
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Transcript</span>
            </div>
          }
        >
          <div className="p-4 text-center py-12">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Transcript view coming soon</p>
            <p className="text-sm text-muted-foreground mt-2">
              View detailed call transcripts and conversation history
            </p>
          </div>
        </Tab>

        <Tab
          key="recording"
          title={
            <div className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Recording</span>
            </div>
          }
        >
          <div className="p-4 text-center py-12">
            <Mic className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Recording playback coming soon</p>
            <p className="text-sm text-muted-foreground mt-2">
              Listen to call recordings and audio analysis
            </p>
          </div>
        </Tab>

        <Tab
          key="analytics"
          title={
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </div>
          }
        >
          <div className="p-4 text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Analytics dashboard coming soon</p>
            <p className="text-sm text-muted-foreground mt-2">
              View performance metrics, success rates, and insights
            </p>
          </div>
        </Tab>

        <Tab
          key="notes"
          title={
            <div className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              <span>Notes</span>
            </div>
          }
        >
          <div className="p-4 text-center py-12">
            <StickyNote className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Notes feature coming soon</p>
            <p className="text-sm text-muted-foreground mt-2">
              Add and manage notes about agent performance and configuration
            </p>
          </div>
        </Tab>
      </Tabs>
    </InspectorDrawer>
  )
}

'use client'

import { useState } from 'react'
import { Agent, AgentStatus } from '@/types/agent'
import { StatusBadge, StatusVariant } from '@/components/primitives'
import { MetricBox } from '@/components/MetricBox'
import { cn } from '@/lib/utils'
import {
  Bot,
  Eye,
  Edit,
  Copy,
  Trash2,
  Phone,
  CheckCircle,
  Clock,
  Play,
  Square,
  ChevronDown,
  ChevronUp,
  Mic,
  Video,
  Target
} from 'lucide-react'

export interface AgentInsightCardProps {
  /** Agent data */
  agent: Agent
  /** Agent metrics (optional) */
  metrics?: {
    callsToday: number
    successRate: number
    avgDuration: string | number // "2:34" or 154 seconds
    lastCallAt?: string | Date
    activeCalls?: number // NEW: Active calls count
    totalCalls?: number // NEW: Total calls
  }
  /** Agent tags for categorization */
  tags?: string[]
  /** Recording availability */
  hasRecordings?: boolean // NEW: Recording availability
  /** Campaign assignment */
  campaignName?: string // NEW: Campaign name
  /** Expand on hover */
  expandOnHover?: boolean // NEW: Enable hover expansion
  /** Event Handlers */
  onSelect?: (agent: Agent) => void
  onStart?: (agent: Agent) => void // NEW: Start/deploy action
  onStop?: (agent: Agent) => void // NEW: Stop/undeploy action
  onMonitor?: (agent: Agent) => void
  onEdit?: (agent: Agent) => void
  onDuplicate?: (agent: Agent) => void
  onDelete?: (agent: Agent) => void
  /** Additional CSS classes */
  className?: string
  /** Loading state */
  isLoading?: boolean // NEW: Show loading state
  /** Disable interactions */
  disabled?: boolean // NEW: Disable all interactions
}

/**
 * Map AgentStatus to StatusBadge variant
 */
function getStatusVariant(status: AgentStatus): StatusVariant {
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
 * Get display label for status
 */
function getStatusLabel(status: AgentStatus): string {
  switch (status) {
    case AgentStatus.DEPLOYED:
      return 'Running'
    case AgentStatus.DEPLOYING:
      return 'Deploying'
    case AgentStatus.UNDEPLOYING:
      return 'Stopping'
    case AgentStatus.FAILED:
      return 'Error'
    case AgentStatus.CREATED:
      return 'Created'
    case AgentStatus.ACTIVE:
      return 'Active'
    case AgentStatus.INACTIVE:
    default:
      return 'Inactive'
  }
}

/**
 * Check if Start action is enabled
 */
function canStart(status: AgentStatus): boolean {
  return ![
    AgentStatus.DEPLOYED,
    AgentStatus.DEPLOYING,
    AgentStatus.UNDEPLOYING,
    AgentStatus.ACTIVE
  ].includes(status)
}

/**
 * Check if Stop action is enabled
 */
function canStop(status: AgentStatus): boolean {
  return [
    AgentStatus.DEPLOYED,
    AgentStatus.ACTIVE
  ].includes(status)
}

/**
 * Format relative time (e.g., "5 minutes ago")
 */
function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffMs = now.getTime() - past.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
}

/**
 * Format duration (seconds to MM:SS or keep string)
 */
function formatDuration(duration: string | number): string {
  if (typeof duration === 'string') return duration

  const mins = Math.floor(duration / 60)
  const secs = duration % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Get voice provider display name
 */
function getVoiceProvider(agent: Agent): string {
  if (agent.tts_provider === 'openai') return 'OpenAI'
  if (agent.tts_provider === 'cartesia') return 'Cartesia'
  if (agent.tts_provider === 'elevenlabs') return 'ElevenLabs'
  if (agent.tts_provider === 'playht') return 'PlayHT'
  return agent.tts_provider
}

/**
 * Get model display name
 */
function getModelDisplay(model: string): string {
  if (model.includes('gpt-4o')) return 'GPT-4o'
  if (model.includes('gpt-4')) return 'GPT-4'
  if (model.includes('claude-3-5')) return 'Claude 3.5'
  if (model.includes('claude')) return 'Claude'
  return model
}

/**
 * AgentInsightCard - Enhanced agent display with comprehensive metrics
 *
 * NEW FEATURES v2.0:
 * - Start/Stop quick actions with status-based enabling
 * - Voice model badge showing TTS provider
 * - Expandable details section (hover to expand)
 * - Recording availability indicator
 * - Campaign assignment display
 * - Enhanced animations and transitions
 * - Active calls counter
 *
 * @example
 * ```tsx
 * <AgentInsightCard
 *   agent={agent}
 *   metrics={{
 *     callsToday: 42,
 *     successRate: 95,
 *     avgDuration: '2:34',
 *     lastCallAt: new Date(),
 *     activeCalls: 3
 *   }}
 *   tags={['Sales', 'Support']}
 *   hasRecordings={true}
 *   campaignName="Q4 Outreach"
 *   expandOnHover={true}
 *   onSelect={(agent) => openInspector(agent)}
 *   onStart={(agent) => deployAgent(agent)}
 *   onStop={(agent) => undeployAgent(agent)}
 *   onEdit={(agent) => router.push(`/agents/${agent.id}/edit`)}
 *   onDuplicate={(agent) => duplicateAgent(agent)}
 *   onDelete={(agent) => confirmDelete(agent)}
 * />
 * ```
 */
export function AgentInsightCard({
  agent,
  metrics,
  tags,
  hasRecordings = false,
  campaignName,
  expandOnHover = false,
  onSelect,
  onStart,
  onStop,
  onMonitor,
  onEdit,
  onDuplicate,
  onDelete,
  className,
  isLoading = false,
  disabled = false
}: AgentInsightCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [actionLoading, setActionLoading] = useState<'start' | 'stop' | null>(null)
  const [showConfirmStop, setShowConfirmStop] = useState(false)

  const statusVariant = getStatusVariant(agent.status)
  const statusLabel = getStatusLabel(agent.status)
  const showExpandedDetails = expandOnHover ? isHovered : isExpanded

  const handleCardClick = () => {
    if (!disabled && !isLoading) {
      onSelect?.(agent)
    }
  }

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  const handleStart = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!onStart || disabled || actionLoading) return

    setActionLoading('start')
    try {
      await onStart(agent)
    } finally {
      setActionLoading(null)
    }
  }

  const handleStopClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowConfirmStop(true)
  }

  const handleStopConfirm = async () => {
    if (!onStop || disabled || actionLoading) return

    setActionLoading('stop')
    setShowConfirmStop(false)
    try {
      await onStop(agent)
    } finally {
      setActionLoading(null)
    }
  }

  const handleStopCancel = () => {
    setShowConfirmStop(false)
  }

  return (
    <div
      className={cn(
        'group relative rounded-2xl border bg-card shadow-sm',
        'transition-all duration-300 ease-out',
        'hover:shadow-xl hover:border-primary/50',
        'cursor-pointer',
        'border-gray-200 dark:border-gray-800',
        showExpandedDetails && 'shadow-xl border-primary/50',
        (disabled || isLoading) && 'opacity-60 cursor-not-allowed',
        className
      )}
      style={{
        transform: isHovered && !disabled && !isLoading ? 'translateY(-4px) scale(1.01)' : 'translateY(0) scale(1)'
      }}
      onMouseEnter={() => !disabled && !isLoading && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Hover Toolbar - Hidden on mobile */}
      {isHovered && !disabled && !isLoading && (
        <div
          className={cn(
            'absolute -top-3 right-4 z-10',
            'hidden sm:flex items-center gap-1 px-2 py-1',
            'rounded-lg border border-border bg-card shadow-xl',
            'animate-in fade-in slide-in-from-top-2 duration-200'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Start Button */}
          {onStart && canStart(agent.status) && (
            <button
              onClick={handleStart}
              disabled={!!actionLoading}
              className="p-3 min-h-[44px] min-w-[44px] rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Start Agent"
              aria-label="Start agent"
            >
              {actionLoading === 'start' ? (
                <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Stop Button */}
          {onStop && canStop(agent.status) && (
            <button
              onClick={handleStopClick}
              disabled={!!actionLoading}
              className="p-3 min-h-[44px] min-w-[44px] rounded hover:bg-orange-100 dark:hover:bg-orange-900/30 text-muted-foreground hover:text-orange-600 dark:hover:text-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Stop Agent"
              aria-label="Stop agent"
            >
              {actionLoading === 'stop' ? (
                <div className="h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
            </button>
          )}

          {/* Monitor Button */}
          {onMonitor && (
            <button
              onClick={() => onMonitor(agent)}
              className="p-3 min-h-[44px] min-w-[44px] rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Monitor"
              aria-label="Monitor agent"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}

          {/* Edit Button */}
          {onEdit && (
            <button
              onClick={() => onEdit(agent)}
              className="p-3 min-h-[44px] min-w-[44px] rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Edit"
              aria-label="Edit agent"
            >
              <Edit className="h-4 w-4" />
            </button>
          )}

          {/* Duplicate Button */}
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(agent)}
              className="p-3 min-h-[44px] min-w-[44px] rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title="Duplicate"
              aria-label="Duplicate agent"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={() => onDelete(agent)}
              className="p-3 min-h-[44px] min-w-[44px] rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Delete"
              aria-label="Delete agent"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* Card Content - Responsive padding: p-4 mobile, p-5 tablet, p-6 desktop */}
      <div className="p-4 sm:p-5 lg:p-6 space-y-4">
        {/* Header: Status Badge + Recording Indicator */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <StatusBadge variant={statusVariant} label={statusLabel} />

            {/* Active Calls Indicator */}
            {metrics?.activeCalls && metrics.activeCalls > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {metrics.activeCalls} active
              </span>
            )}
          </div>

          {/* Recording Availability Indicator */}
          {hasRecordings && (
            <div
              className="px-2 py-1 rounded-md bg-purple-50 dark:bg-purple-900/20 flex items-center gap-1"
              title="Recordings available"
            >
              <Video className="h-3 w-3 text-purple-600 dark:text-purple-400" />
              <span className="text-xs font-medium text-purple-700 dark:text-purple-400">
                Rec
              </span>
            </div>
          )}
        </div>

        {/* Identity Section */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground truncate flex-1 max-w-[200px] sm:max-w-[250px] lg:max-w-full">
              {agent.name}
            </h3>
          </div>

          {/* Voice Model Badge - Responsive layout */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
              <Mic className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[10px] sm:text-xs font-medium text-indigo-700 dark:text-indigo-400">
                {getVoiceProvider(agent)}
              </span>
              {agent.voice && (
                <>
                  <span className="hidden sm:inline text-indigo-300 dark:text-indigo-600">•</span>
                  <span className="hidden sm:inline text-xs text-indigo-600 dark:text-indigo-400 capitalize truncate max-w-[80px]">
                    {agent.voice}
                  </span>
                </>
              )}
            </span>

            {/* Model Badge */}
            <span className="text-[10px] sm:text-xs text-muted-foreground">
              {getModelDisplay(agent.llm_model)}
            </span>
          </div>
        </div>

        {/* Campaign Assignment */}
        {campaignName && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <Target className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400 truncate">
                {campaignName}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500">
                Assigned Campaign
              </p>
            </div>
          </div>
        )}

        {/* Metrics Grid - Responsive: 1 col mobile, 2 cols small, 3 cols desktop */}
        {metrics && (
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            <MetricBox
              icon={Phone}
              value={metrics.callsToday}
              label="Today"
              color="blue"
            />
            <MetricBox
              icon={CheckCircle}
              value={`${metrics.successRate}%`}
              label="Success"
              color="green"
            />
            <MetricBox
              icon={Clock}
              value={formatDuration(metrics.avgDuration)}
              label="Avg Call"
              color="purple"
            />
          </div>
        )}

        {/* Last Call */}
        {metrics?.lastCallAt && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Last call: {formatRelativeTime(metrics.lastCallAt)}</span>
          </div>
        )}

        {/* Expandable Details Section */}
        {showExpandedDetails && (
          <div
            className="space-y-3 pt-3 border-t border-border animate-in fade-in slide-in-from-top-1 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Configuration Summary - Responsive grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <p className="text-muted-foreground">Language</p>
                <p className="font-medium text-foreground capitalize">
                  {agent.language || 'English'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground">Turn Detection</p>
                <p className="font-medium text-foreground capitalize">
                  {agent.turn_detection_model.replace('_', ' ')}
                </p>
              </div>
              {metrics?.totalCalls !== undefined && (
                <div className="space-y-1">
                  <p className="text-muted-foreground">Total Calls</p>
                  <p className="font-medium text-foreground">
                    {metrics.totalCalls}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-muted-foreground">Temperature</p>
                <p className="font-medium text-foreground">
                  {agent.temperature.toFixed(1)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tags - Smaller on mobile */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Mobile Action Buttons - Visible on mobile only */}
        <div className="flex sm:hidden gap-2 pt-2 border-t border-border">
          {onStart && canStart(agent.status) && (
            <button
              onClick={handleStart}
              disabled={!!actionLoading || disabled}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === 'start' ? (
                <div className="h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">Start</span>
            </button>
          )}
          {onStop && canStop(agent.status) && (
            <button
              onClick={handleStopClick}
              disabled={!!actionLoading || disabled}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading === 'stop' ? (
                <div className="h-4 w-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Square className="h-4 w-4" />
              )}
              <span className="text-xs font-medium">Stop</span>
            </button>
          )}
        </div>

        {/* Expand Toggle Button (only show if not using hover expansion) */}
        {!expandOnHover && (
          <button
            onClick={toggleExpanded}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3" />
                Show More
              </>
            )}
          </button>
        )}
      </div>

      {/* Confirmation Dialog for Stop Action */}
      {showConfirmStop && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleStopCancel}
        >
          <div
            className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <Square className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  Stop Agent?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Are you sure you want to stop <span className="font-medium text-foreground">{agent.name}</span>?
                  This will terminate any active calls and undeploy the agent.
                </p>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleStopCancel}
                className="px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStopConfirm}
                disabled={!!actionLoading}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {actionLoading === 'stop' ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Stopping...
                  </>
                ) : (
                  'Stop Agent'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

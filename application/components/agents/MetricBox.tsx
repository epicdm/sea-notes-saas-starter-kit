'use client'

import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface MetricBoxProps {
  /** Icon component from lucide-react */
  icon: LucideIcon
  /** Metric value (number or formatted string) */
  value: string | number
  /** Metric label */
  label: string
  /** Color theme variant */
  color?: 'blue' | 'green' | 'purple' | 'gray'
  /** Additional CSS classes */
  className?: string
}

/**
 * MetricBox - Compact metric display box
 *
 * Features:
 * - Icon + value + label vertical layout
 * - Color-coded background themes
 * - Dark mode support
 * - Used in AgentInsightCard metrics grid
 *
 * @example
 * ```tsx
 * <MetricBox
 *   icon={Phone}
 *   value={42}
 *   label="Today"
 *   color="blue"
 * />
 * ```
 */
export function MetricBox({
  icon: Icon,
  value,
  label,
  color = 'gray',
  className
}: MetricBoxProps) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900/30',
    green: 'bg-green-50 dark:bg-green-900/30',
    purple: 'bg-purple-50 dark:bg-purple-900/30',
    gray: 'bg-gray-50 dark:bg-gray-800'
  }

  return (
    <div
      className={cn(
        'rounded-lg p-3 text-center transition-colors',
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-center justify-center mb-1">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}

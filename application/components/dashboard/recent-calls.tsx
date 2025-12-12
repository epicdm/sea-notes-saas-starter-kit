"use client";

import { Chip } from "@heroui/react";
import { CallLog, CallStatus, formatDuration, formatCost, getCallStatusColor } from "@/types/call-log";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

interface RecentCallsProps {
  calls: CallLog[];
  isLoading?: boolean;
}

/**
 * Recent Calls Widget (T042)
 * Displays the last 5 calls with key information
 *
 * Features:
 * - Skeleton loader support (FR-UX-001)
 * - Formatted duration and cost
 * - Status badges with colors
 * - Empty state
 * - Click to view full history
 */
export function RecentCalls({ calls, isLoading = false }: RecentCallsProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Recent Calls</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div className="flex-1 space-y-2">
                <Skeleton className="w-32 h-4" />
                <Skeleton className="w-48 h-3" />
              </div>
              <Skeleton className="w-16 h-6" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (calls.length === 0) {
    return (
      <div className="w-full bg-card border border-border rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold">Recent Calls</h3>
        </div>
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            No recent calls yet
          </p>
          <p className="text-xs text-muted-foreground">
            Calls will appear here once your agents start receiving calls
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Calls</h3>
        <a
          href="/dashboard/calls"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          View All →
        </a>
      </div>
      <div className="space-y-0" data-testid="recent-calls-table">
        {calls.slice(0, 5).map((call) => (
          <div
            key={call.id}
            className="flex items-center justify-between py-3 border-b border-border last:border-b-0 hover:bg-muted/50 rounded px-3 transition-colors"
          >
            {/* Left side - Call info */}
            <div className="flex-1 min-w-0">
              {/* Agent name */}
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {call.agent_name}
                </p>
                <Chip
                  size="sm"
                  color={getCallStatusColor(call.status || CallStatus.COMPLETED).color}
                  variant="flat"
                  className="text-xs"
                >
                  {getCallStatusColor(call.status || CallStatus.COMPLETED).label}
                </Chip>
              </div>

              {/* Phone number and time */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {call.phone_number}
                </span>
                <span className="flex items-center gap-1">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatDistanceToNow(new Date(call.started_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>

            {/* Right side - Duration and cost */}
            <div className="flex flex-col items-end ml-4 flex-shrink-0">
              <p className="text-sm font-semibold text-foreground">
                {formatDuration(call.duration_seconds)}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatCost(call.cost_usd || call.cost || 0)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer link */}
      {calls.length > 5 && (
        <div className="mt-4 pt-4 border-t border-border text-center">
          <a
            href="/dashboard/calls"
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all {calls.length} calls →
          </a>
        </div>
      )}
    </div>
  );
}

"use client";

import { Card, CardBody } from "@heroui/react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Bot, Phone, Activity, Calendar, DollarSign, Wallet } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  icon?: React.ReactNode;
  isLoading?: boolean;
  className?: string;
}

/**
 * Stat Card Component (T041)
 * Displays a statistic with optional trend indicator
 *
 * Features:
 * - Skeleton loader support (FR-UX-001)
 * - Optional trend indicator with color coding
 * - Optional icon with gradient background
 * - Modern card design with subtle shadows
 * - Smooth hover effects
 */
export function StatCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  isLoading = false,
  className,
}: StatCardProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "w-full bg-card border border-border rounded-lg p-6",
          className
        )}
        data-testid="stat-skeleton"
      >
        <div className="space-y-3">
          <Skeleton className="w-24 h-4" />
          <Skeleton className="w-32 h-8" />
          {subtitle && <Skeleton className="w-40 h-3" />}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-full bg-card border border-border rounded-lg p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/30",
        className
      )}
      data-testid="stat-card"
    >
      <div className="flex items-start justify-between">
        {/* Left side - Stats */}
        <div className="flex-1">
          {/* Title */}
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {title}
          </p>

          {/* Value */}
          <p
            className="text-4xl font-bold text-foreground mb-1"
            data-testid="stat-value"
          >
            {value}
          </p>

          {/* Subtitle */}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}

          {/* Trend Indicator */}
          {trend && (
            <div className="flex items-center mt-3 pt-2">
              {trend.isPositive ? (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/30">
                  <svg
                    className="w-3 h-3 text-emerald-600 dark:text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    +{trend.value}%
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 dark:bg-red-950/30">
                  <svg
                    className="w-3 h-3 text-red-600 dark:text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-red-700 dark:text-red-400">
                    {trend.value}%
                  </span>
                </div>
              )}
              {trend.label && (
                <span className="text-xs text-muted-foreground ml-2">
                  {trend.label}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side - Icon */}
        {icon && (
          <div className="ml-4 flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Pre-built stat card variants for common use cases
 */

interface StatCardVariantProps {
  value: string | number;
  subtitle?: string;
  trend?: StatCardProps["trend"];
  isLoading?: boolean;
}

export function TotalAgentsCard({ value, subtitle, trend, isLoading }: StatCardVariantProps) {
  return (
    <StatCard
      title="Total Agents"
      value={value}
      subtitle={subtitle}
      trend={trend}
      isLoading={isLoading}
      icon={
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 shadow-lg">
          <Bot className="h-7 w-7 text-white" />
        </div>
      }
    />
  );
}

export function PhoneNumbersCard({ value, subtitle, trend, isLoading }: StatCardVariantProps) {
  return (
    <StatCard
      title="Phone Numbers"
      value={value}
      subtitle={subtitle}
      trend={trend}
      isLoading={isLoading}
      icon={
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-green-600 to-teal-700 shadow-lg">
          <Phone className="h-7 w-7 text-white" />
        </div>
      }
    />
  );
}

export function CallsTodayCard({ value, subtitle, trend, isLoading }: StatCardVariantProps) {
  return (
    <StatCard
      title="Calls Today"
      value={value}
      subtitle={subtitle}
      trend={trend}
      isLoading={isLoading}
      icon={
        <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 via-amber-600 to-orange-700 shadow-lg">
          <div className="absolute inset-0 rounded-xl bg-orange-400 animate-pulse opacity-50"></div>
          <Activity className="h-7 w-7 text-white relative z-10" />
        </div>
      }
    />
  );
}

export function CallsMonthCard({ value, subtitle, trend, isLoading }: StatCardVariantProps) {
  return (
    <StatCard
      title="Calls This Month"
      value={value}
      subtitle={subtitle}
      trend={trend}
      isLoading={isLoading}
      icon={
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 via-sky-600 to-blue-700 shadow-lg">
          <Calendar className="h-7 w-7 text-white" />
        </div>
      }
    />
  );
}

export function CostTodayCard({ value, subtitle, trend, isLoading }: StatCardVariantProps) {
  return (
    <StatCard
      title="Cost Today"
      value={value}
      subtitle={subtitle}
      trend={trend}
      isLoading={isLoading}
      icon={
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 via-violet-600 to-indigo-700 shadow-lg">
          <DollarSign className="h-7 w-7 text-white" />
        </div>
      }
    />
  );
}

export function CostMonthCard({ value, subtitle, trend, isLoading }: StatCardVariantProps) {
  return (
    <StatCard
      title="Cost This Month"
      value={value}
      subtitle={subtitle}
      trend={trend}
      isLoading={isLoading}
      icon={
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 via-rose-600 to-red-700 shadow-lg">
          <Wallet className="h-7 w-7 text-white" />
        </div>
      }
    />
  );
}

"use client"

import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Progress } from '@/components/ui/progress'

interface FunnelAnalyticsDialogProps {
  open: boolean
  onClose: () => void
  funnel: {
    id: string
    name: string
    totalCalls: number
    qualified: number
    booked: number
    conversion: number
  }
}

export default function FunnelAnalyticsDialog({
  open,
  onClose,
  funnel,
}: FunnelAnalyticsDialogProps) {
  const portalRoot =
    typeof document !== 'undefined'
      ? document.getElementById('portal-root')
      : undefined

  // Debug logging
  useEffect(() => {
    console.log('🔍 FunnelAnalyticsDialog mounted', { open, funnel, portalRoot });
  }, [open, funnel, portalRoot]);

  // Lock background scroll when dialog open
  useEffect(() => {
    if (open) {
      console.log('✅ Dialog opened - locking scroll');
      document.body.style.overflow = 'hidden';
    } else {
      console.log('❌ Dialog closed - unlocking scroll');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    }
  }, [open])

  // Mock chart data – replace with real API data later
  const chartData = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, i) => ({
        day: `Day ${i + 1}`,
        calls: Math.floor(funnel.totalCalls / 7 + Math.random() * 20),
        qualified: Math.floor(funnel.qualified / 7 + Math.random() * 10),
        booked: Math.floor(funnel.booked / 7 + Math.random() * 5),
      })),
    [funnel]
  )

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal container={portalRoot}>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999]" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-[100000] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-slate-900 p-6 shadow-xl focus-visible:outline-none"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-semibold text-slate-900 dark:text-white">
              {funnel.name} – Analytics
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 rounded-md bg-slate-50 dark:bg-slate-800">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Total Calls</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{funnel.totalCalls}</p>
            </div>
            <div className="text-center p-4 rounded-md bg-slate-50 dark:bg-slate-800">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Qualified</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{funnel.qualified}</p>
            </div>
            <div className="text-center p-4 rounded-md bg-slate-50 dark:bg-slate-800">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Booked</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{funnel.booked}</p>
            </div>
            <div className="text-center p-4 rounded-md bg-slate-50 dark:bg-slate-800">
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-1">Conversion</p>
              <Progress 
                value={funnel.conversion} 
                className="h-2 mb-1"
              />
              <p className="font-semibold text-slate-900 dark:text-white">{funnel.conversion}%</p>
            </div>
          </div>

          {/* Chart Section */}
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
              >
                <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="calls"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  name="Calls"
                />
                <Line
                  type="monotone"
                  dataKey="qualified"
                  stroke="#22c55e"
                  strokeWidth={2}
                  name="Qualified"
                />
                <Line
                  type="monotone"
                  dataKey="booked"
                  stroke="#6366f1"
                  strokeWidth={2}
                  name="Booked"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

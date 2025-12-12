'use client'

import { useState, useMemo, memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft, 
  Phone, 
  Calendar, 
  TrendingUp, 
  Users, 
  Clock, 
  Download, 
  Settings as SettingsIcon,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts'

interface FunnelAnalyticsPanelProps {
  funnel: any
  onClose: () => void
}

const COLORS = {
  hot: '#10b981',
  warm: '#f59e0b',
  cool: '#3b82f6',
  cold: '#64748b',
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b'
}

// Memoized Stat Card Component
const AnalyticsStatCard = memo(({ 
  value, 
  label, 
  sublabel, 
  color = 'default',
  trend 
}: { 
  value: string | number
  label: string
  sublabel?: string
  color?: 'default' | 'success' | 'warning' | 'info'
  trend?: string
}) => {
  const colorClasses = {
    default: 'text-slate-900 dark:text-slate-100',
    success: 'text-emerald-600 dark:text-emerald-400',
    warning: 'text-orange-600 dark:text-orange-400',
    info: 'text-blue-600 dark:text-blue-400'
  }

  return (
    <Card className="hover:shadow-md transition-all duration-300">
      <CardContent className="p-6">
        <div className={`text-3xl font-bold tracking-tight mb-1 ${colorClasses[color]}`}>
          {value}
        </div>
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
          {label}
        </div>
        {(sublabel || trend) && (
          <div className="text-xs text-slate-500 dark:text-slate-500">
            {trend && <span className="text-emerald-600 dark:text-emerald-400">{trend}</span>}
            {sublabel && <span>{sublabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
})

AnalyticsStatCard.displayName = 'AnalyticsStatCard'

// Custom Tooltip Component
const CustomTooltip = memo(({ active, payload, label }: any) => {
  if (!active || !payload || !payload.length) return null

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl p-4">
      <p className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{label}</p>
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
            aria-hidden="true"
          />
          <span className="text-slate-600 dark:text-slate-400">{entry.name}:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-100">{entry.value}</span>
        </div>
      ))}
    </div>
  )
})

CustomTooltip.displayName = 'CustomTooltip'

export function FunnelAnalyticsPanel({ funnel, onClose }: FunnelAnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState('analytics')

  // Memoized chart data
  const callVolumeData = useMemo(() => [
    { day: 'Mon', calls: 12, qualified: 7, booked: 4 },
    { day: 'Tue', calls: 19, qualified: 11, booked: 6 },
    { day: 'Wed', calls: 15, qualified: 9, booked: 5 },
    { day: 'Thu', calls: 22, qualified: 13, booked: 8 },
    { day: 'Fri', calls: 18, qualified: 10, booked: 6 },
    { day: 'Sat', calls: 9, qualified: 5, booked: 2 },
    { day: 'Sun', calls: 7, qualified: 4, booked: 2 },
  ], [])

  const leadScoreData = useMemo(() => [
    { name: 'Hot (80-100)', value: 28, color: COLORS.hot },
    { name: 'Warm (60-79)', value: 42, color: COLORS.warm },
    { name: 'Cool (40-59)', value: 19, color: COLORS.cool },
    { name: 'Cold (0-39)', value: 11, color: COLORS.cold },
  ], [])

  const conversionFunnelData = useMemo(() => [
    { 
      stage: 'Total Calls', 
      value: funnel.stats?.totalCalls || 156, 
      percentage: 100,
      color: COLORS.primary
    },
    { 
      stage: 'Completed', 
      value: funnel.stats?.completed || 134, 
      percentage: 86,
      color: COLORS.secondary
    },
    { 
      stage: 'Qualified', 
      value: funnel.stats?.hotLeads || 89, 
      percentage: 57,
      color: COLORS.success
    },
    { 
      stage: 'Booked', 
      value: funnel.stats?.booked || 67, 
      percentage: 43,
      color: COLORS.warning
    },
  ], [funnel.stats])

  const stats = useMemo(() => ({
    totalCalls: funnel.stats?.totalCalls || 156,
    hotLeads: funnel.stats?.hotLeads || 89,
    warmLeads: Math.floor((funnel.stats?.totalCalls || 156) * 0.18),
    booked: funnel.stats?.booked || 67,
    avgDuration: funnel.stats?.avgDuration || '4:32',
    conversionRate: funnel.stats?.conversionRate || 50
  }), [funnel.stats])

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[99999] overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <div className="max-w-7xl mx-auto p-6 sm:p-8 space-y-8">
          {/* Header */}
          <header className="space-y-6">
            <Button
              variant="ghost"
              onClick={onClose}
              className="hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -ml-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
              Back to Funnels
            </Button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    {funnel.name}
                  </h1>
                  <Badge 
                    variant={funnel.status === 'active' ? 'default' : 'secondary'}
                    className="text-sm px-3 py-1"
                  >
                    <span 
                      className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        funnel.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`}
                      aria-hidden="true"
                    />
                    {funnel.status === 'active' ? 'Live' : funnel.status}
                  </Badge>
                </div>
                <p className="text-base text-slate-600 dark:text-slate-400 max-w-2xl">
                  {funnel.description}
                </p>
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" aria-hidden="true" />
                    <span>{funnel.phoneNumber || '(757) 818-9426'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" aria-hidden="true" />
                    <span>Created {new Date(funnel.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 shrink-0">
                <Button 
                  variant="outline"
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" aria-hidden="true" />
                  Export
                </Button>
                <Button 
                  variant="outline"
                  className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <SettingsIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                  Edit Funnel
                </Button>
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <section aria-labelledby="stats-heading">
            <h2 id="stats-heading" className="sr-only">Performance Statistics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <AnalyticsStatCard
                value={stats.totalCalls}
                label="Total Calls"
                trend="+14% this week"
                color="default"
              />
              <AnalyticsStatCard
                value={stats.hotLeads}
                label="Hot Leads"
                sublabel="≥70 points"
                color="success"
              />
              <AnalyticsStatCard
                value={stats.warmLeads}
                label="Warm Leads"
                sublabel="40-70 points"
                color="warning"
              />
              <AnalyticsStatCard
                value={stats.booked}
                label="Appointments"
                sublabel={`${stats.conversionRate}% conversion`}
                color="info"
              />
              <AnalyticsStatCard
                value={stats.avgDuration}
                label="Avg Call Time"
                sublabel="minutes"
                color="default"
              />
            </div>
          </section>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-slate-100 dark:bg-slate-900 p-1">
              <TabsTrigger 
                value="analytics"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
              >
                <Activity className="h-4 w-4 mr-2" aria-hidden="true" />
                Analytics
              </TabsTrigger>
              <TabsTrigger 
                value="leads"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
              >
                <Users className="h-4 w-4 mr-2" aria-hidden="true" />
                Leads (0)
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800"
              >
                <SettingsIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                Settings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics" className="space-y-6">
              {/* Performance Header */}
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30">
                      <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Performance Analytics</CardTitle>
                      <CardDescription>Last 7 Days Performance Overview</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Charts Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Call Volume & Conversions Chart */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                      Call Volume & Conversions
                    </CardTitle>
                    <CardDescription>Daily performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <AreaChart data={callVolumeData}>
                        <defs>
                          <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                          </linearGradient>
                          <linearGradient id="colorBooked" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                        <XAxis 
                          dataKey="day" 
                          className="text-xs" 
                          tick={{ fill: 'currentColor' }}
                          stroke="currentColor"
                        />
                        <YAxis 
                          className="text-xs" 
                          tick={{ fill: 'currentColor' }}
                          stroke="currentColor"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                        <Area 
                          type="monotone" 
                          dataKey="calls" 
                          stroke="#3b82f6" 
                          fillOpacity={1}
                          fill="url(#colorCalls)"
                          name="Total Calls"
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="qualified" 
                          stroke="#10b981" 
                          fillOpacity={1}
                          fill="url(#colorQualified)"
                          name="Qualified"
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="booked" 
                          stroke="#f59e0b" 
                          fillOpacity={1}
                          fill="url(#colorBooked)"
                          name="Booked"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Lead Score Distribution */}
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      Lead Score Distribution
                    </CardTitle>
                    <CardDescription>Qualification breakdown</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={320}>
                      <PieChart>
                        <Pie
                          data={leadScoreData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={110}
                          fill="#8884d8"
                          dataKey="value"
                          strokeWidth={2}
                          stroke="white"
                        >
                          {leadScoreData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Conversion Funnel */}
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                    Conversion Funnel
                  </CardTitle>
                  <CardDescription>Lead journey through qualification stages</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {conversionFunnelData.map((stage, index) => (
                      <div key={stage.stage} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {stage.stage}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {stage.value.toLocaleString()} leads
                            </span>
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 min-w-[60px] text-right">
                              {stage.percentage}%
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-10 overflow-hidden shadow-inner">
                          <div
                            className="h-10 rounded-full flex items-center justify-center text-sm font-medium text-white transition-all duration-500 ease-out shadow-lg"
                            style={{ 
                              width: `${stage.percentage}%`,
                              backgroundColor: stage.color
                            }}
                            role="progressbar"
                            aria-valuenow={stage.percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${stage.stage}: ${stage.percentage}%`}
                          >
                            {stage.percentage >= 25 && (
                              <span className="px-4 font-semibold">
                                {stage.value} • {stage.percentage}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                      {conversionFunnelData.map((stage) => (
                        <div key={stage.stage} className="space-y-2">
                          <div 
                            className="text-3xl font-bold tracking-tight"
                            style={{ color: stage.color }}
                          >
                            {stage.value}
                          </div>
                          <div className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {stage.stage}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-500">
                            {stage.percentage}% conversion
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leads" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funnel Leads</CardTitle>
                  <CardDescription>All leads captured through this funnel</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                      <Users className="h-12 w-12 text-slate-400 dark:text-slate-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      No leads captured yet
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                      Leads will appear here once calls are processed through this funnel.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Funnel Settings</CardTitle>
                  <CardDescription>Configure funnel behavior and integrations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                      <SettingsIcon className="h-12 w-12 text-slate-400 dark:text-slate-600" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      Settings panel coming soon
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                      Use the "Edit Funnel" button to modify funnel configuration.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

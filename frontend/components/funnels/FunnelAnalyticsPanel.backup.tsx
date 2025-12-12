'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Phone, Calendar, TrendingUp, Users, Clock, Download, Settings as SettingsIcon } from 'lucide-react'
import { AreaChart, Area, PieChart, Pie, BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface FunnelAnalyticsPanelProps {
  funnel: any
  onClose: () => void
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6']

export function FunnelAnalyticsPanel({ funnel, onClose }: FunnelAnalyticsPanelProps) {
  const [activeTab, setActiveTab] = useState('analytics')

  // Mock data for charts
  const callVolumeData = [
    { day: 'Mon', calls: 12, qualified: 7, booked: 4 },
    { day: 'Tue', calls: 19, qualified: 11, booked: 6 },
    { day: 'Wed', calls: 15, qualified: 9, booked: 5 },
    { day: 'Thu', calls: 22, qualified: 13, booked: 8 },
    { day: 'Fri', calls: 18, qualified: 10, booked: 6 },
    { day: 'Sat', calls: 9, qualified: 5, booked: 2 },
    { day: 'Sun', calls: 7, qualified: 4, booked: 2 },
  ]

  const leadScoreData = [
    { name: 'Hot (80-100)', value: 28, color: '#10b981' },
    { name: 'Warm (60-79)', value: 42, color: '#f59e0b' },
    { name: 'Cool (40-59)', value: 19, color: '#3b82f6' },
    { name: 'Cold (0-39)', value: 11, color: '#64748b' },
  ]

  const conversionFunnelData = [
    { stage: 'Total Calls', value: funnel.stats?.totalCalls || 156, percentage: 100 },
    { stage: 'Completed', value: funnel.stats?.completed || 134, percentage: 86 },
    { stage: 'Qualified', value: funnel.stats?.hotLeads || 89, percentage: 57 },
    { stage: 'Booked', value: funnel.stats?.booked || 67, percentage: 43 },
  ]

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[99999] overflow-y-auto">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={onClose}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Funnels
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{funnel.name}</h1>
                <Badge variant={funnel.status === 'active' ? 'default' : 'secondary'}>
                  ● {funnel.status === 'active' ? 'Live' : funnel.status}
                </Badge>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-3">
                {funnel.description}
              </p>
              <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {funnel.phoneNumber || '(757) 818-9426'}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Created {new Date(funnel.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Edit Funnel
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{funnel.stats?.totalCalls || 156}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Calls</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                +14% this week
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {funnel.stats?.hotLeads || 89}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Hot Leads</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                ≥70 points
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {Math.floor((funnel.stats?.totalCalls || 156) * 0.18)}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Warm Leads</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                40-70 points
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{funnel.stats?.booked || 67}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Appointments</div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                {funnel.stats?.conversionRate || 50}% conversion
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{funnel.stats?.avgDuration || '4:32'}</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Avg Call Time</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                minutes
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="leads">Leads (0)</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Last 7 Days</CardDescription>
              </CardHeader>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Call Volume & Conversions Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Call Volume & Conversions</CardTitle>
                  <CardDescription>Daily performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={callVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
                      <XAxis dataKey="day" className="text-xs" tick={{ fill: 'currentColor' }} />
                      <YAxis className="text-xs" tick={{ fill: 'currentColor' }} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="booked" 
                        stackId="1"
                        stroke="#f59e0b" 
                        fill="#fbbf24" 
                        fillOpacity={0.8}
                        name="Booked"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="qualified" 
                        stackId="1"
                        stroke="#10b981" 
                        fill="#34d399" 
                        fillOpacity={0.8}
                        name="Qualified"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="calls" 
                        stackId="1"
                        stroke="#3b82f6" 
                        fill="#60a5fa" 
                        fillOpacity={0.8}
                        name="Total Calls"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Lead Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Lead Score Distribution</CardTitle>
                  <CardDescription>Qualification breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={leadScoreData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {leadScoreData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>Lead journey through qualification stages</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {conversionFunnelData.map((stage, index) => (
                    <div key={stage.stage}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{stage.stage}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-600 dark:text-slate-400">
                            {stage.value}
                          </span>
                          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                            {stage.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-8">
                        <div
                          className={`h-8 rounded-full flex items-center justify-center text-sm font-medium text-white transition-all ${
                            index === 0 ? 'bg-blue-600' :
                            index === 1 ? 'bg-purple-600' :
                            index === 2 ? 'bg-green-600' :
                            'bg-orange-600'
                          }`}
                          style={{ width: `${stage.percentage}%` }}
                        >
                          {stage.percentage >= 30 && (
                            <span className="px-4">
                              {stage.value} • {stage.percentage}% conversion
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 pt-6 border-t">
                  <div className="grid grid-cols-4 gap-4 text-center">
                    {conversionFunnelData.map((stage) => (
                      <div key={stage.stage}>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {stage.value}
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                          {stage.stage}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          {stage.percentage}% conversion
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leads" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Funnel Leads</CardTitle>
                <CardDescription>All leads captured through this funnel</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No leads captured yet for this funnel.</p>
                  <p className="text-sm mt-2">
                    Leads will appear here once calls are processed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Funnel Settings</CardTitle>
                <CardDescription>Configure funnel behavior and integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-600 dark:text-slate-400">
                  <SettingsIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Settings panel coming soon.</p>
                  <p className="text-sm mt-2">
                    Use the "Edit Funnel" button to modify funnel configuration.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

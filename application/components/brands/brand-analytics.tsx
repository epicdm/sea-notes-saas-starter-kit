'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, TrendingDown, Phone, Clock, DollarSign, CheckCircle, AlertCircle, Download, FileText, FileSpreadsheet, Filter, X } from 'lucide-react'
import { api } from '@/lib/api'
import { toast } from 'sonner'

interface AnalyticsData {
  brand_id: string
  brand_name: string
  total_calls: number
  success_rate: number
  avg_duration: number
  total_cost: number
  calls_by_outcome: { [key: string]: number }
  calls_by_day: Array<{ date: string; count: number }>
  agent_performance: Array<{
    agent_id: string
    agent_name: string
    calls: number
    success_rate: number
  }>
  date_range: {
    start: string
    end: string
  }
}

interface FilterOptions {
  agents: Array<{ id: string; name: string }>
  outcomes: string[]
  directions: string[]
  time_of_day: Array<{ value: string; label: string }>
}

interface BrandAnalyticsProps {
  brandId: string
  days?: number
}

export function BrandAnalytics({ brandId, days = 30 }: BrandAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDays, setSelectedDays] = useState(days)
  const [exporting, setExporting] = useState(false)

  // Filter state
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null)
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([])
  const [selectedDirection, setSelectedDirection] = useState<string>('')
  const [selectedTimeOfDay, setSelectedTimeOfDay] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchFilterOptions()
  }, [brandId])

  useEffect(() => {
    fetchAnalytics()
  }, [brandId, selectedDays, selectedAgents, selectedOutcomes, selectedDirection, selectedTimeOfDay])

  const fetchFilterOptions = async () => {
    try {
      const response = await api.get<{ success: boolean; data: FilterOptions }>(
        `/api/brands/${brandId}/analytics/filters`
      )
      if (response.success) {
        setFilterOptions(response.data)
      }
    } catch (err) {
      console.error('Error fetching filter options:', err)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query params
      const params = new URLSearchParams()
      params.append('days', selectedDays.toString())
      if (selectedAgents.length > 0) {
        params.append('agent_ids', selectedAgents.join(','))
      }
      if (selectedOutcomes.length > 0) {
        params.append('outcomes', selectedOutcomes.join(','))
      }
      if (selectedDirection) {
        params.append('direction', selectedDirection)
      }
      if (selectedTimeOfDay) {
        params.append('time_of_day', selectedTimeOfDay)
      }

      const response = await api.get<{ success: boolean; data: AnalyticsData }>(
        `/api/brands/${brandId}/analytics?${params.toString()}`
      )
      if (response.success) {
        setData(response.data)
      } else {
        setError('Failed to load analytics')
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setSelectedAgents([])
    setSelectedOutcomes([])
    setSelectedDirection('')
    setSelectedTimeOfDay('')
  }

  const hasActiveFilters = selectedAgents.length > 0 || selectedOutcomes.length > 0 || selectedDirection || selectedTimeOfDay

  const handleExport = async (format: 'csv' | 'pdf') => {
    try {
      setExporting(true)

      // Build query params with filters
      const params = new URLSearchParams()
      params.append('days', selectedDays.toString())
      if (selectedAgents.length > 0) {
        params.append('agent_ids', selectedAgents.join(','))
      }
      if (selectedOutcomes.length > 0) {
        params.append('outcomes', selectedOutcomes.join(','))
      }
      if (selectedDirection) {
        params.append('direction', selectedDirection)
      }
      if (selectedTimeOfDay) {
        params.append('time_of_day', selectedTimeOfDay)
      }

      const response = await fetch(
        `/api/brands/${brandId}/analytics/export/${format}?${params.toString()}`,
        {
          method: 'GET',
          headers: {
            'X-User-Email': 'giraud.eric@gmail.com', // TODO: Get from auth context
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to export ${format.toUpperCase()}`)
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition')
      const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/)
      const filename = filenameMatch ? filenameMatch[1] : `analytics_${Date.now()}.${format}`

      // Download file
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`Analytics exported as ${format.toUpperCase()}`)
    } catch (err) {
      console.error('Export error:', err)
      toast.error(`Failed to export ${format.toUpperCase()}`)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mr-2" />
            <p>{error || 'No data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Format duration in minutes:seconds
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Prepare outcome data for pie chart
  const outcomeData = Object.entries(data.calls_by_outcome).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  const COLORS = {
    completed: '#10b981',
    failed: '#ef4444',
    no_answer: '#f59e0b',
    busy: '#f97316',
    voicemail: '#8b5cf6',
    unknown: '#6b7280',
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector and Export Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          {[7, 14, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedDays === d
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80'
              }`}
            >
              Last {d} days
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                {[selectedAgents.length, selectedOutcomes.length, selectedDirection ? 1 : 0, selectedTimeOfDay ? 1 : 0]
                  .filter(n => n > 0).length}
              </Badge>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('csv')}
            disabled={exporting || !data || data.total_calls === 0}
            className="gap-2"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleExport('pdf')}
            disabled={exporting || !data || data.total_calls === 0}
            className="gap-2"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && filterOptions && (
        <Card className="border-2 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filter Analytics</h3>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Agent Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Agent</label>
                  <Select
                    value={selectedAgents.length === 1 ? selectedAgents[0] : ''}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setSelectedAgents([])
                      } else {
                        // Toggle agent selection
                        if (selectedAgents.includes(value)) {
                          setSelectedAgents(selectedAgents.filter(id => id !== value))
                        } else {
                          setSelectedAgents([...selectedAgents, value])
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        selectedAgents.length === 0
                          ? 'All agents'
                          : selectedAgents.length === 1
                          ? filterOptions.agents.find(a => a.id === selectedAgents[0])?.name
                          : `${selectedAgents.length} agents selected`
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Agents</SelectItem>
                      {filterOptions.agents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {selectedAgents.includes(agent.id) ? '✓ ' : ''}{agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Outcome Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Outcome</label>
                  <Select
                    value={selectedOutcomes.length === 1 ? selectedOutcomes[0] : ''}
                    onValueChange={(value) => {
                      if (value === 'all') {
                        setSelectedOutcomes([])
                      } else {
                        // Toggle outcome selection
                        if (selectedOutcomes.includes(value)) {
                          setSelectedOutcomes(selectedOutcomes.filter(o => o !== value))
                        } else {
                          setSelectedOutcomes([...selectedOutcomes, value])
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        selectedOutcomes.length === 0
                          ? 'All outcomes'
                          : selectedOutcomes.length === 1
                          ? selectedOutcomes[0].charAt(0).toUpperCase() + selectedOutcomes[0].slice(1)
                          : `${selectedOutcomes.length} outcomes selected`
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Outcomes</SelectItem>
                      {filterOptions.outcomes.map((outcome) => (
                        <SelectItem key={outcome} value={outcome}>
                          {selectedOutcomes.includes(outcome) ? '✓ ' : ''}
                          {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Direction Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Direction</label>
                  <Select
                    value={selectedDirection}
                    onValueChange={setSelectedDirection}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All directions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Directions</SelectItem>
                      {filterOptions.directions.map((dir) => (
                        <SelectItem key={dir} value={dir}>
                          {dir.charAt(0).toUpperCase() + dir.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Time of Day Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time of Day</label>
                  <Select
                    value={selectedTimeOfDay}
                    onValueChange={setSelectedTimeOfDay}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All times" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Times</SelectItem>
                      {filterOptions.time_of_day.map((time) => (
                        <SelectItem key={time.value} value={time.value}>
                          {time.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 pt-2 border-t">
                  {selectedAgents.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      Agents: {selectedAgents.length}
                      <button
                        onClick={() => setSelectedAgents([])}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedOutcomes.length > 0 && (
                    <Badge variant="secondary" className="gap-1">
                      Outcomes: {selectedOutcomes.length}
                      <button
                        onClick={() => setSelectedOutcomes([])}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedDirection && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedDirection.charAt(0).toUpperCase() + selectedDirection.slice(1)}
                      <button
                        onClick={() => setSelectedDirection('')}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedTimeOfDay && (
                    <Badge variant="secondary" className="gap-1">
                      {filterOptions.time_of_day.find(t => t.value === selectedTimeOfDay)?.label}
                      <button
                        onClick={() => setSelectedTimeOfDay('')}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Calls
            </CardTitle>
            <Phone className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_calls}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Last {selectedDays} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
            <CheckCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.success_rate}%</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              {data.success_rate >= 70 ? (
                <>
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  <span className="text-green-500">Good</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                  <span className="text-red-500">Needs improvement</span>
                </>
              )}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Duration
            </CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(data.avg_duration)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(data.avg_duration)} seconds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Cost
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.total_cost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${(data.total_cost / data.total_calls || 0).toFixed(3)} per call
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calls Over Time</CardTitle>
              <CardDescription>
                Daily call volume for the last {selectedDays} days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.calls_by_day}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => {
                      const d = new Date(date)
                      return `${d.getMonth() + 1}/${d.getDate()}`
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    labelFormatter={(date) => {
                      const d = new Date(date)
                      return d.toLocaleDateString()
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Calls"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Call Outcomes</CardTitle>
              <CardDescription>
                Distribution of call results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={outcomeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {outcomeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || COLORS.unknown}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="flex-1 space-y-2">
                  {outcomeData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: COLORS[entry.name.toLowerCase() as keyof typeof COLORS] || COLORS.unknown
                          }}
                        />
                        <span className="text-sm">{entry.name}</span>
                      </div>
                      <span className="text-sm font-medium">{entry.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>
                Calls and success rates by agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.agent_performance.length === 0 ? (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <p>No agent data available</p>
                </div>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.agent_performance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="agent_name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="calls" fill="#8b5cf6" name="Total Calls" />
                      <Bar dataKey="success_rate" fill="#10b981" name="Success Rate %" />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 space-y-2">
                    {data.agent_performance.map((agent) => (
                      <div
                        key={agent.agent_id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{agent.agent_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {agent.calls} calls • {agent.success_rate}% success
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {agent.success_rate >= 70 ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

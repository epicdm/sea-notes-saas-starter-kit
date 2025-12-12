'use client'

import { useState, useEffect, useMemo, useCallback, memo } from 'react'
import { useSession } from 'next-auth/react'
import { 
  Plus, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  Phone, 
  Globe, 
  MessageSquare, 
  Mail, 
  Smartphone, 
  MoreVertical, 
  Play, 
  Pause, 
  Settings, 
  BarChart3, 
  Edit, 
  Trash2,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { CreateFunnelWizard } from '@/components/CreateFunnelWizard'
import { ConfirmDialog } from '@/components/ConfirmDialog'
import { EditFunnelWizard } from '@/components/EditFunnelWizard'
import { FunnelAnalyticsPanel } from '@/components/funnels/FunnelAnalyticsPanel'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

// Types
interface FunnelStats {
  totalCalls: number
  completed: number
  hotLeads: number
  booked: number
  conversionRate: number
  avgDuration: string
}

interface Funnel {
  id: string
  name: string
  description: string
  status: 'active' | 'paused' | 'draft'
  type: string
  entryPoints: string[]
  phoneNumber: string
  stats: FunnelStats
  createdAt: string
}

interface Agent {
  id: string
  name: string
  model: string
}

interface FunnelsPageProps {
  accessToken: string
  onNavigate?: (page: string) => void
  onViewFunnel?: (funnelId: string) => void
}

// Memoized Entry Point Icon Component
const EntryPointIcon = memo(({ entryPoint }: { entryPoint: string }) => {
  const iconMap: Record<string, typeof Phone> = {
    phone: Phone,
    web_form: Globe,
    chat: MessageSquare,
    email: Mail,
    sms: Smartphone,
  }
  
  const Icon = iconMap[entryPoint] || Phone
  
  return (
    <div 
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium transition-colors hover:bg-blue-100 dark:hover:bg-blue-950/50"
      role="status"
      aria-label={`Entry point: ${entryPoint.replace('_', ' ')}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="capitalize">{entryPoint.replace('_', ' ')}</span>
    </div>
  )
})

EntryPointIcon.displayName = 'EntryPointIcon'

// Memoized Stat Card Component with Sparkline and Animation
const StatCard = memo(({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend,
  sparklineData,
  sparklineColor,
  index
}: { 
  icon: typeof TrendingUp
  title: string
  value: string | number
  subtitle: string
  trend?: 'up' | 'down' | 'neutral'
  sparklineData?: { name: string; value: number }[]
  sparklineColor?: string
  index?: number
}) => {
  const trendColors = {
    up: 'text-emerald-600 dark:text-emerald-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-slate-600 dark:text-slate-400'
  }

  return (
    <Card 
      className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800/80 hover:shadow-xl transition-all duration-300 hover:scale-[1.03] hover:border-blue-400 dark:hover:border-blue-600 animate-slide-up-fade-in"
      style={{ animationDelay: `${(index || 0) * 100}ms`, animationFillMode: 'backwards' }}
    >
      {sparklineData && (
        <div className="absolute bottom-0 left-0 w-full h-2/3 opacity-20 group-hover:opacity-30 transition-opacity duration-300">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`color-${title.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={sparklineColor || '#3b82f6'} stopOpacity={0.4}/>
                  <stop offset="95%" stopColor={sparklineColor || '#3b82f6'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={sparklineColor || '#3b82f6'} 
                strokeWidth={2} 
                fillOpacity={1} 
                fill={`url(#color-${title.replace(/\s/g, '')})`} 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <CardHeader className="pb-2 relative z-10">
        <div className="flex items-center justify-between">
          <CardDescription className="font-semibold text-slate-700 dark:text-slate-300">{title}</CardDescription>
          <Icon className={`h-5 w-5 ${trend ? trendColors[trend] : 'text-slate-400'}`} aria-hidden="true" />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-1">{value}</div>
        <p className={`text-sm font-medium ${trend ? trendColors[trend] : 'text-slate-600 dark:text-slate-400'}`}>
          {subtitle}
        </p>
      </CardContent>
    </Card>
  )
})

StatCard.displayName = 'StatCard'

// Memoized Funnel Card Component with Glassmorphism
const FunnelCard = memo(({ 
  funnel, 
  onTest, 
  onAnalytics, 
  onEdit, 
  onPause, 
  onDelete,
  onViewAnalytics,
  index
}: { 
  funnel: Funnel
  onTest: (id: string) => void
  onAnalytics: (funnel: Funnel) => void
  onEdit: (id: string) => void
  onPause: (id: string) => void
  onDelete: (id: string) => void
  onViewAnalytics?: (id: string) => void
  index?: number
}) => {
  return (
    <Card 
      className="group bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl hover:shadow-xl transition-all duration-300 hover:scale-[1.01] border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 animate-slide-up-fade-in"
      style={{ animationDelay: `${(index || 0) * 100 + 400}ms`, animationFillMode: 'backwards' }}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <CardTitle className="text-xl font-bold tracking-tight truncate">
                {funnel.name}
              </CardTitle>
              <Badge 
                variant={funnel.status === 'active' ? 'default' : 'secondary'}
                className="shrink-0"
              >
                <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${funnel.status === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} aria-hidden="true" />
                {funnel.status === 'active' ? 'Live' : 'Paused'}
              </Badge>
            </div>
            <CardDescription className="text-sm leading-relaxed line-clamp-2">
              {funnel.description}
            </CardDescription>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="shrink-0 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Funnel options"
              >
                <MoreVertical className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onViewAnalytics?.(funnel.id)}>
                <BarChart3 className="h-4 w-4 mr-2" aria-hidden="true" />
                View Analytics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(funnel.id)}>
                <Edit className="h-4 w-4 mr-2" aria-hidden="true" />
                Edit Funnel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(funnel.id)}>
                <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onPause(funnel.id)}>
                <Pause className="h-4 w-4 mr-2" aria-hidden="true" />
                Pause Funnel
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete(funnel.id)}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Entry Points */}
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">
            Entry Points
          </p>
          <div className="flex flex-wrap gap-2">
            {funnel.entryPoints.map((point) => (
              <EntryPointIcon key={point} entryPoint={point} />
            ))}
          </div>
        </div>

        {/* Stats Grid - Matching Original Layout */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Calls</p>
              <p className="text-2xl font-bold tracking-tight">{funnel.stats?.totalCalls || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Qualified</p>
              <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                {funnel.stats?.hotLeads || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Booked</p>
              <p className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">
                {funnel.stats?.booked || 0}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Conversion</p>
              <p className="text-2xl font-bold tracking-tight">{funnel.stats?.conversionRate || 0}%</p>
            </div>
          </div>
        </div>

        {/* Conversion Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Call → Appointment
            </span>
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {funnel.stats?.conversionRate || 0}%
            </span>
          </div>
          <Progress 
            value={funnel.stats?.conversionRate || 0} 
            className="h-2 bg-slate-100 dark:bg-slate-800"
            aria-label={`Conversion rate: ${funnel.stats?.conversionRate || 0}%`}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => onTest(funnel.id)}
          >
            <Play className="h-4 w-4 mr-2" aria-hidden="true" />
            Test
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => onAnalytics(funnel)}
          >
            <BarChart3 className="h-4 w-4 mr-2" aria-hidden="true" />
            Analytics
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            onClick={() => onEdit(funnel.id)}
          >
            <Settings className="h-4 w-4 mr-2" aria-hidden="true" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

FunnelCard.displayName = 'FunnelCard'

// Main Component
export default function FunnelsPage({ accessToken, onNavigate, onViewFunnel }: FunnelsPageProps) {
  // State
  const [funnels, setFunnels] = useState<Funnel[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [agents, setAgents] = useState<Agent[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [funnelToDelete, setFunnelToDelete] = useState<string | null>(null)
  const [editWizardOpen, setEditWizardOpen] = useState(false)
  const [editingFunnel, setEditingFunnel] = useState<Funnel | null>(null)
  const [selectedFunnelForAnalytics, setSelectedFunnelForAnalytics] = useState<Funnel | null>(null)

  // Load funnels on mount
  useEffect(() => {
    loadFunnels()
  }, [])

  const loadFunnels = useCallback(async () => {
    setLoading(true)
    try {
      // Mock agents data
      const mockAgents: Agent[] = [
        { id: 'agent_1', name: 'Customer Support Agent', model: 'GPT-4' },
        { id: 'agent_2', name: 'Sales Outreach Bot', model: 'GPT-4-Turbo' },
        { id: 'agent_3', name: 'Appointment Scheduler', model: 'GPT-4' },
      ]
      setAgents(mockAgents)

      // Mock funnels data
      const mockFunnels: Funnel[] = [
        {
          id: 'funnel_1',
          name: 'Home Buyer Qualification',
          description: 'Qualify potential home buyers and book property viewings',
          status: 'active',
          type: 'lead_generation',
          entryPoints: ['phone', 'web_form'],
          phoneNumber: '+1 (767) 818-9426',
          stats: {
            totalCalls: 156,
            completed: 134,
            hotLeads: 89,
            booked: 67,
            conversionRate: 50,
            avgDuration: "2:34",
          },
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'funnel_2',
          name: 'SaaS Product Demo Booking',
          description: 'Qualify leads and schedule product demonstrations',
          status: 'active',
          type: 'appointments',
          entryPoints: ['phone', 'web_form', 'chat'],
          phoneNumber: '+1 (767) 818-9267',
          stats: {
            totalCalls: 89,
            completed: 76,
            hotLeads: 42,
            booked: 31,
            conversionRate: 41,
            avgDuration: "1:58",
          },
          createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'funnel_3',
          name: 'Customer Support Triage',
          description: 'Route support requests to appropriate teams',
          status: 'active',
          type: 'lead_generation',
          entryPoints: ['phone', 'chat'],
          phoneNumber: '+1 (767) 555-0123',
          stats: {
            totalCalls: 234,
            completed: 215,
            hotLeads: 23,
            booked: 0,
            conversionRate: 0,
            avgDuration: "1:12",
          },
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]
      setFunnels(mockFunnels)
    } catch (error) {
      console.error('Error loading funnels:', error)
      toast.error('Failed to load funnels', {
        description: 'Please try refreshing the page'
      })
    } finally {
      setLoading(false)
    }
  }, [])

  // Event handlers
  const handleCreateFunnel = useCallback(() => {
    setIsWizardOpen(true)
  }, [])

  const handleFunnelCreated = useCallback((funnel: Funnel) => {
    setFunnels(prev => [funnel, ...prev])
    toast.success('Funnel created and activated!', {
      description: `${funnel.name} is now live`
    })
  }, [])

  const handlePauseFunnel = useCallback((funnelId: string) => {
    const funnel = funnels.find(f => f.id === funnelId)
    toast.success('Funnel paused', {
      description: `${funnel?.name} has been paused`
    })
  }, [funnels])

  const handleDeleteFunnel = useCallback((funnelId: string) => {
    setFunnelToDelete(funnelId)
    setDeleteDialogOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (funnelToDelete) {
      const funnel = funnels.find(f => f.id === funnelToDelete)
      setFunnels(prev => prev.filter(f => f.id !== funnelToDelete))
      toast.success('Funnel deleted successfully', {
        description: `${funnel?.name} has been removed`
      })
      setFunnelToDelete(null)
    }
    setDeleteDialogOpen(false)
  }, [funnelToDelete, funnels])

  const handleTestFunnel = useCallback((funnelId: string) => {
    const funnel = funnels.find(f => f.id === funnelId)
    toast.info(`Testing funnel: ${funnel?.name}`, {
      description: 'Opening test interface...'
    })
    onNavigate?.('testing')
  }, [funnels, onNavigate])

  const handleEditFunnel = useCallback((funnelId: string) => {
    const funnel = funnels.find(f => f.id === funnelId)
    if (funnel) {
      setEditingFunnel(funnel)
      setEditWizardOpen(true)
    }
  }, [funnels])

  const handleSaveFunnel = useCallback((updatedFunnel: Funnel) => {
    setFunnels(prev => prev.map(f => f.id === updatedFunnel.id ? updatedFunnel : f))
    toast.success('Funnel updated successfully!', {
      description: `${updatedFunnel.name} has been updated`
    })
  }, [])

  // Memoized filtered funnels
  const filteredFunnels = useMemo(() => {
    return funnels.filter(funnel => {
      const matchesSearch = funnel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        funnel.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || funnel.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [funnels, searchQuery, statusFilter])

  // Memoized stats
  const stats = useMemo(() => ({
    totalFunnels: funnels.length,
    activeFunnels: funnels.filter(f => f.status === 'active').length,
    totalCalls: funnels.reduce((sum, f) => sum + (f.stats?.totalCalls || 0), 0),
    qualifiedLeads: funnels.reduce((sum, f) => sum + (f.stats?.hotLeads || 0), 0),
    avgConversion: funnels.length > 0 
      ? Math.round(funnels.reduce((sum, f) => sum + (f.stats?.conversionRate || 0), 0) / funnels.length) 
      : 0
  }), [funnels])

  // Generate sparkline data for each stat card
  const sparklineData = useMemo(() => {
    const generateData = (base: number) => 
      Array.from({ length: 20 }, (_, i) => ({
        name: `${i}`,
        value: base + Math.random() * base * 0.3 - base * 0.15
      }))
    
    return {
      totalFunnels: generateData(stats.totalFunnels),
      totalCalls: generateData(stats.totalCalls),
      qualifiedLeads: generateData(stats.qualifiedLeads),
      avgConversion: generateData(stats.avgConversion)
    }
  }, [stats])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto" aria-hidden="true" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
              Loading funnels...
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Please wait while we fetch your data
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  Sales Funnels
                </h1>
                <Badge className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0 px-3 py-1 text-xs font-bold shadow-lg">
                  NEW
                </Badge>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
                Automate lead qualification and conversion with AI-powered funnels
              </p>
            </div>
            <Button 
              onClick={handleCreateFunnel} 
              size="lg"
              className="shrink-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
              Create Funnel
            </Button>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" 
              aria-hidden="true"
            />
            <Input
              placeholder="Search funnels by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
              aria-label="Search funnels"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <Filter className="h-4 w-4 mr-2 shrink-0" aria-hidden="true" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <section aria-labelledby="stats-heading">
          <h2 id="stats-heading" className="sr-only">Statistics Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={TrendingUp}
              title="Total Funnels"
              value={stats.totalFunnels}
              subtitle={`${stats.activeFunnels} active`}
              trend="neutral"
              sparklineData={sparklineData.totalFunnels}
              sparklineColor="#3b82f6"
              index={0}
            />
            <StatCard
              icon={Phone}
              title="Total Calls Today"
              value={stats.totalCalls}
              subtitle="+12% from yesterday"
              trend="up"
              sparklineData={sparklineData.totalCalls}
              sparklineColor="#10b981"
              index={1}
            />
            <StatCard
              icon={Users}
              title="Qualified Leads"
              value={stats.qualifiedLeads}
              subtitle="+8% this week"
              trend="up"
              sparklineData={sparklineData.qualifiedLeads}
              sparklineColor="#a855f7"
              index={2}
            />
            <StatCard
              icon={TrendingUp}
              title="Avg Conversion"
              value={`${stats.avgConversion}%`}
              subtitle="Above industry avg"
              trend="neutral"
              sparklineData={sparklineData.avgConversion}
              sparklineColor="#f59e0b"
              index={3}
            />
          </div>
        </section>

        {/* Funnels Grid */}
        <section aria-labelledby="funnels-heading">
          <h2 id="funnels-heading" className="sr-only">Your Funnels</h2>
          {filteredFunnels.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-300 dark:border-slate-700">
              <CardContent className="flex flex-col items-center justify-center py-16 sm:py-24 px-4">
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
                  <TrendingUp className="h-12 w-12 text-slate-400 dark:text-slate-600" aria-hidden="true" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-slate-900 dark:text-slate-100">
                  No funnels found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'Try adjusting your filters to see more results'
                    : 'Create your first sales funnel to start qualifying leads automatically'
                  }
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button onClick={handleCreateFunnel} size="lg">
                    <Plus className="h-5 w-5 mr-2" aria-hidden="true" />
                    Create Your First Funnel
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredFunnels.map((funnel, index) => (
                <FunnelCard
                  key={funnel.id}
                  funnel={funnel}
                  onTest={handleTestFunnel}
                  onAnalytics={setSelectedFunnelForAnalytics}
                  onEdit={handleEditFunnel}
                  onPause={handlePauseFunnel}
                  onDelete={handleDeleteFunnel}
                  onViewAnalytics={onViewFunnel}
                  index={index}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modals and Dialogs */}
      <CreateFunnelWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        onFunnelCreated={handleFunnelCreated}
        agents={agents}
        accessToken={accessToken}
      />

      {selectedFunnelForAnalytics && (
        <FunnelAnalyticsPanel
          funnel={selectedFunnelForAnalytics}
          onClose={() => setSelectedFunnelForAnalytics(null)}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Funnel"
        description="Are you sure you want to delete this funnel? This action cannot be undone and all associated data will be permanently removed."
        confirmText="Delete Funnel"
        variant="destructive"
        icon="delete"
      />

      {editingFunnel && (
        <EditFunnelWizard
          open={editWizardOpen}
          onClose={() => {
            setEditWizardOpen(false)
            setEditingFunnel(null)
          }}
          onSave={handleSaveFunnel}
          funnel={editingFunnel}
        />
      )}
    </div>
  )
}

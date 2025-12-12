'use client'

import { useState, useMemo, useCallback, memo } from 'react'
import { Plus, Building2, Users, Sparkles, Copy, Pencil, Trash2, ExternalLink, UserPlus, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useBrands } from '@/lib/hooks/use-brands'
import { CreateBrandWizard } from '@/components/brands/CreateBrandWizard'
import { EditBrandWizard } from '@/components/brands/EditBrandWizard'
import { CloneBrandDialog } from '@/components/brands/CloneBrandDialog'
import { toast } from 'sonner'
import type { BrandProfile } from '@/types/brand-profile'
import { ResponsiveContainer, AreaChart, Area } from 'recharts'

// Stat Card Component (memoized like Funnels page)
interface StatCardProps {
  icon: React.ElementType
  title: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  sparklineData?: { value: number }[]
  sparklineColor?: string
  index: number
}

const StatCard = memo(({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  sparklineData,
  sparklineColor = '#3b82f6',
  index
}: StatCardProps) => {
  const trendColors = {
    up: 'text-green-600 dark:text-green-400',
    down: 'text-red-600 dark:text-red-400',
    neutral: 'text-slate-600 dark:text-slate-400'
  }

  return (
    <Card
      className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl animate-slide-up-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Sparkline background */}
      {sparklineData && (
        <div className="absolute bottom-0 left-0 w-full h-2/3 opacity-20 group-hover:opacity-30 transition-opacity">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparklineData}>
              <defs>
                <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparklineColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={sparklineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={sparklineColor}
                strokeWidth={2}
                fill={`url(#gradient-${index})`}
                isAnimationActive={true}
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="relative p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
              {trend && (
                <span className={`text-sm font-medium ${trendColors[trend]}`}>
                  {subtitle}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
})

StatCard.displayName = 'StatCard'

// Brand Card Component
interface BrandCardProps {
  brand: BrandProfile
  index: number
  onEdit: (brand: BrandProfile) => void
  onDelete: (brand: BrandProfile) => void
  onClone: (brand: BrandProfile) => void
  onCreatePersona: (brand: BrandProfile) => void
  onViewDetail: (brand: BrandProfile) => void
}

const BrandCard = memo(({ brand, index, onEdit, onDelete, onClone, onCreatePersona, onViewDetail }: BrandCardProps) => {
  return (
    <Card
      className="group relative overflow-hidden bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:shadow-xl hover:scale-105 animate-slide-up-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4 flex-1">
            {/* Logo */}
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shrink-0">
              {brand.logo_url ? (
                <img
                  src={brand.logo_url}
                  alt={brand.company_name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                brand.company_name.charAt(0).toUpperCase()
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                {brand.company_name}
              </h3>
              {brand.industry && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {brand.industry}
                </p>
              )}

              {/* Brand Voice Badge */}
              {(brand.brand_data?.brand_voice || brand.custom_brand_voice) && (
                <Badge
                  variant="secondary"
                  className="mt-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {brand.custom_brand_voice || brand.brand_data?.brand_voice}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{brand.persona_count || 0}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Personas</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{brand.agent_count || 0}</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Agents</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900 dark:text-white">0</p>
            <p className="text-xs text-slate-600 dark:text-slate-400">Calls</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-4 space-y-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onViewDetail(brand)}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Brand Details
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onCreatePersona(brand)}
            className="w-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create Persona
          </Button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(brand)}
            className="flex-1"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onClone(brand)}
            className="flex-1"
          >
            <Copy className="w-4 h-4 mr-2" />
            Clone
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(brand)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Social Links (if available) */}
        {brand.social_media_links && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            {brand.social_media_links.website_url && (
              <a
                href={brand.social_media_links.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </Card>
  )
})

BrandCard.displayName = 'BrandCard'

// Main Brands Page
export default function BrandsPage() {
  const router = useRouter()
  const { brands, isLoading, error, refetch, createBrand, updateBrand, deleteBrand, cloneBrand } = useBrands()
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateWizard, setShowCreateWizard] = useState(false)
  const [showEditWizard, setShowEditWizard] = useState(false)
  const [showCloneDialog, setShowCloneDialog] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<BrandProfile | null>(null)
  const [cloningBrand, setCloningBrand] = useState<BrandProfile | null>(null)

  // Filter brands by search
  const filteredBrands = useMemo(() => {
    if (!searchQuery.trim()) return brands

    const query = searchQuery.toLowerCase()
    return brands.filter(brand =>
      brand.company_name.toLowerCase().includes(query) ||
      brand.industry?.toLowerCase().includes(query)
    )
  }, [brands, searchQuery])

  // Calculate stats
  const stats = useMemo(() => {
    const totalBrands = brands.length
    const totalPersonas = 0 // TODO: Calculate from personas linked to brands
    const totalAgents = 0 // TODO: Calculate from agents linked to brands
    const recentlyAdded = brands.filter(b => {
      const createdDate = new Date(b.created_at)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return createdDate > weekAgo
    }).length

    return { totalBrands, totalPersonas, totalAgents, recentlyAdded }
  }, [brands])

  // Handlers
  const handleCreateBrand = useCallback(() => {
    setShowCreateWizard(true)
  }, [])

  const handleEditBrand = useCallback((brand: BrandProfile) => {
    setSelectedBrand(brand)
    setShowEditWizard(true)
  }, [])

  const handleDeleteBrand = useCallback(async (brand: BrandProfile) => {
    if (!confirm(`Are you sure you want to delete "${brand.company_name}"? This will also delete all associated personas and agents.`)) {
      return
    }

    try {
      await deleteBrand(brand.id)
      toast.success(`Deleted ${brand.company_name}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete brand')
    }
  }, [deleteBrand])

  const handleCloneBrand = useCallback((brand: BrandProfile) => {
    setCloningBrand(brand)
    setShowCloneDialog(true)
  }, [])

  const handleCloneSubmit = useCallback(async (brandId: string, newName: string, clonePersonas: boolean) => {
    try {
      await cloneBrand(brandId, newName, clonePersonas)
      toast.success(
        clonePersonas
          ? `Cloned ${newName} with personas`
          : `Cloned ${newName}`
      )
      await refetch()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to clone brand')
      throw err
    }
  }, [cloneBrand, refetch])

  const handleCreatePersona = useCallback((brand: BrandProfile) => {
    // Navigate to personas page with brand pre-selected via query param
    router.push(`/dashboard/personas?brandId=${brand.id}&brandName=${encodeURIComponent(brand.company_name)}`)
  }, [router])

  const handleViewDetail = useCallback((brand: BrandProfile) => {
    // Navigate to brand detail page
    router.push(`/dashboard/brands/${brand.id}`)
  }, [router])

  // Sparkline data (mock for now)
  const brandSparkline = Array.from({ length: 12 }, (_, i) => ({
    value: Math.floor(Math.random() * 10) + 5
  }))

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto animate-slide-up-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Brand Management
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage client brands in your agency workspace
          </p>
        </div>
        <Button
          onClick={handleCreateBrand}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Brand
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Building2}
          title="Total Brands"
          value={stats.totalBrands}
          subtitle="+3 this week"
          trend="up"
          sparklineData={brandSparkline}
          sparklineColor="#3b82f6"
          index={0}
        />
        <StatCard
          icon={Users}
          title="Total Personas"
          value={stats.totalPersonas}
          subtitle="0 active"
          index={1}
        />
        <StatCard
          icon={Sparkles}
          title="Total Agents"
          value={stats.totalAgents}
          subtitle="0 deployed"
          index={2}
        />
        <StatCard
          icon={Plus}
          title="Recently Added"
          value={stats.recentlyAdded}
          subtitle="Last 7 days"
          index={3}
        />
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          placeholder="Search brands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Brands Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400">{error.message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            Try Again
          </Button>
        </div>
      ) : filteredBrands.length === 0 ? (
        <Card className="p-12 text-center bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl">
          <Building2 className="w-16 h-16 mx-auto text-slate-400 mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            {searchQuery ? 'No brands found' : 'No brands yet'}
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Create your first client brand to get started'
            }
          </p>
          {!searchQuery && (
            <Button onClick={handleCreateBrand}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Brand
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBrands.map((brand, index) => (
            <BrandCard
              key={brand.id}
              brand={brand}
              index={index}
              onEdit={handleEditBrand}
              onDelete={handleDeleteBrand}
              onClone={handleCloneBrand}
              onCreatePersona={handleCreatePersona}
              onViewDetail={handleViewDetail}
            />
          ))}
        </div>
      )}

      {/* Create Brand Wizard */}
      <CreateBrandWizard
        open={showCreateWizard}
        onOpenChange={setShowCreateWizard}
        onCreate={createBrand}
        onSuccess={async (brand) => {
          await refetch()
          toast.success(`Created ${brand.company_name}!`)
        }}
      />

      {/* Edit Brand Wizard */}
      <EditBrandWizard
        open={showEditWizard}
        onOpenChange={setShowEditWizard}
        brand={selectedBrand}
        onUpdate={updateBrand}
        onSuccess={async () => {
          await refetch()
        }}
      />

      {/* Clone Brand Dialog */}
      <CloneBrandDialog
        isOpen={showCloneDialog}
        onClose={() => {
          setShowCloneDialog(false)
          setCloningBrand(null)
        }}
        brand={cloningBrand}
        onClone={handleCloneSubmit}
      />
    </div>
  )
}

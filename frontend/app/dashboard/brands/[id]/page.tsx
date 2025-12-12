'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Building2,
  Edit,
  Copy,
  Trash2,
  UserPlus,
  Users,
  Bot,
  Globe,
  MessageSquare,
  Briefcase,
  AlertCircle,
  ExternalLink,
  BarChart3
} from 'lucide-react'
import { useBrands } from '@/lib/hooks/use-brands'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import type { BrandProfile } from '@/types/brand-profile'
import { BrandAnalytics } from '@/components/brands/brand-analytics'

interface Persona {
  id: string
  name: string
  type: string
  description: string
  tone: string
  capabilities: string[]
  createdAt: string
}

interface Agent {
  id: string
  name: string
  status: string
  persona: {
    id: string
    name: string
  }
  createdAt: string
}

export default function BrandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { brands, isLoading, deleteBrand, cloneBrand } = useBrands()

  const [brand, setBrand] = useState<BrandProfile | null>(null)
  const [personas, setPersonas] = useState<Persona[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [deleting, setDeleting] = useState(false)

  const brandId = params.id as string

  // Load brand details
  useEffect(() => {
    if (!isLoading && brands.length > 0) {
      const foundBrand = brands.find(b => b.id === brandId)
      if (foundBrand) {
        setBrand(foundBrand)
        fetchPersonasAndAgents()
      } else {
        toast.error('Brand not found')
        router.push('/dashboard/brands')
      }
    }
  }, [brands, brandId, isLoading, router])

  // Fetch personas and agents for this brand
  const fetchPersonasAndAgents = useCallback(async () => {
    try {
      setLoadingDetails(true)

      // Fetch personas
      const personasResponse = await api.get<Persona[]>('/api/user/personas')
      const brandPersonas = personasResponse.filter(p => (p as any).brandProfileId === brandId)
      setPersonas(brandPersonas)

      // Fetch agents
      const agentsResponse = await api.get<Agent[]>('/api/user/agents')
      const brandAgents = agentsResponse.filter(a =>
        brandPersonas.some(p => p.id === a.persona?.id)
      )
      setAgents(brandAgents)
    } catch (err) {
      console.error('Error fetching details:', err)
      toast.error('Failed to load brand details')
    } finally {
      setLoadingDetails(false)
    }
  }, [brandId])

  // Navigation handlers
  const handleBack = () => router.push('/dashboard/brands')
  const handleEdit = () => {
    toast.info('Edit brand feature coming soon')
    // TODO: Implement edit dialog
  }

  const handleClone = async () => {
    if (!brand) return

    const newName = `${brand.company_name} (Copy)`
    const hasPersonas = personas.length > 0

    if (hasPersonas) {
      const cloneWithPersonas = confirm(
        `Clone "${brand.company_name}" with ${personas.length} persona${personas.length > 1 ? 's' : ''}?`
      )
      try {
        await cloneBrand(brand.id, newName, cloneWithPersonas)
        toast.success(`Cloned as "${newName}"${cloneWithPersonas ? ' with personas' : ''}`)
        router.push('/dashboard/brands')
      } catch (err) {
        toast.error('Failed to clone brand')
      }
    } else {
      try {
        await cloneBrand(brand.id, newName, false)
        toast.success(`Cloned as "${newName}"`)
        router.push('/dashboard/brands')
      } catch (err) {
        toast.error('Failed to clone brand')
      }
    }
  }

  const handleDelete = async () => {
    if (!brand) return

    const hasContent = personas.length > 0 || agents.length > 0
    const confirmMessage = hasContent
      ? `Delete "${brand.company_name}" and all ${personas.length} persona(s) and ${agents.length} agent(s)?`
      : `Delete "${brand.company_name}"?`

    if (!confirm(confirmMessage)) return

    try {
      setDeleting(true)
      await deleteBrand(brand.id)
      toast.success('Brand deleted')
      router.push('/dashboard/brands')
    } catch (err) {
      toast.error('Failed to delete brand')
      setDeleting(false)
    }
  }

  const handleCreatePersona = () => {
    if (!brand) return
    router.push(`/dashboard/personas?brandId=${brand.id}&brandName=${encodeURIComponent(brand.company_name)}`)
  }

  const handleViewPersona = (personaId: string) => {
    router.push(`/dashboard/personas?highlight=${personaId}`)
  }

  const handleViewAgent = (agentId: string) => {
    router.push(`/dashboard/agents?highlight=${agentId}`)
  }

  if (isLoading || loadingDetails) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500">Loading brand details...</div>
        </div>
      </div>
    )
  }

  if (!brand) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="h-12 w-12 text-slate-400" />
              <p className="text-slate-600">Brand not found</p>
              <Button onClick={handleBack}>Back to Brands</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {brand.company_name}
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Brand Profile Details
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" onClick={handleClone}>
            <Copy className="h-4 w-4 mr-2" />
            Clone
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Personas</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{personas.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Agents</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{agents.length}</p>
              </div>
              <Bot className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Industry</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">
                  {brand.industry || 'Not specified'}
                </p>
              </div>
              <Briefcase className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brand Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Brand Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Logo */}
          {brand.logo_url && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Logo</label>
              <div className="mt-2">
                <img
                  src={brand.logo_url}
                  alt={brand.company_name}
                  className="h-16 w-auto rounded border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
          )}

          {/* Brand Voice */}
          {brand.custom_brand_voice && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Brand Voice
              </label>
              <p className="mt-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
                {brand.custom_brand_voice}
              </p>
            </div>
          )}

          {/* Tone Guidelines */}
          {brand.custom_tone_guidelines && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Tone Guidelines
              </label>
              <Badge variant="outline" className="mt-2">
                {brand.custom_tone_guidelines}
              </Badge>
            </div>
          )}

          {/* Social Media */}
          {(brand.linkedin_url || brand.facebook_url || brand.instagram_url || brand.twitter_url) && (
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Social Media
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {brand.linkedin_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={brand.linkedin_url} target="_blank" rel="noopener noreferrer">
                      LinkedIn <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
                {brand.facebook_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={brand.facebook_url} target="_blank" rel="noopener noreferrer">
                      Facebook <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
                {brand.instagram_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={brand.instagram_url} target="_blank" rel="noopener noreferrer">
                      Instagram <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
                {brand.twitter_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={brand.twitter_url} target="_blank" rel="noopener noreferrer">
                      Twitter/X <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Personas ({personas.length})
            </CardTitle>
            <Button onClick={handleCreatePersona}>
              <UserPlus className="h-4 w-4 mr-2" />
              Create Persona
            </Button>
          </div>
          <CardDescription>
            AI personas configured for {brand.company_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {personas.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No personas yet</p>
              <p className="text-sm mt-1">Create your first persona for this brand</p>
            </div>
          ) : (
            <div className="space-y-3">
              {personas.map(persona => (
                <div
                  key={persona.id}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => handleViewPersona(persona.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {persona.name}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {persona.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{persona.type}</Badge>
                        {persona.tone && (
                          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20">
                            {persona.tone}
                          </Badge>
                        )}
                        {persona.capabilities && persona.capabilities.length > 0 && (
                          <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20">
                            {persona.capabilities.length} capabilities
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agents ({agents.length})
          </CardTitle>
          <CardDescription>
            Deployed AI agents using {brand.company_name} personas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No agents deployed yet</p>
              <p className="text-sm mt-1">Create agents from your personas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {agents.map(agent => (
                <div
                  key={agent.id}
                  className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => handleViewAgent(agent.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 dark:text-white">
                        {agent.name}
                      </h3>
                      {agent.persona && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          Using persona: {agent.persona.name}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="outline"
                          className={
                            agent.status === 'active'
                              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
                              : agent.status === 'draft'
                              ? 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                          }
                        >
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics
          </CardTitle>
          <CardDescription>
            Call performance metrics and insights for {brand.company_name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BrandAnalytics brandId={brandId} days={30} />
        </CardContent>
      </Card>
    </div>
  )
}

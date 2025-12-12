'use client'

import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Building2, Sparkles, Save } from 'lucide-react'
import { toast } from 'sonner'
import type { BrandProfile, BrandProfileUpdate } from '@/types/brand-profile'

interface EditBrandWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brand: BrandProfile | null
  onUpdate?: (id: string, data: BrandProfileUpdate) => Promise<any>
  onSuccess: () => void
}

export function EditBrandWizard({ open, onOpenChange, brand, onUpdate, onSuccess }: EditBrandWizardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [formData, setFormData] = useState<BrandProfileUpdate>({
    company_name: '',
    industry: '',
    custom_brand_voice: '',
    custom_tone_guidelines: '',
    social_media_links: {
      website_url: '',
      facebook_url: '',
      instagram_url: '',
      linkedin_url: '',
      twitter_url: ''
    }
  })

  // Load brand data when modal opens
  useEffect(() => {
    if (brand && open) {
      setFormData({
        company_name: brand.company_name,
        industry: brand.industry || '',
        custom_brand_voice: brand.custom_brand_voice || '',
        custom_tone_guidelines: brand.custom_tone_guidelines || '',
        social_media_links: {
          website_url: brand.social_media_links?.website_url || '',
          facebook_url: brand.social_media_links?.facebook_url || '',
          instagram_url: brand.social_media_links?.instagram_url || '',
          linkedin_url: brand.social_media_links?.linkedin_url || '',
          twitter_url: brand.social_media_links?.twitter_url || ''
        }
      })
    }
  }, [brand, open])

  // Submit
  const handleSubmit = useCallback(async () => {
    if (!brand) return

    try {
      setIsSubmitting(true)

      if (onUpdate) {
        await onUpdate(brand.id, formData)
      }

      onSuccess()
      onOpenChange(false)
      toast.success(`Updated ${formData.company_name}!`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update brand')
    } finally {
      setIsSubmitting(false)
    }
  }, [brand, formData, onUpdate, onSuccess, onOpenChange])

  if (!brand) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="w-6 h-6" />
            Edit Brand
          </DialogTitle>
          <DialogDescription>
            Update {brand.company_name} settings
          </DialogDescription>
        </DialogHeader>

        {/* Form */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Basic Information</h3>

            <div>
              <Label htmlFor="company_name">Company Name *</Label>
              <Input
                id="company_name"
                placeholder="ABC Dental"
                value={formData.company_name}
                onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="Dental Services"
                value={formData.industry}
                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                className="mt-2"
              />
            </div>
          </div>

          {/* Brand Voice */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Brand Voice</h3>

            <div>
              <Label htmlFor="brand_voice">Brand Voice</Label>
              <Input
                id="brand_voice"
                placeholder="Professional and friendly"
                value={formData.custom_brand_voice}
                onChange={(e) => setFormData(prev => ({ ...prev, custom_brand_voice: e.target.value }))}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="tone_guidelines">Tone Guidelines</Label>
              <Textarea
                id="tone_guidelines"
                placeholder="Warm, empathetic, solution-focused..."
                value={formData.custom_tone_guidelines}
                onChange={(e) => setFormData(prev => ({ ...prev, custom_tone_guidelines: e.target.value }))}
                rows={4}
                className="mt-2"
              />
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white">Social Media Links</h3>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://www.example.com"
                value={formData.social_media_links?.website_url}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  social_media_links: { ...prev.social_media_links!, website_url: e.target.value }
                }))}
                className="mt-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  type="url"
                  placeholder="https://facebook.com/..."
                  value={formData.social_media_links?.facebook_url}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_media_links: { ...prev.social_media_links!, facebook_url: e.target.value }
                  }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  type="url"
                  placeholder="https://linkedin.com/..."
                  value={formData.social_media_links?.linkedin_url}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_media_links: { ...prev.social_media_links!, linkedin_url: e.target.value }
                  }))}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.company_name.trim()}
          >
            {isSubmitting ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

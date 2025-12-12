'use client'

import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Building2, Sparkles, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { toast } from 'sonner'
import type { BrandProfileCreate } from '@/types/brand-profile'

interface CreateBrandWizardProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (brand: any) => void
  onCreate?: (data: BrandProfileCreate) => Promise<any>
}

type Step = 'basic' | 'voice' | 'social' | 'review'

const steps: { id: Step; title: string; description: string }[] = [
  { id: 'basic', title: 'Basic Info', description: 'Company name and industry' },
  { id: 'voice', title: 'Brand Voice', description: 'How should your brand sound?' },
  { id: 'social', title: 'Social Media', description: 'Extract brand data automatically' },
  { id: 'review', title: 'Review', description: 'Review and create' }
]

export function CreateBrandWizard({ open, onOpenChange, onSuccess, onCreate }: CreateBrandWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('basic')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form data
  const [formData, setFormData] = useState<BrandProfileCreate>({
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

  const currentStepIndex = steps.findIndex(s => s.id === currentStep)

  // Navigation
  const handleNext = useCallback(() => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id)
    }
  }, [currentStepIndex])

  const handlePrevious = useCallback(() => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id)
    }
  }, [currentStepIndex])

  // Submit
  const handleSubmit = useCallback(async () => {
    try {
      setIsSubmitting(true)

      if (onCreate) {
        const brand = await onCreate(formData)
        onSuccess(brand)
      }

      onOpenChange(false)

      // Reset form
      setFormData({
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
      setCurrentStep('basic')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create brand')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, onCreate, onSuccess, onOpenChange])

  // Validation
  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 'basic':
        return formData.company_name.trim().length > 0
      case 'voice':
        return true // Optional
      case 'social':
        return true // Optional
      case 'review':
        return true
      default:
        return false
    }
  }, [currentStep, formData])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Building2 className="w-6 h-6" />
            Create New Brand
          </DialogTitle>
          <DialogDescription>
            Set up a new client brand in your agency workspace
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    index <= currentStepIndex
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="hidden sm:block">
                  <p className={`text-sm font-medium ${
                    index <= currentStepIndex
                      ? 'text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}>
                    {step.title}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 ${
                    index < currentStepIndex
                      ? 'bg-blue-600'
                      : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-6">
          {/* Step 1: Basic Info */}
          {currentStep === 'basic' && (
            <div className="space-y-4 animate-slide-up-fade-in">
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
          )}

          {/* Step 2: Brand Voice */}
          {currentStep === 'voice' && (
            <div className="space-y-4 animate-slide-up-fade-in">
              <div>
                <Label htmlFor="brand_voice">Brand Voice</Label>
                <Input
                  id="brand_voice"
                  placeholder="Professional and friendly"
                  value={formData.custom_brand_voice}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_brand_voice: e.target.value }))}
                  className="mt-2"
                />
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  How should your brand sound? (e.g., "Professional and friendly", "Casual and fun")
                </p>
              </div>

              <div>
                <Label htmlFor="tone_guidelines">Tone Guidelines</Label>
                <Textarea
                  id="tone_guidelines"
                  placeholder="Warm, empathetic, solution-focused. Always use positive language..."
                  value={formData.custom_tone_guidelines}
                  onChange={(e) => setFormData(prev => ({ ...prev, custom_tone_guidelines: e.target.value }))}
                  rows={4}
                  className="mt-2"
                />
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                  Specific guidelines for how your brand communicates
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      AI-Powered Brand Extraction
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      In the next step, you can extract brand voice automatically from social media
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Social Media */}
          {currentStep === 'social' && (
            <div className="space-y-4 animate-slide-up-fade-in">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
                  Add social media links to automatically extract brand voice, products, and values using AI
                </p>
              </div>

              <div>
                <Label htmlFor="website_url">Website</Label>
                <Input
                  id="website_url"
                  type="url"
                  placeholder="https://www.example.com"
                  value={formData.social_media_links?.website_url}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_media_links: {
                      ...prev.social_media_links,
                      website_url: e.target.value
                    }
                  }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="facebook_url">Facebook Page</Label>
                <Input
                  id="facebook_url"
                  type="url"
                  placeholder="https://facebook.com/yourpage"
                  value={formData.social_media_links?.facebook_url}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_media_links: {
                      ...prev.social_media_links,
                      facebook_url: e.target.value
                    }
                  }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="instagram_url">Instagram</Label>
                <Input
                  id="instagram_url"
                  type="url"
                  placeholder="https://instagram.com/yourprofile"
                  value={formData.social_media_links?.instagram_url}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_media_links: {
                      ...prev.social_media_links,
                      instagram_url: e.target.value
                    }
                  }))}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="linkedin_url">LinkedIn</Label>
                <Input
                  id="linkedin_url"
                  type="url"
                  placeholder="https://linkedin.com/company/yourcompany"
                  value={formData.social_media_links?.linkedin_url}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    social_media_links: {
                      ...prev.social_media_links,
                      linkedin_url: e.target.value
                    }
                  }))}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 'review' && (
            <div className="space-y-4 animate-slide-up-fade-in">
              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-lg space-y-4">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-white">
                  Review Brand Information
                </h3>

                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Company Name</p>
                  <p className="text-base font-medium text-slate-900 dark:text-white">
                    {formData.company_name}
                  </p>
                </div>

                {formData.industry && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Industry</p>
                    <p className="text-base font-medium text-slate-900 dark:text-white">
                      {formData.industry}
                    </p>
                  </div>
                )}

                {formData.custom_brand_voice && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Brand Voice</p>
                    <Badge variant="secondary" className="mt-1">
                      <Sparkles className="w-3 h-3 mr-1" />
                      {formData.custom_brand_voice}
                    </Badge>
                  </div>
                )}

                {formData.custom_tone_guidelines && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Tone Guidelines</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                      {formData.custom_tone_guidelines}
                    </p>
                  </div>
                )}

                {formData.social_media_links?.website_url && (
                  <div>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Social Links</p>
                    <div className="space-y-1">
                      {formData.social_media_links.website_url && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Website: {formData.social_media_links.website_url}
                        </p>
                      )}
                      {formData.social_media_links.facebook_url && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Facebook: {formData.social_media_links.facebook_url}
                        </p>
                      )}
                      {formData.social_media_links.instagram_url && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Instagram: {formData.social_media_links.instagram_url}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                <p className="text-sm font-medium text-green-900 dark:text-green-100">
                  ✓ Ready to create
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  This brand will be created in your agency workspace
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStepIndex === 0 || isSubmitting}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentStep === 'review' ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !canProceed()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Creating...' : 'Create Brand'}
              <Check className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

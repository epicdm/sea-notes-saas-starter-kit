'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Building2, Users } from 'lucide-react'
import type { BrandProfile } from '@/types/brand-profile'

interface CloneBrandDialogProps {
  isOpen: boolean
  onClose: () => void
  brand: BrandProfile | null
  onClone: (brandId: string, newName: string, clonePersonas: boolean) => Promise<void>
}

export function CloneBrandDialog({ isOpen, onClose, brand, onClone }: CloneBrandDialogProps) {
  const [newName, setNewName] = useState('')
  const [clonePersonas, setClonePersonas] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open && brand) {
      setNewName(`${brand.company_name} (Copy)`)
      setClonePersonas(false)
    } else {
      setNewName('')
      setClonePersonas(false)
      onClose()
    }
  }

  const handleSubmit = async () => {
    if (!brand || !newName.trim()) return

    setIsSubmitting(true)
    try {
      await onClone(brand.id, newName.trim(), clonePersonas)
      handleOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!brand) return null

  const personaCount = brand.persona_count || 0

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5 text-blue-600" />
            Clone Brand
          </DialogTitle>
          <DialogDescription>
            Create a duplicate of "{brand.company_name}" with all its settings and optionally its personas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Brand Name Input */}
          <div className="space-y-2">
            <Label htmlFor="newName">
              <Building2 className="inline h-4 w-4 mr-1" />
              New Brand Name
            </Label>
            <Input
              id="newName"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter new brand name..."
              autoFocus
            />
          </div>

          {/* Clone Options */}
          <div className="space-y-3 pt-2">
            <Label className="text-sm font-semibold">Clone Options</Label>

            {/* Clone Personas Option */}
            <div className="flex items-start space-x-3 rounded-lg border border-slate-200 dark:border-slate-700 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <Checkbox
                id="clonePersonas"
                checked={clonePersonas}
                onCheckedChange={(checked) => setClonePersonas(checked as boolean)}
                disabled={personaCount === 0}
              />
              <div className="flex-1">
                <label
                  htmlFor="clonePersonas"
                  className={`text-sm font-medium leading-none cursor-pointer ${
                    personaCount === 0 ? 'text-slate-400 dark:text-slate-600' : ''
                  }`}
                >
                  <Users className="inline h-4 w-4 mr-1" />
                  Clone Personas ({personaCount})
                </label>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {personaCount === 0
                    ? 'No personas to clone'
                    : `Include all ${personaCount} persona${personaCount > 1 ? 's' : ''} linked to this brand`}
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-xs text-slate-700 dark:text-slate-300">
              <strong className="block mb-1">What will be cloned:</strong>
              <ul className="space-y-0.5 ml-4 list-disc">
                <li>Brand profile (name, industry, logo)</li>
                <li>Brand voice and guidelines</li>
                <li>Social media links</li>
                {clonePersonas && personaCount > 0 && (
                  <li className="text-blue-600 dark:text-blue-400 font-semibold">
                    {personaCount} persona{personaCount > 1 ? 's' : ''} (with all settings)
                  </li>
                )}
              </ul>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                <strong>Note:</strong> Agents will not be cloned. You'll need to create new agents for the cloned personas.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!newName.trim() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Copy className="h-4 w-4 mr-2 animate-spin" />
                Cloning...
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Clone Brand
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Skeleton,
} from "@heroui/react";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { usePersonas } from "@/lib/hooks/use-personas";
import type { PersonaTemplate } from "@/types/persona";
import { getCapabilityInfo, getPersonaIcon, getPersonaLabel } from "@/types/persona";

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: PersonaTemplate) => void;
}

/**
 * Template Gallery Modal Component
 * Displays system persona templates for quick persona creation
 *
 * Features:
 * - Grid display of all 6 system templates
 * - Preview cards with full template details
 * - Capability badges and tool counts
 * - "Use Template" action for quick creation
 * - Loading states with skeletons
 * - Error handling with user feedback
 */
export function TemplateGalleryModal({
  isOpen,
  onClose,
  onSelectTemplate,
}: TemplateGalleryModalProps) {
  const { fetchSystemTemplates } = usePersonas();
  const [templates, setTemplates] = useState<PersonaTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchSystemTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to load templates:", err);
      setError(err instanceof Error ? err.message : "Failed to load templates");
      toast.error("Failed to load persona templates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: PersonaTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="5xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        header: "border-b border-divider",
        body: "p-6",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-xl font-semibold">
            Choose a Persona Template
          </span>
        </ModalHeader>

        <ModalBody>
          {/* Description */}
          <p className="text-sm text-muted-foreground mb-4">
            Start with a professionally crafted persona template. Each template
            comes pre-configured with instructions, personality traits, and
            communication tools tailored for specific use cases.
          </p>

          {/* Error State */}
          {error && !isLoading && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
              <AlertCircle className="h-5 w-5 text-danger-600 dark:text-danger-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-danger-700 dark:text-danger-300">
                  Error Loading Templates
                </p>
                <p className="text-xs text-danger-600 dark:text-danger-400 mt-1">
                  {error}
                </p>
              </div>
              <Button
                size="sm"
                color="danger"
                variant="flat"
                onPress={loadTemplates}
                className="ml-auto"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              // Loading Skeletons
              Array.from({ length: 6 }).map((_, index) => (
                <TemplateCardSkeleton key={index} />
              ))
            ) : templates.length === 0 ? (
              // Empty State
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <Sparkles className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-foreground">
                  No Templates Available
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  System templates could not be loaded at this time.
                </p>
              </div>
            ) : (
              // Template Cards
              templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleSelectTemplate}
                />
              ))
            )}
          </div>
        </ModalBody>

        <ModalFooter className="border-t border-divider">
          <Button variant="light" onPress={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

/**
 * Template Card Component
 * Individual template preview card
 */
interface TemplateCardProps {
  template: PersonaTemplate;
  onSelect: (template: PersonaTemplate) => void;
}

function TemplateCard({ template, onSelect }: TemplateCardProps) {
  const templateData = template.templateData;
  const personaIcon = getPersonaIcon(templateData.type);
  const personaLabel = getPersonaLabel(templateData.type);
  const enabledTools = templateData.tools?.filter((t) => t.enabled) || [];

  return (
    <Card
      className="hover:shadow-lg transition-all duration-300 hover:border-primary/50"
      data-testid={`template-card-${template.category}`}
    >
      <CardHeader className="flex flex-col items-start gap-2 pb-2">
        {/* Icon and Type */}
        <div className="flex items-center gap-2 w-full">
          <span className="text-3xl" aria-label="Persona icon">
            {personaIcon}
          </span>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-foreground">
              {template.name}
            </h3>
            <Chip size="sm" variant="flat" color="secondary" className="mt-1">
              {personaLabel}
            </Chip>
          </div>
        </div>
      </CardHeader>

      <CardBody className="space-y-3">
        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-3">
          {template.description}
        </p>

        {/* Capabilities */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Channels
          </p>
          <div className="flex flex-wrap gap-1">
            {templateData.capabilities.map((capability) => {
              const capInfo = getCapabilityInfo(capability);
              if (!capInfo) return null;

              return (
                <Chip
                  key={capability}
                  size="sm"
                  variant="flat"
                  color={capInfo.color as any}
                  startContent={
                    <span className="text-xs" aria-label={capInfo.label}>
                      {capInfo.icon}
                    </span>
                  }
                >
                  {capInfo.label}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* Personality Traits */}
        {templateData.personalityTraits &&
          templateData.personalityTraits.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">
                Traits
              </p>
              <div className="flex flex-wrap gap-1">
                {templateData.personalityTraits.slice(0, 3).map((trait, index) => (
                  <Chip key={index} size="sm" variant="dot">
                    {trait}
                  </Chip>
                ))}
                {templateData.personalityTraits.length > 3 && (
                  <Chip size="sm" variant="dot">
                    +{templateData.personalityTraits.length - 3}
                  </Chip>
                )}
              </div>
            </div>
          )}

        {/* Tools Count */}
        {enabledTools.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3" />
            <span>
              {enabledTools.length} pre-configured{" "}
              {enabledTools.length === 1 ? "tool" : "tools"}
            </span>
          </div>
        )}

        {/* Tone and Language Style */}
        {(templateData.tone || templateData.languageStyle) && (
          <div className="flex gap-2 flex-wrap">
            {templateData.tone && (
              <Chip size="sm" variant="bordered">
                {templateData.tone}
              </Chip>
            )}
            {templateData.languageStyle && (
              <Chip size="sm" variant="bordered">
                {templateData.languageStyle}
              </Chip>
            )}
          </div>
        )}

        {/* Use Template Button */}
        <Button
          color="primary"
          variant="flat"
          fullWidth
          onPress={() => onSelect(template)}
          className="mt-2"
          data-testid="use-template-button"
        >
          Use This Template
        </Button>
      </CardBody>
    </Card>
  );
}

/**
 * Template Card Skeleton - Loading state
 */
function TemplateCardSkeleton() {
  return (
    <Card data-testid="template-skeleton">
      <CardHeader className="flex flex-col items-start gap-2 pb-2">
        <div className="flex items-center gap-2 w-full">
          <div className="h-12 w-12 rounded-md bg-default-200 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded-md bg-default-200 animate-pulse" />
            <div className="h-5 w-24 rounded-full bg-default-200 animate-pulse" />
          </div>
        </div>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="space-y-2">
          <div className="h-3 w-full rounded-md bg-default-200 animate-pulse" />
          <div className="h-3 w-5/6 rounded-md bg-default-200 animate-pulse" />
          <div className="h-3 w-4/6 rounded-md bg-default-200 animate-pulse" />
        </div>
        <div>
          <div className="h-3 w-16 rounded-md bg-default-200 animate-pulse mb-2" />
          <div className="flex gap-1">
            <div className="h-6 w-16 rounded-full bg-default-200 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-default-200 animate-pulse" />
            <div className="h-6 w-16 rounded-full bg-default-200 animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-full rounded-lg bg-default-200 animate-pulse mt-2" />
      </CardBody>
    </Card>
  );
}

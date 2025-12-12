"use client";

import { Card, CardBody, CardHeader, Chip, Button } from "@heroui/react";
import { Edit, Trash2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Persona } from "@/types/persona";
import {
  getPersonaIcon,
  getPersonaLabel,
  getCapabilityInfo,
  canDeletePersona,
  canEditPersona,
  CAPABILITY_INFO,
} from "@/types/persona";

interface PersonaCardProps {
  persona: Persona;
  onEdit?: (persona: Persona) => void;
  onDelete?: (persona: Persona) => void;
  onClick?: (persona: Persona) => void;
  className?: string;
}

/**
 * Persona Card Component
 * Displays a persona with multi-channel capabilities, usage stats, and actions
 *
 * Features:
 * - Multi-channel capability badges (voice, chat, whatsapp, email, sms)
 * - System template vs user persona distinction
 * - Usage statistics (agent count)
 * - Edit and Delete actions with permission checks
 * - Click to edit functionality
 * - Responsive design with hover effects
 */
export function PersonaCard({
  persona,
  onEdit,
  onDelete,
  onClick,
  className,
}: PersonaCardProps) {
  const canEdit = canEditPersona(persona);
  const canDelete = canDeletePersona(persona);
  const personaIcon = getPersonaIcon(persona.type);
  const personaLabel = getPersonaLabel(persona.type);

  const handleCardClick = () => {
    if (onClick) {
      onClick(persona);
    } else if (onEdit && canEdit) {
      onEdit(persona);
    }
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEdit && canEdit) {
      onEdit(persona);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && canDelete) {
      onDelete(persona);
    }
  };

  return (
    <Card
      isPressable={!!(onClick || (onEdit && canEdit))}
      onPress={handleCardClick}
      className={cn(
        "w-full transition-all duration-300 hover:shadow-lg",
        onClick || (onEdit && canEdit)
          ? "cursor-pointer hover:border-primary/50"
          : "",
        className
      )}
      data-testid="persona-card"
    >
      <CardHeader className="flex flex-col items-start gap-3 pb-3">
        {/* Header Row: Type Badge + Actions */}
        <div className="flex w-full items-start justify-between gap-2">
          {/* Persona Type Badge */}
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-label="Persona icon">
              {personaIcon}
            </span>
            <div className="flex flex-col">
              <Chip
                size="sm"
                variant="flat"
                color={persona.isSystem ? "secondary" : "default"}
              >
                {personaLabel}
              </Chip>
              {persona.isSystem && (
                <span className="text-xs text-muted-foreground mt-1">
                  System Template
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1">
            {canEdit && onEdit && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="primary"
                onPress={handleEditClick}
                aria-label="Edit persona"
                data-testid="edit-persona-button"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                isIconOnly
                size="sm"
                variant="light"
                color="danger"
                onPress={handleDeleteClick}
                aria-label="Delete persona"
                data-testid="delete-persona-button"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Persona Name */}
        <div className="w-full">
          <h3
            className="text-lg font-semibold text-foreground truncate"
            data-testid="persona-name"
          >
            {persona.name}
          </h3>
          {persona.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {persona.description}
            </p>
          )}
        </div>
      </CardHeader>

      <CardBody className="pt-0 space-y-4">
        {/* Capabilities Section */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">
            Communication Channels
          </p>
          <div className="flex flex-wrap gap-2">
            {(persona.capabilities as string[]).map((capability) => {
              const capInfo = getCapabilityInfo(capability);
              if (!capInfo) return null;

              return (
                <Chip
                  key={capability}
                  size="sm"
                  variant="flat"
                  color={capInfo.color as any}
                  startContent={
                    <span className="text-sm" aria-label={capInfo.label}>
                      {capInfo.icon}
                    </span>
                  }
                  data-testid={`capability-${capability}`}
                >
                  {capInfo.label}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* Personality Traits */}
        {persona.personalityTraits && persona.personalityTraits.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Personality Traits
            </p>
            <div className="flex flex-wrap gap-1">
              {persona.personalityTraits.slice(0, 4).map((trait, index) => (
                <Chip key={index} size="sm" variant="dot">
                  {trait}
                </Chip>
              ))}
              {persona.personalityTraits.length > 4 && (
                <Chip size="sm" variant="dot">
                  +{persona.personalityTraits.length - 4} more
                </Chip>
              )}
            </div>
          </div>
        )}

        {/* Tone and Language Style */}
        {(persona.tone || persona.languageStyle) && (
          <div className="flex gap-4">
            {persona.tone && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Tone
                </p>
                <Chip size="sm" variant="bordered">
                  {persona.tone}
                </Chip>
              </div>
            )}
            {persona.languageStyle && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1">
                  Style
                </p>
                <Chip size="sm" variant="bordered">
                  {persona.languageStyle}
                </Chip>
              </div>
            )}
          </div>
        )}

        {/* Usage Statistics */}
        <div className="pt-3 border-t border-divider">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span
              className="text-sm text-foreground"
              data-testid="agent-count"
            >
              {persona.agentCount || 0}{" "}
              <span className="text-muted-foreground">
                {persona.agentCount === 1 ? "agent" : "agents"} using this
                persona
              </span>
            </span>
          </div>

          {/* Delete Warning */}
          {!canDelete && persona.agentCount && persona.agentCount > 0 && (
            <p className="text-xs text-warning mt-2">
              Cannot delete: {persona.agentCount} active{" "}
              {persona.agentCount === 1 ? "agent" : "agents"}
            </p>
          )}

          {/* System Template Notice */}
          {!canEdit && persona.isSystem && (
            <p className="text-xs text-muted-foreground mt-2">
              System templates cannot be edited
            </p>
          )}
        </div>

        {/* Tools Count (if available) */}
        {persona.tools && persona.tools.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium">
              {persona.tools.filter((t) => t.enabled).length}
            </span>
            <span>
              enabled{" "}
              {persona.tools.filter((t) => t.enabled).length === 1
                ? "tool"
                : "tools"}
            </span>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

/**
 * Persona Card Skeleton - Loading state
 */
export function PersonaCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("w-full", className)} data-testid="persona-skeleton">
      <CardHeader className="flex flex-col items-start gap-3 pb-3">
        <div className="flex w-full items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-default-200 animate-pulse" />
            <div className="h-6 w-24 rounded-md bg-default-200 animate-pulse" />
          </div>
          <div className="flex items-center gap-1">
            <div className="h-8 w-8 rounded-md bg-default-200 animate-pulse" />
            <div className="h-8 w-8 rounded-md bg-default-200 animate-pulse" />
          </div>
        </div>
        <div className="w-full space-y-2">
          <div className="h-6 w-3/4 rounded-md bg-default-200 animate-pulse" />
          <div className="h-4 w-full rounded-md bg-default-200 animate-pulse" />
        </div>
      </CardHeader>
      <CardBody className="pt-0 space-y-4">
        <div>
          <div className="h-3 w-32 rounded-md bg-default-200 animate-pulse mb-2" />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-20 rounded-full bg-default-200 animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-default-200 animate-pulse" />
            <div className="h-6 w-20 rounded-full bg-default-200 animate-pulse" />
          </div>
        </div>
        <div className="pt-3 border-t border-divider">
          <div className="h-4 w-48 rounded-md bg-default-200 animate-pulse" />
        </div>
      </CardBody>
    </Card>
  );
}

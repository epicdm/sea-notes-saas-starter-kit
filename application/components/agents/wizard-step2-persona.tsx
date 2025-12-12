"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardBody, Chip, Skeleton } from "@heroui/react";
import { AgentCreate } from "@/types/agent";
import { usePersonas } from "@/lib/hooks/use-personas";
import { personaTypeLabels, toneLabels, languageStyleLabels, type PersonaType } from "@/lib/schemas/persona-schema";
import { getCapabilityInfo } from "@/types/persona";
import { CheckCircle, ExternalLink } from "lucide-react";
import Link from "next/link";

/**
 * Wizard Step 2: Select Persona from Library
 * Choose from system templates or user's custom personas
 */
export function WizardStep2Persona() {
  const {
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<AgentCreate>();

  const { personas, isLoading, error, refetch } = usePersonas();
  const selectedPersonaId = watch("persona_id");

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-3">Select Agent Persona</h2>
          <p className="text-lg text-muted-foreground">
            Choose from your persona library
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-3">Select Agent Persona</h2>
        </div>
        <Card className="border-danger">
          <CardBody className="text-center py-8">
            <p className="text-danger mb-4">Failed to load personas</p>
            <p className="text-sm text-foreground-500 mb-4">{error.message}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </CardBody>
        </Card>
      </div>
    );
  }

  // Empty state
  if (personas.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-3">Select Agent Persona</h2>
        </div>
        <Card>
          <CardBody className="text-center py-16">
            <p className="text-lg mb-4">No personas found</p>
            <p className="text-sm text-foreground-500 mb-6">
              Create personas in your library to get started
            </p>
            <Link
              href="/dashboard/settings/personas"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Go to Persona Library
              <ExternalLink className="w-4 h-4" />
            </Link>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Select Agent Persona</h2>
        <p className="text-lg text-muted-foreground">
          Choose a personality from your library
        </p>
        <Link
          href="/dashboard/settings/personas"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline mt-2"
        >
          Manage personas
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>

      {/* Persona Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {personas.map((persona) => {
          const isSelected = selectedPersonaId === persona.id;
          return (
            <Card
              key={persona.id}
              isPressable
              isHoverable
              onPress={() => setValue("persona_id", persona.id)}
              className={`
                relative cursor-pointer transition-all duration-200
                ${
                  isSelected
                    ? "border-2 border-primary shadow-lg"
                    : "border border-border hover:border-primary/50 hover:shadow-md"
                }
              `}
            >
              <CardBody className="p-5">
                {/* Selection Indicator */}
                {isSelected && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle className="w-5 h-5 text-primary fill-primary" />
                  </div>
                )}

                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-foreground">{persona.name}</h3>
                    {persona.isSystem && (
                      <Chip size="sm" color="primary" variant="flat">
                        Template
                      </Chip>
                    )}
                  </div>
                  <Chip size="sm" variant="flat">
                    {personaTypeLabels[persona.type as PersonaType]}
                  </Chip>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {persona.description || "No description"}
                </p>

                {/* Communication Channels */}
                {persona.capabilities && persona.capabilities.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Available Channels
                    </p>
                    <div className="flex flex-wrap gap-1">
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
                              <span className="text-xs">{capInfo.icon}</span>
                            }
                          >
                            {capInfo.label}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2 text-sm">
                  {persona.tone && (
                    <div>
                      <span className="font-medium">Tone:</span> {toneLabels[persona.tone]}
                    </div>
                  )}
                  {persona.languageStyle && (
                    <div>
                      <span className="font-medium">Style:</span>{" "}
                      {languageStyleLabels[persona.languageStyle]}
                    </div>
                  )}
                  {persona.personalityTraits && persona.personalityTraits.length > 0 && (
                    <div>
                      <span className="font-medium">Traits:</span>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {persona.personalityTraits.slice(0, 3).map((trait, i) => (
                          <Chip key={i} size="sm" variant="bordered">
                            {trait}
                          </Chip>
                        ))}
                        {persona.personalityTraits.length > 3 && (
                          <Chip size="sm" variant="bordered">
                            +{persona.personalityTraits.length - 3}
                          </Chip>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Agent Count */}
                {persona.agentCount > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Used by {persona.agentCount} {persona.agentCount === 1 ? "agent" : "agents"}
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Validation Error */}
      {errors.persona_id && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          {errors.persona_id.message}
        </p>
      )}

      {/* Helper Text */}
      <p className="text-center text-sm text-muted-foreground">
        The selected persona's personality will be combined with your brand profile
      </p>
    </div>
  );
}

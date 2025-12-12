"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input, Textarea } from "@heroui/react";
import { AgentCreate } from "@/types/agent";

/**
 * Simplified Agent Wizard - Step 1: Basic Info
 * - Agent name
 * - Description
 */
export function AgentWizardStep1Simple() {
  const {
    control,
    formState: { errors },
  } = useFormContext<AgentCreate>();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Basic Information</h2>
        <p className="text-muted-foreground">
          Give your AI agent a name and describe what it does
        </p>
      </div>

      {/* Agent Name */}
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <Input
            label="Agent Name"
            labelPlacement="outside"
            placeholder="e.g., Customer Support Agent"
            description="A friendly name for your AI agent"
            errorMessage={errors.name?.message}
            isInvalid={!!errors.name}
            isRequired
            classNames={{
              label: "text-foreground font-medium",
              input: "text-foreground",
              description: "text-muted-foreground",
            }}
            {...field}
          />
        )}
      />

      {/* Description */}
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Description"
            labelPlacement="outside"
            placeholder="e.g., Handles customer inquiries, provides product information, and schedules appointments"
            description="What will this agent do? This helps you identify it later."
            errorMessage={errors.description?.message}
            isInvalid={!!errors.description}
            minRows={3}
            maxRows={5}
            isRequired
            classNames={{
              label: "text-foreground font-medium",
              input: "text-foreground",
              description: "text-muted-foreground",
            }}
            {...field}
          />
        )}
      />

      {/* Helper Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">💡 Tips</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Choose a descriptive name that reflects the agent's purpose</li>
          <li>• The description helps you and your team understand what this agent does</li>
          <li>• You can always edit these details later</li>
        </ul>
      </div>
    </div>
  );
}

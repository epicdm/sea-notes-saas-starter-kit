"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input, Textarea, Select, SelectItem, Slider } from "@heroui/react";
import { AgentCreate } from "@/types/agent";

/**
 * Simplified Agent Wizard - Step 2: AI Configuration
 * - AI Model
 * - Language
 * - Voice
 * - Instructions/Prompt
 * - Temperature (tweaking)
 */
export function AgentWizardStep2Simple() {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<AgentCreate>();

  const temperature = watch("temperature") || 0.7;

  // AI Model options
  const llmModels = [
    { value: "gpt-4o", label: "GPT-4O (Most Capable)" },
    { value: "gpt-4o-mini", label: "GPT-4O Mini (Fast & Cost-Effective)" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Fastest)" },
  ];

  // Voice options
  const voices = [
    { value: "echo", label: "Echo (Neutral)" },
    { value: "alloy", label: "Alloy (Professional)" },
    { value: "fable", label: "Fable (Warm)" },
    { value: "onyx", label: "Onyx (Deep)" },
    { value: "nova", label: "Nova (Friendly)" },
    { value: "shimmer", label: "Shimmer (Bright)" },
  ];

  // Language options
  const languages = [
    { value: "en", label: "English" },
    { value: "es", label: "Spanish" },
    { value: "fr", label: "French" },
    { value: "de", label: "German" },
    { value: "it", label: "Italian" },
    { value: "pt", label: "Portuguese" },
    { value: "zh", label: "Chinese" },
    { value: "ja", label: "Japanese" },
    { value: "ko", label: "Korean" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">AI Configuration</h2>
        <p className="text-muted-foreground">
          Configure the AI model, voice, and behavior
        </p>
      </div>

      {/* AI Model */}
      <Controller
        name="llm_model"
        control={control}
        render={({ field }) => (
          <Select
            label="AI Model"
            labelPlacement="outside"
            placeholder="Select AI model"
            description="Choose the AI model that powers your agent"
            selectedKeys={field.value ? [field.value] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              field.onChange(value);
            }}
            errorMessage={errors.llm_model?.message}
            isInvalid={!!errors.llm_model}
            isRequired
            classNames={{
              label: "text-foreground font-medium",
              value: "text-foreground",
              description: "text-muted-foreground",
            }}
          >
            {llmModels.map((model) => (
              <SelectItem key={model.value} value={model.value}>
                {model.label}
              </SelectItem>
            ))}
          </Select>
        )}
      />

      {/* Language */}
      <Controller
        name="language"
        control={control}
        render={({ field }) => (
          <Select
            label="Language"
            labelPlacement="outside"
            placeholder="Select language"
            description="Primary language for your agent"
            selectedKeys={field.value ? [field.value] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              field.onChange(value);
            }}
            classNames={{
              label: "text-foreground font-medium",
              value: "text-foreground",
              description: "text-muted-foreground",
            }}
          >
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </Select>
        )}
      />

      {/* Voice */}
      <Controller
        name="voice"
        control={control}
        render={({ field }) => (
          <Select
            label="Voice"
            labelPlacement="outside"
            placeholder="Select voice"
            description="The voice your agent will use"
            selectedKeys={field.value ? [field.value] : []}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string;
              field.onChange(value);
            }}
            errorMessage={errors.voice?.message}
            isInvalid={!!errors.voice}
            isRequired
            classNames={{
              label: "text-foreground font-medium",
              value: "text-foreground",
              description: "text-muted-foreground",
            }}
          >
            {voices.map((voice) => (
              <SelectItem key={voice.value} value={voice.value}>
                {voice.label}
              </SelectItem>
            ))}
          </Select>
        )}
      />

      {/* Instructions/Prompt */}
      <Controller
        name="instructions"
        control={control}
        render={({ field }) => (
          <Textarea
            label="Agent Instructions (Prompt)"
            labelPlacement="outside"
            placeholder="You are a helpful customer support agent. Be friendly, professional, and concise. Help customers with their questions about our products and services."
            description="Tell your agent how to behave and what to do"
            errorMessage={errors.instructions?.message}
            isInvalid={!!errors.instructions}
            minRows={5}
            maxRows={10}
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

      {/* Temperature - Fine Tuning */}
      <Controller
        name="temperature"
        control={control}
        render={({ field }) => (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">
                Creativity (Temperature)
              </label>
              <span className="text-sm text-muted-foreground">{temperature.toFixed(1)}</span>
            </div>
            <Slider
              value={field.value}
              onChange={field.onChange}
              minValue={0}
              maxValue={2}
              step={0.1}
              color="primary"
              size="sm"
              classNames={{
                base: "max-w-full",
                track: "bg-gray-200 dark:bg-gray-700",
                filler: "bg-primary",
              }}
            />
            <p className="text-xs text-muted-foreground">
              Lower values (0-0.5) = more focused and consistent. Higher values (0.8-2) = more creative and varied.
            </p>
          </div>
        )}
      />

      {/* Helper Tips */}
      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">✨ What's Next?</h4>
        <ul className="text-sm text-green-800 dark:text-green-300 space-y-1">
          <li>• After creation, you can configure advanced options (turn detection, noise cancellation, etc.)</li>
          <li>• You can assign phone numbers to your agent from the edit page</li>
          <li>• Test your agent before going live</li>
        </ul>
      </div>
    </div>
  );
}

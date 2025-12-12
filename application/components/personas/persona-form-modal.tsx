"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Checkbox,
  CheckboxGroup,
  Accordion,
  AccordionItem,
  Chip,
  Divider,
} from "@heroui/react";
import { toast } from "sonner";
import { Plus, Trash2, Settings } from "lucide-react";
import type { Persona, PersonaTemplate, ToolConfig } from "@/types/persona";
import {
  createPersonaSchema,
  updatePersonaSchema,
  personaTypes,
  personaCapabilities,
  toneOptions,
  languageStyleOptions,
  voiceProviders,
  personaTypeLabels,
  capabilityLabels,
  toneLabels,
  languageStyleLabels,
  voiceProviderLabels,
  getDefaultVoiceConfig,
  getDefaultToolConfig,
  type CreatePersonaForm,
  type UpdatePersonaForm,
  type VoiceConfigForm,
  type ToolConfigForm,
  type PersonaCapability,
} from "@/lib/schemas/persona-schema";

interface PersonaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePersonaForm | UpdatePersonaForm) => Promise<void>;
  persona?: Persona | null;
  template?: PersonaTemplate | null;
  mode: "create" | "edit";
}

/**
 * Persona Form Modal Component
 * Comprehensive form for creating and editing personas with multi-channel support
 *
 * Features:
 * - Create and Edit modes
 * - Template pre-filling
 * - Multi-channel capability selection
 * - Conditional voice configuration
 * - Dynamic tools management
 * - Full Zod validation
 * - Responsive design with accordion sections
 */
export function PersonaFormModal({
  isOpen,
  onClose,
  onSubmit,
  persona,
  template,
  mode,
}: PersonaFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [tools, setTools] = useState<ToolConfigForm[]>([]);

  // Determine schema based on mode
  const schema = mode === "create" ? createPersonaSchema : updatePersonaSchema;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CreatePersonaForm | UpdatePersonaForm>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(mode, persona, template),
  });

  const capabilities = watch("capabilities") as PersonaCapability[];

  // Update selectedCapabilities when capabilities change
  useEffect(() => {
    if (capabilities) {
      setSelectedCapabilities(capabilities);
    }
  }, [capabilities]);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      const defaults = getDefaultValues(mode, persona, template);
      reset(defaults);
      setSelectedCapabilities((defaults.capabilities as string[]) || []);
      setTools((defaults.tools as ToolConfigForm[]) || []);
    }
  }, [isOpen, mode, persona, template, reset]);

  const handleFormSubmit = async (data: CreatePersonaForm | UpdatePersonaForm) => {
    try {
      setIsSubmitting(true);

      // Add tools to data
      const submitData = {
        ...data,
        tools: tools.length > 0 ? tools : undefined,
      };

      await onSubmit(submitData);
      toast.success(
        mode === "create"
          ? "Persona created successfully"
          : "Persona updated successfully"
      );
      onClose();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save persona"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCapabilityChange = (selected: string[]) => {
    setSelectedCapabilities(selected);
    setValue("capabilities", selected as PersonaCapability[], {
      shouldValidate: true,
    });

    // Auto-add voice config if voice capability is selected
    if (selected.includes("voice") && !watch("voiceConfig")) {
      setValue("voiceConfig", getDefaultVoiceConfig("openai"));
    }
  };

  const handleAddTool = () => {
    setTools([...tools, getDefaultToolConfig("custom_tool")]);
  };

  const handleRemoveTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const handleToolChange = (
    index: number,
    field: keyof ToolConfigForm,
    value: any
  ) => {
    const updatedTools = [...tools];
    updatedTools[index] = { ...updatedTools[index], [field]: value };
    setTools(updatedTools);
  };

  const isVoiceCapabilitySelected = selectedCapabilities.includes("voice");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="3xl"
      scrollBehavior="inside"
      isDismissable={!isSubmitting}
      classNames={{
        base: "max-h-[90vh]",
        header: "border-b border-divider",
        body: "p-6",
      }}
    >
      <ModalContent>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <ModalHeader>
            <h2 className="text-xl font-semibold">
              {mode === "create" ? "Create New Persona" : "Edit Persona"}
            </h2>
          </ModalHeader>

          <ModalBody>
            <div className="space-y-6">
              {/* Basic Information */}
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Basic Information
                </h3>

                {/* Name */}
                <Input
                  label="Persona Name"
                  placeholder="e.g., Customer Support Agent"
                  isRequired
                  isInvalid={!!errors.name}
                  errorMessage={errors.name?.message}
                  {...register("name")}
                />

                {/* Type */}
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Persona Type"
                      placeholder="Select a type"
                      selectedKeys={field.value ? [field.value] : []}
                      onSelectionChange={(keys) => {
                        const value = Array.from(keys)[0] as string;
                        field.onChange(value);
                      }}
                      isRequired
                      isInvalid={!!(errors as any).type}
                      errorMessage={(errors as any).type?.message}
                    >
                      {personaTypes.map((type) => (
                        <SelectItem key={type}>
                          {personaTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />

                {/* Description */}
                <Textarea
                  label="Description (Optional)"
                  placeholder="Brief description of this persona's purpose..."
                  minRows={2}
                  maxRows={4}
                  isInvalid={!!errors.description}
                  errorMessage={errors.description?.message}
                  {...register("description")}
                />

                {/* Instructions */}
                <Textarea
                  label="Instructions"
                  placeholder="Enter detailed instructions for how this persona should behave..."
                  minRows={6}
                  maxRows={12}
                  isRequired
                  isInvalid={!!errors.instructions}
                  errorMessage={errors.instructions?.message}
                  description="Minimum 50 characters, maximum 5000 characters"
                  {...register("instructions")}
                />
              </section>

              <Divider />

              {/* Communication Channels */}
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Communication Channels
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select at least one communication channel
                  </p>
                </div>

                <CheckboxGroup
                  value={selectedCapabilities}
                  onValueChange={handleCapabilityChange}
                  isInvalid={!!errors.capabilities}
                  errorMessage={errors.capabilities?.message}
                >
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {personaCapabilities.map((capability) => (
                      <Checkbox key={capability} value={capability}>
                        {capabilityLabels[capability]}
                      </Checkbox>
                    ))}
                  </div>
                </CheckboxGroup>
              </section>

              <Divider />

              {/* Personality Configuration */}
              <Accordion variant="bordered">
                <AccordionItem
                  key="personality"
                  title="Personality & Communication Style"
                  subtitle="Optional settings"
                >
                  <div className="space-y-4 pb-4">
                    {/* Tone */}
                    <Controller
                      name="tone"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Tone"
                          placeholder="Select a tone"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            field.onChange(value || undefined);
                          }}
                        >
                          {toneOptions.map((tone) => (
                            <SelectItem key={tone}>
                              {toneLabels[tone]}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />

                    {/* Language Style */}
                    <Controller
                      name="languageStyle"
                      control={control}
                      render={({ field }) => (
                        <Select
                          label="Language Style"
                          placeholder="Select a style"
                          selectedKeys={field.value ? [field.value] : []}
                          onSelectionChange={(keys) => {
                            const value = Array.from(keys)[0] as string;
                            field.onChange(value || undefined);
                          }}
                        >
                          {languageStyleOptions.map((style) => (
                            <SelectItem key={style}>
                              {languageStyleLabels[style]}
                            </SelectItem>
                          ))}
                        </Select>
                      )}
                    />
                  </div>
                </AccordionItem>

                {/* Voice Configuration */}
                {isVoiceCapabilitySelected && (
                  <AccordionItem
                    key="voice"
                    title="Voice Configuration"
                    subtitle="Required for voice capability"
                    classNames={{
                      title: errors.voiceConfig ? "text-danger" : "",
                    }}
                  >
                    <div className="space-y-4 pb-4">
                      {/* Voice Provider */}
                      <Controller
                        name="voiceConfig.provider"
                        control={control}
                        render={({ field }) => (
                          <Select
                            label="Voice Provider"
                            placeholder="Select provider"
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => {
                              const value = Array.from(keys)[0] as string;
                              field.onChange(value);
                              // Update defaults when provider changes
                              const defaults = getDefaultVoiceConfig(
                                value as any
                              );
                              setValue("voiceConfig", defaults);
                            }}
                            isRequired
                            isInvalid={!!errors.voiceConfig?.provider}
                          >
                            {voiceProviders.map((provider) => (
                              <SelectItem key={provider}>
                                {voiceProviderLabels[provider]}
                              </SelectItem>
                            ))}
                          </Select>
                        )}
                      />

                      {/* Voice ID */}
                      <Input
                        label="Voice ID"
                        placeholder="e.g., nova, alloy, echo"
                        isRequired
                        isInvalid={!!errors.voiceConfig?.voice_id}
                        errorMessage={errors.voiceConfig?.voice_id?.message}
                        {...register("voiceConfig.voice_id")}
                      />

                      {/* Speed */}
                      <Input
                        type="number"
                        label="Speed"
                        placeholder="1.0"
                        step="0.1"
                        min="0.5"
                        max="2.0"
                        description="0.5 to 2.0 (1.0 is normal)"
                        {...register("voiceConfig.speed", {
                          valueAsNumber: true,
                        })}
                      />
                    </div>
                  </AccordionItem>
                )}

                {/* Tools Configuration */}
                <AccordionItem
                  key="tools"
                  title="Tools & Functions"
                  subtitle="Optional integrations"
                  startContent={<Settings className="h-4 w-4" />}
                >
                  <div className="space-y-4 pb-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">
                        {tools.length === 0
                          ? "No tools configured"
                          : `${tools.length} ${
                              tools.length === 1 ? "tool" : "tools"
                            } configured`}
                      </p>
                      <Button
                        size="sm"
                        variant="flat"
                        color="primary"
                        startContent={<Plus className="h-4 w-4" />}
                        onPress={handleAddTool}
                      >
                        Add Tool
                      </Button>
                    </div>

                    {/* Tools List */}
                    {tools.map((tool, index) => (
                      <div
                        key={index}
                        className="p-4 border border-divider rounded-lg space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <Chip size="sm" variant="dot">
                            Tool {index + 1}
                          </Chip>
                          <Button
                            size="sm"
                            isIconOnly
                            variant="light"
                            color="danger"
                            onPress={() => handleRemoveTool(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <Input
                          label="Tool Name"
                          placeholder="e.g., knowledge_base"
                          value={tool.name}
                          onChange={(e) =>
                            handleToolChange(index, "name", e.target.value)
                          }
                          size="sm"
                        />

                        <Textarea
                          label="Description"
                          placeholder="What does this tool do?"
                          value={tool.description}
                          onChange={(e) =>
                            handleToolChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          minRows={2}
                          size="sm"
                        />

                        <Checkbox
                          isSelected={tool.enabled}
                          onValueChange={(checked) =>
                            handleToolChange(index, "enabled", checked)
                          }
                          size="sm"
                        >
                          Enabled
                        </Checkbox>
                      </div>
                    ))}
                  </div>
                </AccordionItem>
              </Accordion>

              {/* Error Summary */}
              {Object.keys(errors).length > 0 && (
                <div className="p-3 rounded-lg bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800">
                  <p className="text-sm font-medium text-danger-700 dark:text-danger-300">
                    Please fix the following errors:
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-danger-600 dark:text-danger-400">
                    {Object.entries(errors).map(([key, error]) => (
                      <li key={key}>
                        • {key}: {error.message as string}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ModalBody>

          <ModalFooter className="border-t border-divider">
            <Button variant="light" onPress={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              {mode === "create" ? "Create Persona" : "Save Changes"}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

/**
 * Get default form values based on mode and data
 */
function getDefaultValues(
  mode: "create" | "edit",
  persona?: Persona | null,
  template?: PersonaTemplate | null
): Partial<CreatePersonaForm | UpdatePersonaForm> {
  // Edit mode - use existing persona
  if (mode === "edit" && persona) {
    return {
      name: persona.name,
      type: persona.type as any,
      description: persona.description || "",
      instructions: persona.instructions,
      personalityTraits: persona.personalityTraits || [],
      tone: persona.tone as any,
      languageStyle: persona.languageStyle as any,
      suggestedVoice: persona.suggestedVoice || "",
      capabilities: persona.capabilities as PersonaCapability[],
      voiceConfig: persona.voiceConfig as VoiceConfigForm,
      tools: persona.tools as ToolConfigForm[],
    };
  }

  // Create from template
  if (mode === "create" && template) {
    const templateData = template.templateData;
    return {
      name: templateData.name,
      type: templateData.type as any,
      description: "",
      instructions: templateData.instructions,
      personalityTraits: templateData.personalityTraits || [],
      tone: templateData.tone as any,
      languageStyle: templateData.languageStyle as any,
      suggestedVoice: "",
      capabilities: templateData.capabilities as PersonaCapability[],
      voiceConfig: templateData.voiceConfig as VoiceConfigForm,
      tools: templateData.tools as ToolConfigForm[],
    };
  }

  // Create new persona - empty defaults
  return {
    name: "",
    type: "custom",
    description: "",
    instructions: "",
    personalityTraits: [],
    tone: "professional",
    languageStyle: "conversational",
    suggestedVoice: "",
    capabilities: ["voice"],
    voiceConfig: getDefaultVoiceConfig("openai"),
    tools: [],
  };
}

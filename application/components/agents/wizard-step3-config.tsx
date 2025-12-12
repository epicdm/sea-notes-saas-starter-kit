"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Input, Select, SelectItem, Slider, Card, CardBody, Checkbox, CheckboxGroup } from "@heroui/react";
import { AgentCreate } from "@/types/agent";
import { Bot, Mic, Gauge, Phone } from "lucide-react";
import { usePersonas } from "@/lib/hooks/use-personas";
import { usePhoneNumbers } from "@/lib/hooks/use-phone-numbers";
import { useMemo } from "react";
import { getAgentTypeLabel } from "@/types/agent";
import { formatPhoneNumber, canAssignPhoneNumber } from "@/types/phone-number";

/**
 * Wizard Step 4: Final Configuration
 * Name, AI Model, Voice, Temperature
 */
export function WizardStep3Config() {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<AgentCreate>();

  const temperature = watch("temperature") || 0.7;
  const agentType = watch("agent_type");
  const personaId = watch("persona_id");

  // Fetch personas to get selected persona name
  const { personas } = usePersonas();
  const selectedPersona = useMemo(() => {
    return personas.find(p => p.id === personaId);
  }, [personas, personaId]);

  // Fetch phone numbers for assignment
  const { phoneNumbers, isLoading: phoneNumbersLoading } = usePhoneNumbers();
  const availablePhoneNumbers = useMemo(() => {
    return phoneNumbers.filter(phone => canAssignPhoneNumber(phone));
  }, [phoneNumbers]);

  // AI Model options
  const llmModels = [
    { value: "gpt-4o", label: "GPT-4O", description: "Most capable, best quality" },
    { value: "gpt-4o-mini", label: "GPT-4O Mini", description: "Fast & cost-effective (Recommended)" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo", description: "High performance" },
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "Fastest, lowest cost" },
  ];

  // Voice options
  const voices = [
    { value: "echo", label: "Echo", description: "Neutral, professional" },
    { value: "alloy", label: "Alloy", description: "Warm, confident" },
    { value: "fable", label: "Fable", description: "British, expressive" },
    { value: "onyx", label: "Onyx", description: "Deep, authoritative" },
    { value: "nova", label: "Nova", description: "Friendly, energetic" },
    { value: "shimmer", label: "Shimmer", description: "Soft, gentle" },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Final Configuration</h2>
        <p className="text-lg text-muted-foreground">
          Name your agent and fine-tune AI settings
        </p>
      </div>

      {/* Agent Name */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Agent Identity</h3>
          </div>

          <div className="space-y-4">
            <Controller
              name="name"
              control={control}
              rules={{
                required: "Agent name is required",
                minLength: { value: 3, message: "Name must be at least 3 characters" },
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Agent Name"
                  labelPlacement="outside"
                  placeholder="e.g., Customer Support Agent, Sales Assistant"
                  description="Give your agent a descriptive name"
                  isRequired
                  errorMessage={errors.name?.message}
                  isInvalid={!!errors.name}
                  classNames={{
                    label: "text-foreground font-medium",
                    input: "text-foreground",
                  }}
                />
              )}
            />

            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  label="Description (Optional)"
                  labelPlacement="outside"
                  placeholder="Brief description of what this agent does"
                  classNames={{
                    label: "text-foreground font-medium",
                    input: "text-foreground",
                  }}
                />
              )}
            />
          </div>
        </CardBody>
      </Card>

      {/* Agent Customization */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bot className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Agent Customization</h3>
          </div>

          <div className="space-y-4">
            {/* Custom Instructions */}
            <Controller
              name="custom_instructions"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Custom Instructions (Optional)
                  </label>
                  <textarea
                    {...field}
                    rows={4}
                    placeholder="Add agent-specific instructions that will be appended to the persona's instructions..."
                    className="w-full p-3 rounded-lg border border-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    These instructions will be combined with your selected persona
                  </p>
                </div>
              )}
            />

            {/* Deployment Mode */}
            <Controller
              name="deployment_mode"
              control={control}
              render={({ field }) => (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Deployment Environment
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: "production", label: "Production", desc: "Live" },
                      { value: "staging", label: "Staging", desc: "Testing" },
                      { value: "development", label: "Development", desc: "Dev" },
                    ].map((mode) => (
                      <button
                        key={mode.value}
                        type="button"
                        onClick={() => field.onChange(mode.value)}
                        className={`
                          p-3 rounded-lg border-2 transition-all
                          ${
                            field.value === mode.value
                              ? "border-primary bg-primary/10"
                              : "border-border hover:border-primary/50"
                          }
                        `}
                      >
                        <div className="font-semibold text-sm">{mode.label}</div>
                        <div className="text-xs text-muted-foreground">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            />
          </div>
        </CardBody>
      </Card>

      {/* AI Model Selection */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Mic className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Voice & AI Model</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="llm_model"
              control={control}
              rules={{ required: "AI model is required" }}
              render={({ field }) => (
                <Select
                  label="AI Model"
                  labelPlacement="outside"
                  placeholder="Select AI model"
                  description="The AI brain powering your agent"
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
                  }}
                >
                  {llmModels.map((model) => (
                    <SelectItem key={model.value} value={model.value} textValue={model.label}>
                      <div className="flex flex-col">
                        <span className="font-semibold">{model.label}</span>
                        <span className="text-xs text-muted-foreground">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              )}
            />

            <Controller
              name="voice"
              control={control}
              rules={{ required: "Voice is required" }}
              render={({ field }) => (
                <Select
                  label="Voice"
                  labelPlacement="outside"
                  placeholder="Select voice"
                  description="How your agent will sound"
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
                  }}
                >
                  {voices.map((voice) => (
                    <SelectItem key={voice.value} value={voice.value} textValue={voice.label}>
                      <div className="flex flex-col">
                        <span className="font-semibold">{voice.label}</span>
                        <span className="text-xs text-muted-foreground">{voice.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>
        </CardBody>
      </Card>

      {/* Temperature/Creativity */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Gauge className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Response Creativity</h3>
          </div>

          <Controller
            name="temperature"
            control={control}
            render={({ field }) => (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium text-foreground">
                    Temperature
                  </label>
                  <span className="text-sm font-semibold text-primary">{temperature.toFixed(1)}</span>
                </div>

                <Slider
                  value={field.value}
                  onChange={field.onChange}
                  minValue={0}
                  maxValue={2}
                  step={0.1}
                  color="primary"
                  size="lg"
                  showTooltip={true}
                  classNames={{
                    track: "h-2",
                    thumb: "w-6 h-6",
                  }}
                />

                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>More Focused</span>
                  <span>Balanced</span>
                  <span>More Creative</span>
                </div>

                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    {temperature < 0.5 && "🎯 Focused: Consistent, predictable responses. Best for customer support and factual information."}
                    {temperature >= 0.5 && temperature < 1.0 && "⚖️ Balanced: Mix of consistency and creativity. Good for most use cases."}
                    {temperature >= 1.0 && "🎨 Creative: More varied and engaging responses. Best for sales and conversational agents."}
                  </p>
                </div>
              </div>
            )}
          />
        </CardBody>
      </Card>

      {/* Phone Number Assignment (Optional) */}
      <Card>
        <CardBody className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Phone className="w-6 h-6 text-primary" />
            <h3 className="text-xl font-bold text-foreground">Phone Numbers (Optional)</h3>
          </div>

          <p className="text-sm text-muted-foreground mb-4">
            Select phone numbers to assign to this agent. You can also assign numbers later.
          </p>

          {phoneNumbersLoading ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              Loading phone numbers...
            </div>
          ) : availablePhoneNumbers.length === 0 ? (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                No available phone numbers to assign
              </p>
              <p className="text-xs text-muted-foreground">
                You can provision new phone numbers from the Phone Numbers page
              </p>
            </div>
          ) : (
            <Controller
              name="phone_number_ids"
              control={control}
              render={({ field }) => (
                <CheckboxGroup
                  value={field.value || []}
                  onChange={field.onChange}
                  classNames={{
                    wrapper: "gap-2"
                  }}
                >
                  {availablePhoneNumbers.map((phone) => (
                    <Checkbox
                      key={phone.id}
                      value={phone.id}
                      classNames={{
                        label: "text-sm font-medium text-foreground"
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{formatPhoneNumber(phone)}</span>
                        {phone.country_code && (
                          <span className="text-xs text-muted-foreground">
                            ({phone.country_code})
                          </span>
                        )}
                      </div>
                    </Checkbox>
                  ))}
                </CheckboxGroup>
              )}
            />
          )}
        </CardBody>
      </Card>

      {/* Summary Preview */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20">
        <CardBody className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">📋 Configuration Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Agent Type:</p>
              <p className="font-semibold text-foreground">
                {agentType ? getAgentTypeLabel(agentType) : "Not set"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Persona:</p>
              <p className="font-semibold text-foreground">
                {selectedPersona ? selectedPersona.name : "Not selected"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">AI Model:</p>
              <p className="font-semibold text-foreground">{watch("llm_model") || "Not selected"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Voice:</p>
              <p className="font-semibold text-foreground">{watch("voice") || "Not selected"}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

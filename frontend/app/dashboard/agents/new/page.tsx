"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Progress } from "@heroui/react";
import { toast } from "sonner";
import { WizardStep1Type } from "@/components/agents/wizard-step1-type";
import { WizardStep2Persona } from "@/components/agents/wizard-step2-persona";
import { WizardStep3Config } from "@/components/agents/wizard-step3-config";
import { agentVisualWizardSchema, agentVisualWizardDefaults } from "@/lib/schemas/agent-schema-visual";
import { api, isApiError } from "@/lib/api-client";
import { Agent, AgentCreate } from "@/types/agent";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBrandProfile } from "@/lib/hooks/use-brand-profile";

/**
 * Visual Agent Creation Wizard
 * Simplified 3-step design with persona library:
 * 1. Agent Type (Inbound/Outbound/Hybrid)
 * 2. Persona Selection (from your persona library)
 * 3. Final Configuration (Name, Model, Voice, Phone Numbers)
 */
export default function AgentWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Fetch brand profile for integration
  const { brandProfile } = useBrandProfile();

  const totalSteps = 3;

  // React Hook Form with Zod validation
  const methods = useForm<AgentCreate>({
    resolver: zodResolver(agentVisualWizardSchema),
    defaultValues: agentVisualWizardDefaults,
    mode: "onChange",
  });

  const { handleSubmit, trigger, formState: { errors } } = methods;

  const stepTitles = [
    "Agent Type",
    "Persona",
    "Configuration",
  ];

  /**
   * Navigate to next step with validation
   */
  const handleNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let isValid = false;

    // Validate current step fields
    if (currentStep === 1) {
      isValid = await trigger(["agent_type"]);
    } else if (currentStep === 2) {
      isValid = await trigger(["persona_id"]);
    } else if (currentStep === 3) {
      isValid = await trigger(["name", "llm_model", "voice"]);
    }

    console.log('Step validation:', { currentStep, isValid, errors });

    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else if (!isValid) {
      toast.error("Please complete the required fields", {
        description: "Check the highlighted fields above",
      });
    }
  };

  /**
   * Navigate to previous step
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  /**
   * Submit agent creation to API
   */
  const onSubmit = async (data: AgentCreate) => {
    // Prevent submission if not on final step
    if (currentStep < totalSteps) {
      await handleNext();
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      console.log('Submitting agent creation:', data);

      // Include brand profile if available
      const payload = {
        ...data,
        brand_profile_id: brandProfile?.id || undefined,
      };

      console.log('Agent creation payload with brand profile:', payload);

      // Call POST /api/user/agents
      const response = await api.post<any>("/api/user/agents", payload);

      console.log('Agent creation response:', response);

      // Extract agent from response
      const newAgent = response.data || response;

      // Success! Show toast
      toast.success("🎉 Agent created successfully!", {
        description: `${newAgent.name} is ready to handle calls. You can configure advanced options by editing the agent.`,
        duration: 5000,
      });

      // Redirect to agents list
      router.push("/dashboard/agents");
    } catch (error) {
      console.error('Agent creation error:', error);

      // Handle error
      const errorMessage = isApiError(error)
        ? error.message
        : "Failed to create agent. Please try again.";

      setSubmitError(errorMessage);

      toast.error("Error Creating Agent", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Retry submission after error
   */
  const handleRetry = () => {
    setSubmitError(null);
    handleSubmit(onSubmit)();
  };

  /**
   * Render current step component
   */
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <WizardStep1Type />;
      case 2:
        return <WizardStep2Persona />;
      case 3:
        return <WizardStep3Config />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-8">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Create Your AI Agent
          </h1>
          <p className="text-lg text-muted-foreground">
            Build a powerful voice AI agent in 3 simple steps
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-foreground">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}% Complete
            </span>
          </div>

          <Progress
            value={(currentStep / totalSteps) * 100}
            color="primary"
            size="md"
            className="mb-6"
            aria-label="Wizard progress"
            classNames={{
              indicator: "bg-gradient-to-r from-primary to-primary/80",
            }}
          />

          {/* Step Labels */}
          <div className="hidden md:flex justify-between">
            {stepTitles.map((title, index) => {
              const stepNum = index + 1;
              const isActive = currentStep === stepNum;
              const isComplete = currentStep > stepNum;

              return (
                <div
                  key={stepNum}
                  className={`flex items-center gap-2 ${
                    isActive
                      ? "text-primary font-semibold"
                      : isComplete
                      ? "text-green-600 dark:text-green-400"
                      : "text-muted-foreground"
                  }`}
                >
                  <div
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${isActive
                        ? "bg-primary text-white"
                        : isComplete
                        ? "bg-green-600 dark:bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-muted-foreground"
                      }
                    `}
                  >
                    {isComplete ? "✓" : stepNum}
                  </div>
                  <span className="text-sm">{title}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Current Step Content */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-border p-8 mb-8">
              {renderStep()}
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="mb-6 p-5 bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
                <div className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 dark:text-red-200 mb-1">
                      Error Creating Agent
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-300">{submitError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <div>
                {currentStep > 1 ? (
                  <Button
                    size="lg"
                    variant="flat"
                    type="button"
                    onClick={handleBack}
                    isDisabled={isSubmitting}
                    startContent={<ChevronLeft className="w-5 h-5" />}
                  >
                    Back
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="light"
                    type="button"
                    onClick={() => router.push("/dashboard/agents")}
                    isDisabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                )}
              </div>

              <div className="flex gap-3">
                {submitError && (
                  <Button
                    size="lg"
                    color="warning"
                    variant="flat"
                    type="button"
                    onClick={handleRetry}
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                  >
                    Retry
                  </Button>
                )}

                {currentStep < totalSteps ? (
                  <Button
                    size="lg"
                    color="primary"
                    type="button"
                    onClick={handleNext}
                    isDisabled={isSubmitting}
                    endContent={<ChevronRight className="w-5 h-5" />}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    color="primary"
                    type="submit"
                    isLoading={isSubmitting}
                    isDisabled={isSubmitting}
                    className="min-w-[200px]"
                  >
                    {isSubmitting ? "Creating Agent..." : "🚀 Create Agent"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

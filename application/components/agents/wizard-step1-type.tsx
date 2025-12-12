"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Card, CardBody } from "@heroui/react";
import { AgentCreate, AgentType, getAgentTypeIcon, getAgentTypeDescription } from "@/types/agent";
import { CheckCircle } from "lucide-react";

/**
 * Wizard Step 1: Select Agent Type (Tile-based)
 * Visual card selection for Inbound/Outbound/Hybrid
 */
export function WizardStep1Type() {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<AgentCreate>();

  const selectedType = watch("agent_type");

  const agentTypes = [
    {
      value: AgentType.INBOUND,
      label: "Inbound Agent",
      icon: "📥",
      description: "Receives incoming calls from customers",
      color: "blue",
      use_cases: ["Customer support", "Order taking", "General inquiries"],
    },
    {
      value: AgentType.OUTBOUND,
      label: "Outbound Agent",
      icon: "📤",
      description: "Makes outgoing calls to prospects or customers",
      color: "green",
      use_cases: ["Sales calls", "Appointment setting", "Surveys", "Follow-ups"],
    },
    {
      value: AgentType.HYBRID,
      label: "Hybrid Agent",
      icon: "🔄",
      description: "Handles both incoming and outgoing calls",
      color: "purple",
      use_cases: ["Full service", "Sales + support", "Multi-purpose"],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-foreground mb-3">Choose Your Agent Type</h2>
        <p className="text-lg text-muted-foreground">
          Select how your AI agent will interact with customers
        </p>
      </div>

      <Controller
        name="agent_type"
        control={control}
        rules={{ required: "Please select an agent type" }}
        render={({ field }) => (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {agentTypes.map((type) => {
              const isSelected = field.value === type.value;
              return (
                <Card
                  key={type.value}
                  isPressable
                  isHoverable
                  onPress={() => field.onChange(type.value)}
                  className={`
                    relative cursor-pointer transition-all duration-200
                    ${isSelected
                      ? 'border-2 border-primary shadow-lg scale-105'
                      : 'border border-border hover:border-primary/50 hover:shadow-md'
                    }
                  `}
                >
                  <CardBody className="p-6">
                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <CheckCircle className="w-6 h-6 text-primary fill-primary" />
                      </div>
                    )}

                    {/* Icon */}
                    <div className="text-center mb-4">
                      <div className="text-6xl mb-3">{type.icon}</div>
                      <h3 className="text-xl font-bold text-foreground mb-2">
                        {type.label}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {type.description}
                      </p>
                    </div>

                    {/* Use Cases */}
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Best For:
                      </p>
                      <ul className="space-y-1">
                        {type.use_cases.map((useCase, idx) => (
                          <li key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                            <span className="text-primary">•</span>
                            {useCase}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      />

      {errors.agent_type && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center">
          {errors.agent_type.message}
        </p>
      )}

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-3">💡 Not sure which to choose?</h4>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
          <li>• <strong>Inbound:</strong> Perfect for customer service, support lines, and order taking</li>
          <li>• <strong>Outbound:</strong> Ideal for sales calls, surveys, appointment reminders</li>
          <li>• <strong>Hybrid:</strong> Best when you need flexibility for both call types</li>
        </ul>
      </div>
    </div>
  );
}

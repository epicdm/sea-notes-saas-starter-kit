"use client";

import { useFormContext, Controller } from "react-hook-form";
import { Select, SelectItem, Card, CardBody, Chip, Button } from "@heroui/react";
import { AgentCreate } from "@/lib/schemas/agent-schema";
import { usePhoneNumbers } from "@/lib/hooks/use-phone-numbers";
import { PhoneNumber, formatPhoneNumber, getCountryFlag, canAssignPhoneNumber } from "@/types/phone-number";

/**
 * Agent Wizard Step 4: Phone Number Assignment (Optional)
 * - Select available phone numbers to assign to this agent
 * - Display current assignment status
 * - Skip if no phone numbers needed
 */
export function AgentWizardStep4() {
  const {
    control,
    formState: { errors },
    watch,
  } = useFormContext<AgentCreate>();

  const { phoneNumbers, isLoading } = usePhoneNumbers();

  // Filter to only show unassigned phone numbers
  const availablePhones = phoneNumbers.filter(canAssignPhoneNumber);

  // Watch selected phone numbers
  const selectedPhoneIds = watch("phone_number_ids") || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Phone Number Assignment</h2>
        <p className="text-gray-600">
          Assign phone numbers to this agent (optional - you can do this later)
        </p>
      </div>

      {/* Phone Number Selection */}
      <div className="space-y-2">
        <Controller
          name="phone_number_ids"
          control={control}
          defaultValue={[]}
          render={({ field }) => (
            <Select
              label="Phone Numbers"
              labelPlacement="outside"
              placeholder={
                isLoading
                  ? "Loading phone numbers..."
                  : availablePhones.length === 0
                  ? "No available phone numbers"
                  : "Select phone numbers to assign"
              }
              description="Choose which phone numbers should route to this agent"
              selectionMode="multiple"
              isDisabled={isLoading || availablePhones.length === 0}
              selectedKeys={field.value || []}
              onSelectionChange={(keys) => {
                const selectedArray = Array.from(keys) as string[];
                field.onChange(selectedArray);
              }}
              classNames={{
                base: "mb-2",
                label: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2",
                trigger: "min-h-12 mt-1",
                value: "text-sm",
                description: "mt-1",
                popoverContent: "z-[9999]",
              }}
              renderValue={(items) => {
                if (items.length === 0) {
                  return <span className="text-gray-400">No numbers selected</span>;
                }
                return (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => {
                      const phone = availablePhones.find((p) => p.id === item.key);
                      if (!phone) return null;
                      return (
                        <Chip
                          key={item.key}
                          variant="flat"
                          color="primary"
                          size="sm"
                        >
                          {getCountryFlag(phone.country_code)} {formatPhoneNumber(phone.phone_number)}
                        </Chip>
                      );
                    })}
                  </div>
                );
              }}
            >
              {availablePhones.map((phone) => (
                <SelectItem
                  key={phone.id}
                  textValue={phone.phone_number}
                >
                  <div className="flex items-center gap-2">
                    <span>{getCountryFlag(phone.country_code)}</span>
                    <span>{formatPhoneNumber(phone.phone_number)}</span>
                    <Chip size="sm" variant="flat" color="success">
                      Available
                    </Chip>
                  </div>
                </SelectItem>
              ))}
            </Select>
          )}
        />
      </div>

      {/* Selected Phone Numbers Preview */}
      {selectedPhoneIds.length > 0 && (
        <Card>
          <CardBody>
            <h4 className="font-semibold text-foreground mb-3">
              Selected Phone Numbers ({selectedPhoneIds.length})
            </h4>
            <div className="space-y-2">
              {selectedPhoneIds.map((phoneId: string) => {
                const phone = availablePhones.find((p) => p.id === phoneId);
                if (!phone) return null;
                return (
                  <div
                    key={phone.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCountryFlag(phone.country_code)}</span>
                      <div>
                        <div className="font-medium">{formatPhoneNumber(phone.phone_number)}</div>
                        <div className="text-xs text-gray-500">
                          Provider: {phone.provider}
                        </div>
                      </div>
                    </div>
                    <Chip size="sm" variant="flat" color="primary">
                      Will be assigned
                    </Chip>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>
      )}

      {/* No Phone Numbers Available */}
      {!isLoading && availablePhones.length === 0 && (
        <Card>
          <CardBody className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg
                className="w-16 h-16 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
              No Phone Numbers Available
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              You don't have any unassigned phone numbers yet. You can assign phone numbers to this agent later from the phone numbers page.
            </p>
            <Button
              color="primary"
              variant="flat"
              size="sm"
              as="a"
              href="/dashboard/phone-numbers"
              target="_blank"
            >
              Manage Phone Numbers
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Helpful Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">💡 Tips</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• You can assign multiple phone numbers to one agent</li>
          <li>• Phone numbers can be reassigned to different agents later</li>
          <li>• Skipping this step is fine - you can assign numbers anytime</li>
          <li>• Each phone number can only be assigned to one agent at a time</li>
        </ul>
      </div>

      {/* Configuration Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-3">Review Configuration</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Agent Name:</span>
            <span className="font-medium text-foreground">{watch("name") || "Not set"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">LLM Model:</span>
            <span className="font-medium text-foreground">{watch("llm_model") || "gpt-4o-mini"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Voice:</span>
            <span className="font-medium text-foreground">{watch("voice") || "echo"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Turn Detection:</span>
            <span className="font-medium text-foreground">
              {watch("turn_detection") === "semantic" ? "Semantic (AI)" : "VAD-Based"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Phone Numbers:</span>
            <span className="font-medium text-foreground">
              {selectedPhoneIds.length === 0 ? "None (optional)" : `${selectedPhoneIds.length} selected`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

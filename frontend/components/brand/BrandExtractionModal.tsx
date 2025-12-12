"use client";

import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Chip,
  Divider,
} from "@heroui/react";
import { Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface ExtractedBrandData {
  brand_voice?: string;
  tone_guidelines?: string;
  target_audience?: string;
  brand_personality?: string;
  key_products?: string[];
  key_services?: string[];
  company_values?: string[];
}

interface BrandExtractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  extractedData: ExtractedBrandData | null;
}

/**
 * Brand Extraction Confirmation Modal
 * Shows extracted brand data and explains how it will be used
 */
export function BrandExtractionModal({
  isOpen,
  onClose,
  extractedData,
}: BrandExtractionModalProps) {
  if (!extractedData) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      scrollBehavior="inside"
      classNames={{
        base: "bg-white dark:bg-gray-900",
        header: "border-b border-gray-200 dark:border-gray-800",
        body: "py-6",
        footer: "border-t border-gray-200 dark:border-gray-800",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Brand Voice Extracted!
              </h2>
              <p className="text-sm font-normal text-gray-600 dark:text-gray-400">
                Your brand identity has been successfully imported
              </p>
            </div>
          </div>
        </ModalHeader>

        <ModalBody>
          {/* Success Message */}
          <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-success-600 dark:text-success-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-success-900 dark:text-success-200 mb-1">
                  Account Branded Successfully
                </h3>
                <p className="text-sm text-success-800 dark:text-success-300">
                  All AI agents will now use this brand voice and tone in their
                  conversations. Your brand identity is active across the entire
                  platform.
                </p>
              </div>
            </div>
          </div>

          <Divider className="my-4" />

          {/* Extracted Data Display */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              What We Found:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extractedData.brand_voice && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand Voice
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {extractedData.brand_voice}
                  </p>
                </div>
              )}

              {extractedData.tone_guidelines && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tone Guidelines
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {extractedData.tone_guidelines}
                  </p>
                </div>
              )}

              {extractedData.target_audience && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Audience
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {extractedData.target_audience}
                  </p>
                </div>
              )}

              {extractedData.brand_personality && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand Personality
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {extractedData.brand_personality}
                  </p>
                </div>
              )}
            </div>

            {/* Products/Services/Values as chips */}
            {extractedData.key_products &&
              extractedData.key_products.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Key Products
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.key_products.map((product, idx) => (
                      <Chip key={idx} size="sm" variant="flat">
                        {product}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

            {extractedData.key_services &&
              extractedData.key_services.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Key Services
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.key_services.map((service, idx) => (
                      <Chip key={idx} size="sm" variant="flat">
                        {service}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

            {extractedData.company_values &&
              extractedData.company_values.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Company Values
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {extractedData.company_values.map((value, idx) => (
                      <Chip key={idx} size="sm" variant="flat" color="primary">
                        {value}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
          </div>

          <Divider className="my-4" />

          {/* How It Will Be Used */}
          <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ArrowRight className="h-5 w-5 text-primary-600 dark:text-primary-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-primary-900 dark:text-primary-200 mb-2">
                  How This Will Be Used:
                </h3>
                <ul className="space-y-2 text-sm text-primary-800 dark:text-primary-300">
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 dark:text-primary-400 mt-0.5">
                      •
                    </span>
                    <span>
                      <strong>AI Agents:</strong> All agents will speak in your
                      brand voice and follow your tone guidelines
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 dark:text-primary-400 mt-0.5">
                      •
                    </span>
                    <span>
                      <strong>Personas:</strong> New personas will automatically
                      inherit this brand identity
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 dark:text-primary-400 mt-0.5">
                      •
                    </span>
                    <span>
                      <strong>Consistency:</strong> Every customer interaction
                      will maintain your brand's unique personality
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary-600 dark:text-primary-400 mt-0.5">
                      •
                    </span>
                    <span>
                      <strong>Updates:</strong> You can refine or override these
                      settings anytime in Brand Profile
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button color="primary" onPress={onClose} className="w-full sm:w-auto">
            Got It!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

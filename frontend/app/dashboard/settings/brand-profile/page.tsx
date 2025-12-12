"use client";

import { useState } from "react";
import {
  Input,
  Textarea,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Chip,
  Spinner,
} from "@heroui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useBrandProfile } from "@/lib/hooks/use-brand-profile";
import {
  brandProfileUpdateSchema,
  BrandProfileUpdate,
} from "@/lib/schemas/brand-profile-schema";
import Link from "next/link";
import { BrandExtractionModal } from "@/components/brand/BrandExtractionModal";

/**
 * Brand Profile Settings Page
 * Manage company identity and brand voice
 *
 * Features:
 * - Company info (name, industry, logo)
 * - Social media links
 * - AI extraction from social media
 * - Display extracted brand data
 * - Manual overrides
 * - Do's and Don'ts management
 */
function BrandProfileContent() {
  const {
    brandProfile,
    isLoading,
    error,
    refetch,
    updateBrandProfile,
    extractFromSocial,
    isExtracting,
  } = useBrandProfile();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showExtractionModal, setShowExtractionModal] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    getValues,
  } = useForm<BrandProfileUpdate>({
    resolver: zodResolver(brandProfileUpdateSchema),
    values: brandProfile
      ? {
          companyName: brandProfile.companyName || "",
          industry: brandProfile.industry || "",
          logoUrl: brandProfile.logoUrl || "",
          facebookUrl: brandProfile.facebookUrl || "",
          instagramUrl: brandProfile.instagramUrl || "",
          linkedinUrl: brandProfile.linkedinUrl || "",
          twitterUrl: brandProfile.twitterUrl || "",
          websiteUrl: brandProfile.websiteUrl || "",
          customBrandVoice: brandProfile.customBrandVoice || "",
          customToneGuidelines: brandProfile.customToneGuidelines || "",
        }
      : {
          companyName: "",
          industry: "",
          logoUrl: "",
          facebookUrl: "",
          instagramUrl: "",
          linkedinUrl: "",
          twitterUrl: "",
          websiteUrl: "",
          customBrandVoice: "",
          customToneGuidelines: "",
        },
  });

  /**
   * Handle form submission
   */
  const onSubmit = async (data: BrandProfileUpdate) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await updateBrandProfile(data);

      toast.success("Brand profile updated successfully", {
        description: "Your changes have been saved",
      });

      await refetch();
    } catch (error: any) {
      const errorMessage = error.message || "Failed to update brand profile";
      setSubmitError(errorMessage);

      toast.error("Failed to update brand profile", {
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle social media extraction
   */
  const handleExtract = async () => {
    const values = getValues();
    const urls: any = {};

    if (values.facebookUrl) urls.facebook = values.facebookUrl;
    if (values.instagramUrl) urls.instagram = values.instagramUrl;
    if (values.websiteUrl) urls.website = values.websiteUrl;

    if (Object.keys(urls).length === 0) {
      toast.error("No URLs provided", {
        description: "Please enter at least one social media URL or website",
      });
      return;
    }

    try {
      const data = await extractFromSocial(urls);

      // Show confirmation modal with extracted data
      setExtractedData(data);
      setShowExtractionModal(true);
    } catch (error: any) {
      toast.error("Failed to extract brand data", {
        description: error.message,
      });
    }
  };

  /**
   * Retry submission after error
   */
  const handleRetry = () => {
    setSubmitError(null);
    handleSubmit(onSubmit)();
  };

  // Loading state with skeleton loaders
  if (isLoading) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="w-48 h-8 mb-2" />
          <Skeleton className="w-96 h-4 mb-4" />
          <Skeleton className="w-32 h-6" />
        </div>

        {/* Form Skeleton */}
        <div className="space-y-6">
          <Card>
            <CardBody className="space-y-4">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </CardBody>
          </Card>
          <Card>
            <CardBody className="space-y-4">
              <Skeleton className="w-full h-10" />
              <Skeleton className="w-full h-10" />
            </CardBody>
          </Card>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error) {
    return (
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-6">
          <div className="flex items-start">
            <svg
              className="h-6 w-6 text-danger-500 mt-0.5 mr-3"
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
              <h3 className="font-semibold text-danger-900 dark:text-danger-200 mb-1">
                Failed to Load Brand Profile
              </h3>
              <p className="text-sm text-danger-800 dark:text-danger-300 mb-4">
                {error.message}
              </p>
              <Button color="danger" variant="flat" onPress={refetch}>
                Retry
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasExtractedData = brandProfile?.brandData;

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Link
            href="/dashboard/settings"
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Settings
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white">Brand Profile</span>
        </div>
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary-600 via-purple-600 to-pink-600 dark:from-primary-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          Brand Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Define your company identity and brand voice for all AI agents
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Company Information
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Basic information about your company
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <Input
              {...register("companyName")}
              label="Company Name"
              labelPlacement="outside"
              placeholder="Enter your company name"
              isRequired
              isInvalid={!!errors.companyName}
              errorMessage={errors.companyName?.message}
              classNames={{
                label:
                  "text-sm font-medium text-gray-700 dark:text-gray-300",
              }}
            />

            <Input
              {...register("industry")}
              label="Industry"
              labelPlacement="outside"
              placeholder="e.g., Technology, Healthcare, Retail"
              isInvalid={!!errors.industry}
              errorMessage={errors.industry?.message}
              classNames={{
                label:
                  "text-sm font-medium text-gray-700 dark:text-gray-300",
              }}
            />

            <Input
              {...register("logoUrl")}
              label="Logo URL"
              labelPlacement="outside"
              placeholder="https://example.com/logo.png"
              isInvalid={!!errors.logoUrl}
              errorMessage={errors.logoUrl?.message}
              classNames={{
                label:
                  "text-sm font-medium text-gray-700 dark:text-gray-300",
              }}
            />
          </CardBody>
        </Card>

        {/* Social Media Links */}
        <Card>
          <CardHeader>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Social Media Links
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Provide your social media URLs to extract brand voice using AI
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <Input
              {...register("websiteUrl")}
              label="Website"
              labelPlacement="outside"
              placeholder="https://example.com"
              isInvalid={!!errors.websiteUrl}
              errorMessage={errors.websiteUrl?.message}
              startContent={
                <span className="text-gray-500 text-sm">🌐</span>
              }
              classNames={{
                label:
                  "text-sm font-medium text-gray-700 dark:text-gray-300",
              }}
            />

            <Input
              {...register("facebookUrl")}
              label="Facebook"
              labelPlacement="outside"
              placeholder="https://facebook.com/company"
              isInvalid={!!errors.facebookUrl}
              errorMessage={errors.facebookUrl?.message}
              startContent={
                <span className="text-gray-500 text-sm">📘</span>
              }
              classNames={{
                label:
                  "text-sm font-medium text-gray-700 dark:text-gray-300",
              }}
            />

            <div className="relative">
              <Input
                {...register("instagramUrl")}
                label={
                  <div className="flex items-center gap-2">
                    <span>Instagram</span>
                    <Chip size="sm" color="warning" variant="flat">
                      Coming Soon
                    </Chip>
                  </div>
                }
                labelPlacement="outside"
                placeholder="https://instagram.com/company"
                isInvalid={!!errors.instagramUrl}
                errorMessage={errors.instagramUrl?.message}
                isDisabled
                startContent={
                  <span className="text-gray-500 text-sm">📸</span>
                }
                classNames={{
                  label:
                    "text-sm font-medium text-gray-700 dark:text-gray-300",
                }}
              />
            </div>

            <div className="relative">
              <Input
                {...register("linkedinUrl")}
                label={
                  <div className="flex items-center gap-2">
                    <span>LinkedIn</span>
                    <Chip size="sm" color="warning" variant="flat">
                      Coming Soon
                    </Chip>
                  </div>
                }
                labelPlacement="outside"
                placeholder="https://linkedin.com/company/company"
                isInvalid={!!errors.linkedinUrl}
                errorMessage={errors.linkedinUrl?.message}
                isDisabled
                startContent={
                  <span className="text-gray-500 text-sm">💼</span>
                }
                classNames={{
                  label:
                    "text-sm font-medium text-gray-700 dark:text-gray-300",
                }}
              />
            </div>

            <div className="relative">
              <Input
                {...register("twitterUrl")}
                label={
                  <div className="flex items-center gap-2">
                    <span>Twitter / X</span>
                    <Chip size="sm" color="warning" variant="flat">
                      Coming Soon
                    </Chip>
                  </div>
                }
                labelPlacement="outside"
                placeholder="https://twitter.com/company"
                isInvalid={!!errors.twitterUrl}
                errorMessage={errors.twitterUrl?.message}
                isDisabled
                startContent={
                  <span className="text-gray-500 text-sm">🐦</span>
                }
                classNames={{
                  label:
                    "text-sm font-medium text-gray-700 dark:text-gray-300",
                }}
              />
            </div>

            <div className="pt-4">
              <Button
                color="secondary"
                variant="flat"
                onPress={handleExtract}
                isLoading={isExtracting}
                startContent={
                  !isExtracting && (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  )
                }
              >
                {isExtracting
                  ? "Extracting Brand Data..."
                  : "Extract Brand Voice from Social Media"}
              </Button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                AI will analyze your social media presence to extract brand
                voice, tone, and key information
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Extracted Brand Data (Read-only Display) */}
        {hasExtractedData && (
          <Card>
            <CardHeader>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    AI-Extracted Brand Data
                  </h2>
                  <Chip size="sm" color="success" variant="flat">
                    Extracted
                  </Chip>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Brand voice and tone automatically extracted from your social
                  media
                </p>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brandProfile.brandData?.brand_voice && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Brand Voice
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {brandProfile.brandData.brand_voice}
                    </p>
                  </div>
                )}

                {brandProfile.brandData?.tone_guidelines && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tone Guidelines
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {brandProfile.brandData.tone_guidelines}
                    </p>
                  </div>
                )}

                {brandProfile.brandData?.target_audience && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target Audience
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {brandProfile.brandData.target_audience}
                    </p>
                  </div>
                )}

                {brandProfile.brandData?.brand_personality && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Brand Personality
                    </p>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {brandProfile.brandData.brand_personality}
                    </p>
                  </div>
                )}
              </div>

              {brandProfile.brandData?.key_products &&
                brandProfile.brandData.key_products.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Key Products
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {brandProfile.brandData.key_products.map(
                        (product, idx) => (
                          <Chip key={idx} size="sm" variant="flat">
                            {product}
                          </Chip>
                        )
                      )}
                    </div>
                  </div>
                )}

              {brandProfile.brandData?.key_services &&
                brandProfile.brandData.key_services.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Key Services
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {brandProfile.brandData.key_services.map(
                        (service, idx) => (
                          <Chip key={idx} size="sm" variant="flat">
                            {service}
                          </Chip>
                        )
                      )}
                    </div>
                  </div>
                )}

              {brandProfile.brandData?.company_values &&
                brandProfile.brandData.company_values.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Company Values
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {brandProfile.brandData.company_values.map(
                        (value, idx) => (
                          <Chip key={idx} size="sm" variant="flat" color="primary">
                            {value}
                          </Chip>
                        )
                      )}
                    </div>
                  </div>
                )}

              {brandProfile.lastExtractionAt && (
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-2">
                  Last extracted:{" "}
                  {new Date(brandProfile.lastExtractionAt).toLocaleString()}
                </p>
              )}
            </CardBody>
          </Card>
        )}

        {/* Manual Overrides */}
        <Card>
          <CardHeader>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manual Overrides
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Customize brand voice and tone guidelines manually
              </p>
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="space-y-4">
            <Textarea
              {...register("customBrandVoice")}
              label="Custom Brand Voice"
              labelPlacement="outside"
              placeholder="e.g., Professional yet approachable, technical but accessible"
              description="Override the AI-extracted brand voice with your own"
              minRows={2}
              classNames={{
                label:
                  "text-sm font-medium text-gray-700 dark:text-gray-300",
              }}
            />

            <Textarea
              {...register("customToneGuidelines")}
              label="Custom Tone Guidelines"
              labelPlacement="outside"
              placeholder="e.g., Warm, empathetic, solution-focused"
              description="Define specific tone guidelines for all agents"
              minRows={2}
              classNames={{
                label:
                  "text-sm font-medium text-gray-700 dark:text-gray-300",
              }}
            />
          </CardBody>
        </Card>

        {/* Error Message */}
        {submitError && (
          <div className="p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-danger-500 mt-0.5 mr-3"
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
                <h3 className="font-semibold text-danger-900 dark:text-danger-200">
                  Error Saving Changes
                </h3>
                <p className="text-sm text-danger-800 dark:text-danger-300 mt-1">
                  {submitError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="flat"
            onPress={() => reset()}
            isDisabled={isSubmitting}
          >
            Reset Changes
          </Button>

          <div className="flex gap-3">
            {submitError && (
              <Button
                color="warning"
                variant="bordered"
                onPress={handleRetry}
                isLoading={isSubmitting}
                isDisabled={isSubmitting}
              >
                Retry
              </Button>
            )}

            <Button
              color="primary"
              type="submit"
              isLoading={isSubmitting}
              isDisabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Brand Profile"}
            </Button>
          </div>
        </div>
      </form>

      {/* Info Box */}
      <Card className="mt-6">
        <CardBody>
          <div className="flex items-start gap-3">
            <svg
              className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                About Brand Profile
              </p>
              <p>
                Your brand profile is automatically inherited by all AI agents.
                When you update your brand voice or tone guidelines, all agents
                will use the new configuration. This ensures consistent brand
                representation across all customer interactions.
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Brand Extraction Confirmation Modal */}
      <BrandExtractionModal
        isOpen={showExtractionModal}
        onClose={() => setShowExtractionModal(false)}
        extractedData={extractedData}
      />
    </div>
  );
}

/**
 * Brand Profile Page with Error Boundary
 */
export default function BrandProfilePage() {
  return (
    <ErrorBoundary>
      <BrandProfileContent />
    </ErrorBoundary>
  );
}

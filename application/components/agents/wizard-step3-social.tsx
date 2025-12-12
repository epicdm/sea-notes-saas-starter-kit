"use client";

import { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Card, CardBody, Button, Input, Spinner } from "@heroui/react";
import { AgentCreate } from "@/types/agent";
import { Facebook, Instagram, Globe, Sparkles, AlertCircle } from "lucide-react";
import { toast } from "sonner";

/**
 * Wizard Step 3: Social Media Integration (Optional)
 * Auto-fill persona details from Facebook, Instagram, Website
 */
export function WizardStep3Social() {
  const {
    control,
    formState: { errors },
    setValue,
    watch,
  } = useFormContext<AgentCreate>();

  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);

  const instructions = watch("instructions") || "";

  const handleExtractFromSocial = async (url: string, platform: "facebook" | "instagram" | "website") => {
    if (!url) {
      toast.error("Please enter a URL first");
      return;
    }

    setIsExtracting(true);

    try {
      // TODO: Call backend API to extract social media data
      // This would use web scraping or official APIs
      const response = await fetch("/api/social-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, platform }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract data");
      }

      const data = await response.json();

      // Auto-fill instructions with extracted data
      const currentInstructions = watch("instructions") || "";
      const enhancedInstructions = `${currentInstructions}\n\n${data.suggested_instructions}`;

      setValue("instructions", enhancedInstructions);
      setValue("social_media_data", data);

      setExtractionComplete(true);
      toast.success(`Successfully extracted data from ${platform}!`);
    } catch (error) {
      console.error("Social extraction error:", error);
      toast.error("Could not extract data. You can still continue manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSkip = () => {
    toast.info("Skipping social media integration - you can configure manually");
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles className="w-8 h-8 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">AI-Powered Persona Creation</h2>
        </div>
        <p className="text-lg text-muted-foreground">
          Let AI extract your brand voice and customer insights from social media
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          (Optional - Skip if you prefer to configure manually)
        </p>
      </div>

      {/* Social Media Input Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {/* Facebook */}
        <Card className="border border-border">
          <CardBody className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Facebook className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Facebook</h3>
                <p className="text-xs text-muted-foreground">Business Page</p>
              </div>
            </div>

            <Controller
              name="facebook_url"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="url"
                  placeholder="https://facebook.com/your-page"
                  size="sm"
                  classNames={{
                    input: "text-sm",
                  }}
                />
              )}
            />

            <Button
              size="sm"
              color="primary"
              variant="flat"
              className="w-full mt-3"
              isLoading={isExtracting}
              onPress={() => handleExtractFromSocial(watch("facebook_url") || "", "facebook")}
            >
              Extract Data
            </Button>
          </CardBody>
        </Card>

        {/* Instagram */}
        <Card className="border border-border">
          <CardBody className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center">
                <Instagram className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Instagram</h3>
                <p className="text-xs text-muted-foreground">Business Profile</p>
              </div>
            </div>

            <Controller
              name="instagram_url"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="url"
                  placeholder="https://instagram.com/your-profile"
                  size="sm"
                  classNames={{
                    input: "text-sm",
                  }}
                />
              )}
            />

            <Button
              size="sm"
              color="primary"
              variant="flat"
              className="w-full mt-3"
              isLoading={isExtracting}
              onPress={() => handleExtractFromSocial(watch("instagram_url") || "", "instagram")}
            >
              Extract Data
            </Button>
          </CardBody>
        </Card>

        {/* Website */}
        <Card className="border border-border">
          <CardBody className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Globe className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Website</h3>
                <p className="text-xs text-muted-foreground">Your Website</p>
              </div>
            </div>

            <Controller
              name="website_url"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="url"
                  placeholder="https://yourwebsite.com"
                  size="sm"
                  classNames={{
                    input: "text-sm",
                  }}
                />
              )}
            />

            <Button
              size="sm"
              color="primary"
              variant="flat"
              className="w-full mt-3"
              isLoading={isExtracting}
              onPress={() => handleExtractFromSocial(watch("website_url") || "", "website")}
            >
              Extract Data
            </Button>
          </CardBody>
        </Card>
      </div>

      {/* Extraction Status */}
      {isExtracting && (
        <Card className="border-2 border-primary/30 bg-primary/5">
          <CardBody className="p-6">
            <div className="flex items-center gap-4">
              <Spinner size="lg" color="primary" />
              <div>
                <h4 className="font-semibold text-foreground mb-1">Extracting Brand Intelligence...</h4>
                <p className="text-sm text-muted-foreground">
                  AI is analyzing your content, brand voice, and customer interactions
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {extractionComplete && (
        <Card className="border-2 border-green-500/30 bg-green-50 dark:bg-green-950/20">
          <CardBody className="p-6">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-200 mb-2">
                  ✅ Persona Enhanced with AI Insights!
                </h4>
                <p className="text-sm text-green-800 dark:text-green-300">
                  Your agent's instructions have been enriched with your brand voice, target audience insights, and key messaging.
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* What We Extract */}
      <Card className="bg-gray-50 dark:bg-gray-900/50 border border-border">
        <CardBody className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground mb-3">What AI Extracts:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium text-foreground mb-1">From Social Media:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Brand voice and tone</li>
                    <li>• Target audience</li>
                    <li>• Common customer questions</li>
                    <li>• Key products/services</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium text-foreground mb-1">From Website:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Business description</li>
                    <li>• Company values</li>
                    <li>• Product/service details</li>
                    <li>• Contact information</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Skip Option */}
      <div className="text-center pt-4">
        <Button
          variant="light"
          color="default"
          onPress={handleSkip}
          className="text-muted-foreground"
        >
          Skip this step - I'll configure manually
        </Button>
      </div>
    </div>
  );
}

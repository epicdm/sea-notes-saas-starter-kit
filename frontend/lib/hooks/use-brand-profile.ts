/**
 * Brand Profile Hook
 * Manages brand profile data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { api, isApiError } from "@/lib/api-client";
import type { BrandProfile } from "@/types/brand-profile";

interface UseBrandProfileReturn {
  brandProfile: BrandProfile | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateBrandProfile: (data: Partial<BrandProfile>) => Promise<void>;
  extractFromSocial: (urls: {
    facebook?: string;
    instagram?: string;
    website?: string;
  }) => Promise<void>;
  isExtracting: boolean;
}

/**
 * Hook to manage brand profile data
 */
export function useBrandProfile(): UseBrandProfileReturn {
  const [brandProfile, setBrandProfile] = useState<BrandProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch brand profile
   */
  const fetchBrandProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // api-client already extracts data.data, so response is BrandProfile | null
      const response = await api.get<BrandProfile | null>(
        "/api/user/brand-profile"
      );

      setBrandProfile(response);
    } catch (err) {
      const errorMessage = isApiError(err)
        ? err.message
        : "Failed to load brand profile";
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update brand profile
   */
  const updateBrandProfile = useCallback(
    async (data: Partial<BrandProfile>) => {
      try {
        if (!brandProfile) {
          // Create new brand profile
          // api-client already extracts data.data
          const response = await api.post<BrandProfile>(
            "/api/user/brand-profile",
            data
          );

          setBrandProfile(response);
        } else {
          // Update existing brand profile
          // api-client already extracts data.data
          const response = await api.put<BrandProfile>(
            "/api/user/brand-profile",
            data
          );

          setBrandProfile(response);
        }
      } catch (err) {
        const errorMessage = isApiError(err)
          ? err.message
          : "Failed to update brand profile";
        throw new Error(errorMessage);
      }
    },
    [brandProfile]
  );

  /**
   * Extract brand data from social media
   */
  const extractFromSocial = useCallback(
    async (urls: {
      facebook?: string;
      instagram?: string;
      website?: string;
    }) => {
      try {
        setIsExtracting(true);

        const response = await api.post<{
          success: boolean;
          extracted_data: any;
          message: string;
        }>("/api/user/brand-profile/extract", { urls });

        // Refresh brand profile to get updated data
        await fetchBrandProfile();

        // Return extracted data for confirmation modal
        return response.extracted_data;
      } catch (err) {
        const errorMessage = isApiError(err)
          ? err.message
          : "Failed to extract brand data";
        throw new Error(errorMessage);
      } finally {
        setIsExtracting(false);
      }
    },
    [fetchBrandProfile]
  );

  /**
   * Refetch brand profile
   */
  const refetch = useCallback(async () => {
    await fetchBrandProfile();
  }, [fetchBrandProfile]);

  // Initial fetch
  useEffect(() => {
    fetchBrandProfile();
  }, [fetchBrandProfile]);

  return {
    brandProfile,
    isLoading,
    error,
    refetch,
    updateBrandProfile,
    extractFromSocial,
    isExtracting,
  };
}

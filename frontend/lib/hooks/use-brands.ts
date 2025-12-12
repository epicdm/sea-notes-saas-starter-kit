/**
 * Brands Hook - Multi-client brand management for agencies
 * This is different from use-brand-profile.ts which is for single-brand SMB users
 */

import { useState, useEffect, useCallback } from "react";
import { api, isApiError } from "@/lib/api-client";
import type { BrandProfile, BrandProfileCreate, BrandProfileUpdate } from "@/types/brand-profile";

interface UseBrandsReturn {
  brands: BrandProfile[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createBrand: (data: BrandProfileCreate) => Promise<BrandProfile>;
  updateBrand: (id: string, data: BrandProfileUpdate) => Promise<BrandProfile>;
  deleteBrand: (id: string) => Promise<void>;
  cloneBrand: (id: string, newName: string, clonePersonas?: boolean) => Promise<BrandProfile>;
}

/**
 * Hook to manage multiple brands (for agencies)
 * If you need single brand management (SMB users), use useBrandProfile instead
 */
export function useBrands(): UseBrandsReturn {
  const [brands, setBrands] = useState<BrandProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch all brands for this agency
   */
  const fetchBrands = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.get<BrandProfile[]>("/api/brands");
      setBrands(response || []);
    } catch (err) {
      const errorMessage = isApiError(err)
        ? err.message
        : "Failed to load brands";
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new brand
   */
  const createBrand = useCallback(
    async (data: BrandProfileCreate): Promise<BrandProfile> => {
      try {
        const response = await api.post<BrandProfile>("/api/brands", data);

        // Add to local state
        setBrands(prev => [...prev, response]);

        return response;
      } catch (err) {
        const errorMessage = isApiError(err)
          ? err.message
          : "Failed to create brand";
        throw new Error(errorMessage);
      }
    },
    []
  );

  /**
   * Update existing brand
   */
  const updateBrand = useCallback(
    async (id: string, data: BrandProfileUpdate): Promise<BrandProfile> => {
      try {
        const response = await api.put<BrandProfile>(`/api/brands/${id}`, data);

        // Update in local state
        setBrands(prev =>
          prev.map(brand => (brand.id === id ? response : brand))
        );

        return response;
      } catch (err) {
        const errorMessage = isApiError(err)
          ? err.message
          : "Failed to update brand";
        throw new Error(errorMessage);
      }
    },
    []
  );

  /**
   * Delete brand
   */
  const deleteBrand = useCallback(async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/brands/${id}`);

      // Remove from local state
      setBrands(prev => prev.filter(brand => brand.id !== id));
    } catch (err) {
      const errorMessage = isApiError(err)
        ? err.message
        : "Failed to delete brand";
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Clone brand (30-second setup)
   * @param id - Brand ID to clone
   * @param newName - New name for the cloned brand
   * @param clonePersonas - Whether to also clone personas (default: false)
   */
  const cloneBrand = useCallback(
    async (id: string, newName: string, clonePersonas = false): Promise<BrandProfile> => {
      try {
        const response = await api.post<BrandProfile>(`/api/brands/${id}/clone`, {
          company_name: newName,
          clone_personas: clonePersonas,
        });

        // Add to local state
        setBrands(prev => [...prev, response]);

        return response;
      } catch (err) {
        const errorMessage = isApiError(err)
          ? err.message
          : "Failed to clone brand";
        throw new Error(errorMessage);
      }
    },
    []
  );

  /**
   * Refetch brands
   */
  const refetch = useCallback(async () => {
    await fetchBrands();
  }, [fetchBrands]);

  // Initial fetch
  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    isLoading,
    error,
    refetch,
    createBrand,
    updateBrand,
    deleteBrand,
    cloneBrand,
  };
}

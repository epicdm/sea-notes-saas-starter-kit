/**
 * Persona Library Hook
 * Manages persona data and operations
 */

import { useState, useEffect, useCallback } from "react";
import { api, isApiError } from "@/lib/api-client";
import type { Persona, PersonaTemplate } from "@/types/persona";

interface UsePersonasReturn {
  personas: Persona[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createPersona: (data: Partial<Persona>) => Promise<Persona>;
  updatePersona: (id: string, data: Partial<Persona>) => Promise<Persona>;
  deletePersona: (id: string) => Promise<void>;
  createFromTemplate: (
    templateId: string,
    customName?: string,
    customizations?: Partial<Persona>
  ) => Promise<Persona>;
  getPersonaById: (id: string) => Promise<Persona>;
  fetchSystemTemplates: () => Promise<PersonaTemplate[]>;
}

interface UsePersonasOptions {
  includeTemplates?: boolean;
  type?: string;
}

/**
 * Hook to manage persona library
 */
export function usePersonas(
  options: UsePersonasOptions = {}
): UsePersonasReturn {
  const { includeTemplates = true, type } = options;
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetch personas
   */
  const fetchPersonas = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (includeTemplates !== undefined) {
        params.append("include_templates", includeTemplates.toString());
      }
      if (type) {
        params.append("type", type);
      }

      // api-client already extracts data.data, so response is Persona[]
      const response = await api.get<Persona[]>(
        `/api/user/personas?${params.toString()}`
      );

      setPersonas(response);
    } catch (err) {
      const errorMessage = isApiError(err)
        ? err.message
        : "Failed to load personas";
      setError(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [includeTemplates, type]);

  /**
   * Create new persona
   */
  const createPersona = useCallback(
    async (data: Partial<Persona>): Promise<Persona> => {
      try {
        // api-client already extracts data.data
        const response = await api.post<Persona>("/api/user/personas", data);

        // Refresh the list
        await fetchPersonas();

        return response;
      } catch (err) {
        const errorMessage = isApiError(err)
          ? err.message
          : "Failed to create persona";
        throw new Error(errorMessage);
      }
    },
    [fetchPersonas]
  );

  /**
   * Update existing persona
   */
  const updatePersona = useCallback(
    async (id: string, data: Partial<Persona>): Promise<Persona> => {
      try {
        // api-client already extracts data.data
        const response = await api.put<Persona>(
          `/api/user/personas/${id}`,
          data
        );

        // Refresh the list
        await fetchPersonas();

        return response;
      } catch (err) {
        const errorMessage = isApiError(err)
          ? err.message
          : "Failed to update persona";
        throw new Error(errorMessage);
      }
    },
    [fetchPersonas]
  );

  /**
   * Delete persona
   */
  const deletePersona = useCallback(
    async (id: string): Promise<void> => {
      try {
        await api.delete<{
          success: boolean;
          message: string;
        }>(`/api/user/personas/${id}`);

        // Refresh the list
        await fetchPersonas();
      } catch (err) {
        const errorMessage = isApiError(err)
          ? err.message
          : "Failed to delete persona";
        throw new Error(errorMessage);
      }
    },
    [fetchPersonas]
  );

  /**
   * Create persona from template
   */
  const createFromTemplate = useCallback(
    async (
      templateId: string,
      customName?: string,
      customizations?: Partial<Persona>
    ): Promise<Persona> => {
      try {
        // api-client already extracts data.data
        const response = await api.post<Persona>(
          "/api/user/personas/from-template",
          {
            templateId,
            customName,
            customizations,
          }
        );

        // Refresh the list
        await fetchPersonas();

        return response;
      } catch (err) {
        const errorMessage = isApiError(err)
          ? err.message
          : "Failed to create persona from template";
        throw new Error(errorMessage);
      }
    },
    [fetchPersonas]
  );

  /**
   * Get single persona by ID
   */
  const getPersonaById = useCallback(async (id: string): Promise<Persona> => {
    try {
      // api-client already extracts data.data
      const response = await api.get<Persona>(`/api/user/personas/${id}`);

      return response;
    } catch (err) {
      const errorMessage = isApiError(err)
        ? err.message
        : "Failed to load persona";
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Fetch system persona templates
   */
  const fetchSystemTemplates = useCallback(async (): Promise<PersonaTemplate[]> => {
    try {
      // api-client already extracts data.data
      const response = await api.get<PersonaTemplate[]>("/api/system/persona-templates");

      return response;
    } catch (err) {
      const errorMessage = isApiError(err)
        ? err.message
        : "Failed to load persona templates";
      throw new Error(errorMessage);
    }
  }, []);

  /**
   * Refetch personas
   */
  const refetch = useCallback(async () => {
    await fetchPersonas();
  }, [fetchPersonas]);

  // Initial fetch
  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  return {
    personas,
    isLoading,
    error,
    refetch,
    createPersona,
    updatePersona,
    deletePersona,
    createFromTemplate,
    getPersonaById,
    fetchSystemTemplates,
  };
}

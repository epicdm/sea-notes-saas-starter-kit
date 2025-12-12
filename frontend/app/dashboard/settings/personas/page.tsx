"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Plus, Sparkles, Search, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { usePersonas } from "@/lib/hooks/use-personas";
import { PersonaCard, PersonaCardSkeleton } from "@/components/personas/persona-card";
import { TemplateGalleryModal } from "@/components/personas/template-gallery-modal";
import { PersonaFormModal } from "@/components/personas/persona-form-modal";
import {
  personaTypes,
  personaCapabilities,
  personaTypeLabels,
  capabilityLabels,
  type PersonaType,
  type PersonaCapability,
  type CreatePersonaForm,
  type UpdatePersonaForm,
} from "@/lib/schemas/persona-schema";
import type { Persona, PersonaTemplate } from "@/types/persona";
import { canDeletePersona } from "@/types/persona";

function PersonasPageContent() {
  const {
    personas,
    isLoading,
    error,
    createPersona,
    updatePersona,
    deletePersona,
    refetch,
  } = usePersonas();

  // Modal states
  const templateModal = useDisclosure();
  const createModal = useDisclosure();
  const editModal = useDisclosure();
  const deleteModal = useDisclosure();

  // Selected items
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<PersonaTemplate | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<PersonaType | "all">("all");
  const [capabilityFilter, setCapabilityFilter] = useState<PersonaCapability | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<"all" | "system" | "custom">("all");

  // Filter personas
  const filteredPersonas = personas.filter((persona) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = persona.name.toLowerCase().includes(query);
      const matchesDescription = persona.description?.toLowerCase().includes(query);
      const matchesType = persona.type.toLowerCase().includes(query);
      if (!matchesName && !matchesDescription && !matchesType) {
        return false;
      }
    }

    // Type filter
    if (typeFilter !== "all" && persona.type !== typeFilter) {
      return false;
    }

    // Capability filter
    if (
      capabilityFilter !== "all" &&
      !(persona.capabilities as string[]).includes(capabilityFilter)
    ) {
      return false;
    }

    // Source filter
    if (sourceFilter === "system" && !persona.isSystem) {
      return false;
    }
    if (sourceFilter === "custom" && persona.isSystem) {
      return false;
    }

    return true;
  });

  // Separate system and custom personas
  const systemPersonas = filteredPersonas.filter((p) => p.isSystem);
  const customPersonas = filteredPersonas.filter((p) => !p.isSystem);

  // Handlers
  const handleCreatePersona = async (data: CreatePersonaForm) => {
    await createPersona(data);
  };

  const handleUpdatePersona = async (data: UpdatePersonaForm) => {
    if (!selectedPersona) return;
    await updatePersona(selectedPersona.id, data as Partial<Persona>);
  };

  const handleDeletePersona = async () => {
    if (!selectedPersona) return;

    try {
      await deletePersona(selectedPersona.id);
      toast.success("Persona deleted successfully");
      deleteModal.onClose();
      setSelectedPersona(null);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete persona"
      );
    }
  };

  const handleSelectTemplate = (template: PersonaTemplate) => {
    setSelectedTemplate(template);
    createModal.onOpen();
  };

  const handleEditPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    editModal.onOpen();
  };

  const handleDeleteClick = (persona: Persona) => {
    setSelectedPersona(persona);
    deleteModal.onOpen();
  };

  const handleCreateModalClose = () => {
    createModal.onClose();
    setSelectedTemplate(null);
  };

  const handleEditModalClose = () => {
    editModal.onClose();
    setSelectedPersona(null);
  };

  // Error state
  if (error && !isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Card className="max-w-md">
          <CardBody className="text-center space-y-4">
            <AlertCircle className="h-12 w-12 text-danger mx-auto" />
            <div>
              <p className="text-lg font-semibold text-danger mb-2">
                Failed to Load Personas
              </p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
            <Button
              color="primary"
              variant="flat"
              onPress={() => refetch()}
              startContent={<RefreshCw className="h-4 w-4" />}
            >
              Retry
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Persona Library
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage multi-channel AI personalities for your agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            color="secondary"
            variant="flat"
            onPress={templateModal.onOpen}
            startContent={<Sparkles className="h-4 w-4" />}
          >
            Browse Templates
          </Button>
          <Button
            color="primary"
            onPress={createModal.onOpen}
            startContent={<Plus className="h-4 w-4" />}
          >
            Create Persona
          </Button>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {personas.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Personas</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {systemPersonas.length}
              </p>
              <p className="text-sm text-muted-foreground">System Templates</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {customPersonas.length}
              </p>
              <p className="text-sm text-muted-foreground">Custom Personas</p>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {personas.reduce((sum, p) => sum + (p.agentCount || 0), 0)}
              </p>
              <p className="text-sm text-muted-foreground">Active Agents</p>
            </CardBody>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <Input
              placeholder="Search personas..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={<Search className="h-4 w-4 text-muted-foreground" />}
              isClearable
              onClear={() => setSearchQuery("")}
            />

            {/* Type Filter */}
            <Select
              label="Type"
              placeholder="All Types"
              selectedKeys={typeFilter !== "all" ? [typeFilter] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as PersonaType | "all";
                setTypeFilter(value || "all");
              }}
            >
              <SelectItem key="all">
                All Types
              </SelectItem>
              {personaTypes.map((type) => (
                <SelectItem key={type}>
                  {personaTypeLabels[type]}
                </SelectItem>
              ))}
            </Select>

            {/* Capability Filter */}
            <Select
              label="Capability"
              placeholder="All Channels"
              selectedKeys={
                capabilityFilter !== "all" ? [capabilityFilter] : []
              }
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as PersonaCapability | "all";
                setCapabilityFilter(value || "all");
              }}
            >
              <SelectItem key="all">
                All Channels
              </SelectItem>
              {personaCapabilities.map((capability) => (
                <SelectItem key={capability}>
                  {capabilityLabels[capability]}
                </SelectItem>
              ))}
            </Select>

            {/* Source Filter */}
            <Select
              label="Source"
              placeholder="All Sources"
              selectedKeys={sourceFilter !== "all" ? [sourceFilter] : []}
              onSelectionChange={(keys) => {
                const value = Array.from(keys)[0] as
                  | "all"
                  | "system"
                  | "custom";
                setSourceFilter(value || "all");
              }}
            >
              <SelectItem key="all">
                All Sources
              </SelectItem>
              <SelectItem key="system">
                System Templates
              </SelectItem>
              <SelectItem key="custom">
                Custom Personas
              </SelectItem>
            </Select>
          </div>

          {/* Active Filters */}
          {(searchQuery || typeFilter !== "all" || capabilityFilter !== "all" || sourceFilter !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-muted-foreground">
                Active filters:
              </span>
              {searchQuery && (
                <Chip
                  size="sm"
                  variant="flat"
                  onClose={() => setSearchQuery("")}
                >
                  Search: {searchQuery}
                </Chip>
              )}
              {typeFilter !== "all" && (
                <Chip
                  size="sm"
                  variant="flat"
                  onClose={() => setTypeFilter("all")}
                >
                  Type: {personaTypeLabels[typeFilter]}
                </Chip>
              )}
              {capabilityFilter !== "all" && (
                <Chip
                  size="sm"
                  variant="flat"
                  onClose={() => setCapabilityFilter("all")}
                >
                  Channel: {capabilityLabels[capabilityFilter]}
                </Chip>
              )}
              {sourceFilter !== "all" && (
                <Chip
                  size="sm"
                  variant="flat"
                  onClose={() => setSourceFilter("all")}
                >
                  Source: {sourceFilter}
                </Chip>
              )}
              <Button
                size="sm"
                variant="light"
                onPress={() => {
                  setSearchQuery("");
                  setTypeFilter("all");
                  setCapabilityFilter("all");
                  setSourceFilter("all");
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <PersonaCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPersonas.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <Sparkles className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {personas.length === 0
                ? "No Personas Yet"
                : "No Matching Personas"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {personas.length === 0
                ? "Get started by creating a persona from scratch or using a template"
                : "Try adjusting your filters or search query"}
            </p>
            <div className="flex gap-2 justify-center">
              <Button
                color="secondary"
                variant="flat"
                onPress={templateModal.onOpen}
                startContent={<Sparkles className="h-4 w-4" />}
              >
                Browse Templates
              </Button>
              <Button
                color="primary"
                onPress={createModal.onOpen}
                startContent={<Plus className="h-4 w-4" />}
              >
                Create Persona
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {/* System Templates Section */}
      {!isLoading && systemPersonas.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              System Templates
            </h2>
            <Chip size="sm" variant="flat" color="secondary">
              {systemPersonas.length}
            </Chip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {systemPersonas.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onClick={handleEditPersona}
              />
            ))}
          </div>
        </section>
      )}

      {/* Custom Personas Section */}
      {!isLoading && customPersonas.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">
              Custom Personas
            </h2>
            <Chip size="sm" variant="flat">
              {customPersonas.length}
            </Chip>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customPersonas.map((persona) => (
              <PersonaCard
                key={persona.id}
                persona={persona}
                onEdit={handleEditPersona}
                onDelete={handleDeleteClick}
                onClick={handleEditPersona}
              />
            ))}
          </div>
        </section>
      )}

      {/* Template Gallery Modal */}
      <TemplateGalleryModal
        isOpen={templateModal.isOpen}
        onClose={templateModal.onClose}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Create Persona Modal */}
      <PersonaFormModal
        isOpen={createModal.isOpen}
        onClose={handleCreateModalClose}
        onSubmit={handleCreatePersona}
        template={selectedTemplate}
        mode="create"
      />

      {/* Edit Persona Modal */}
      <PersonaFormModal
        isOpen={editModal.isOpen}
        onClose={handleEditModalClose}
        onSubmit={handleUpdatePersona}
        persona={selectedPersona}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteModal.isOpen} onClose={deleteModal.onClose}>
        <ModalContent>
          <ModalHeader>Delete Persona</ModalHeader>
          <ModalBody>
            {selectedPersona && (
              <div className="space-y-4">
                <p className="text-foreground">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold">{selectedPersona.name}</span>?
                </p>
                {!canDeletePersona(selectedPersona) && (
                  <div className="p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                    <p className="text-sm text-warning-700 dark:text-warning-300">
                      This persona is currently being used by{" "}
                      {selectedPersona.agentCount}{" "}
                      {selectedPersona.agentCount === 1 ? "agent" : "agents"}.
                      You must unassign it from all agents before deleting.
                    </p>
                  </div>
                )}
                {canDeletePersona(selectedPersona) && (
                  <p className="text-sm text-muted-foreground">
                    This action cannot be undone.
                  </p>
                )}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={deleteModal.onClose}>
              Cancel
            </Button>
            <Button
              color="danger"
              onPress={handleDeletePersona}
              isDisabled={
                selectedPersona ? !canDeletePersona(selectedPersona) : true
              }
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

export default function PersonasPage() {
  return (
    <ErrorBoundary>
      <PersonasPageContent />
    </ErrorBoundary>
  );
}

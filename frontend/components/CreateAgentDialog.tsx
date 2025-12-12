import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Agent, createAgent } from "@/utils/api";
import { fetchPersonas, Persona } from "@/utils/api";
import { toast } from "sonner";
import { PhoneIncoming, PhoneOutgoing, Phone, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface CreateAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAgentCreated: (agent: Agent) => void;
  accessToken: string;
}

type AgentType = 'inbound' | 'outbound' | 'hybrid';

export function CreateAgentDialog({ isOpen, onClose, onAgentCreated, accessToken }: CreateAgentDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  
  const [formData, setFormData] = useState({
    // Step 1
    type: 'inbound' as AgentType,
    // Step 2
    personaId: '',
    // Step 3
    name: "",
    description: "",
    voice: "nova",
    model: "gpt-4",
    language: "en-US",
    phoneNumberId: null as string | null,
    temperature: 0.7,
  });

  useEffect(() => {
    if (isOpen) {
      loadPersonas();
    }
  }, [isOpen]);

  const loadPersonas = async () => {
    try {
      setLoadingPersonas(true);
      const data = await fetchPersonas(accessToken);
      setPersonas(data.personas || []);
    } catch (error) {
      console.error('Error loading personas:', error);
      toast.error('Failed to load personas');
    } finally {
      setLoadingPersonas(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.personaId) {
      toast.error("Please select a persona");
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error("Please enter an agent name");
      return;
    }

    setIsLoading(true);

    try {
      const selectedPersona = personas.find(p => p.id === formData.personaId);
      
      const agent = await createAgent(accessToken, {
        name: formData.name,
        type: formData.type,
        personaId: formData.personaId,
        model: formData.model,
        voice: formData.voice,
        language: formData.language,
        systemPrompt: selectedPersona?.instructions || '',
        status: 'active',
        channels: selectedPersona?.channels || ['voice'],
        phoneNumberId: formData.phoneNumberId,
        temperature: formData.temperature,
      });
      
      toast.success(`Agent "${agent.name}" created successfully!`);
      
      onAgentCreated(agent);
      
      // Dispatch custom event for other components
      window.dispatchEvent(new CustomEvent('agentCreated', { detail: agent }));
      
      // Reset form
      resetForm();
      
      onClose();
    } catch (error: any) {
      console.error('Error creating agent:', error);
      toast.error(error.message || "Failed to create agent");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      type: 'inbound',
      personaId: '',
      name: "",
      description: "",
      voice: "nova",
      model: "gpt-4",
      language: "en-US",
      phoneNumberId: null,
      temperature: 0.7,
    });
  };

  const handleNext = () => {
    if (currentStep === 1 && !formData.type) {
      toast.error("Please select an agent type");
      return;
    }
    if (currentStep === 2 && !formData.personaId) {
      toast.error("Please select a persona");
      return;
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getPersonaIcon = (type: string) => {
    const icons: Record<string, string> = {
      customer_support: '🎧',
      sales: '🎯',
      technical_support: '🔧',
      receptionist: '👔',
      survey: '📋',
      custom: '⚙️',
    };
    return icons[type] || '⚙️';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New AI Agent</DialogTitle>
          <DialogDescription>
            Step {currentStep} of 3: {
              currentStep === 1 ? 'Select Agent Type' :
              currentStep === 2 ? 'Choose Persona' :
              'Configure Agent'
            }
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${
                  step < currentStep
                    ? 'bg-green-500 text-white'
                    : step === currentStep
                    ? 'bg-primary text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step < currentStep ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  step
                )}
              </div>
              {step < 3 && (
                <div
                  className={`w-12 h-0.5 ${
                    step < currentStep ? 'bg-green-500' : 'bg-muted'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Agent Type */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card
                className={`cursor-pointer transition-all ${
                  formData.type === 'inbound'
                    ? 'border-primary border-2 bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setFormData({ ...formData, type: 'inbound' })}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <PhoneIncoming className="h-8 w-8 text-primary" />
                    {formData.type === 'inbound' && (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <CardTitle>Inbound</CardTitle>
                  <CardDescription>Handle incoming customer calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Customer support</li>
                    <li>• Order taking</li>
                    <li>• Appointment booking</li>
                  </ul>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  formData.type === 'outbound'
                    ? 'border-primary border-2 bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setFormData({ ...formData, type: 'outbound' })}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <PhoneOutgoing className="h-8 w-8 text-primary" />
                    {formData.type === 'outbound' && (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <CardTitle>Outbound</CardTitle>
                  <CardDescription>Make automated outbound calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Sales outreach</li>
                    <li>• Appointment reminders</li>
                    <li>• Surveys</li>
                  </ul>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all ${
                  formData.type === 'hybrid'
                    ? 'border-primary border-2 bg-primary/5'
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setFormData({ ...formData, type: 'hybrid' })}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Phone className="h-8 w-8 text-primary" />
                    {formData.type === 'hybrid' && (
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <CardTitle>Hybrid</CardTitle>
                  <CardDescription>Handle both inbound and outbound</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Full-service contact center</li>
                    <li>• Multi-purpose agents</li>
                    <li>• Maximum flexibility</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step 2: Select Persona */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <Label>Select Agent Persona</Label>
              <Button variant="link" size="sm" asChild>
                <a href="#" onClick={(e) => { e.preventDefault(); toast.info('Opening Personas page would navigate to /dashboard/settings/personas'); }}>
                  Manage personas →
                </a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Choose a personality from your library. The selected persona's personality will be combined with your brand profile.
            </p>

            {loadingPersonas ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            ) : personas.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No personas found. Create personas in your library to get started.</p>
                  <Button variant="outline" className="mt-4">Go to Persona Library</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
                {personas.map((persona) => (
                  <Card
                    key={persona.id}
                    className={`cursor-pointer transition-all ${
                      formData.personaId === persona.id
                        ? 'border-primary border-2 bg-primary/5'
                        : 'hover:border-primary/50'
                    }`}
                    onClick={() => setFormData({ ...formData, personaId: persona.id })}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getPersonaIcon(persona.type)}</span>
                          <div>
                            <CardTitle className="text-base">{persona.name}</CardTitle>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">{persona.type.replace('_', ' ')}</Badge>
                              {persona.isTemplate && <Badge variant="secondary" className="text-xs">Template</Badge>}
                            </div>
                          </div>
                        </div>
                        {formData.personaId === persona.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <CardDescription className="line-clamp-2 mt-2">
                        {persona.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {/* Channels */}
                      <div className="flex flex-wrap gap-1">
                        {persona.channels.slice(0, 3).map(ch => (
                          <Badge key={ch} variant="secondary" className="text-xs">
                            {ch}
                          </Badge>
                        ))}
                        {persona.channels.length > 3 && (
                          <Badge variant="secondary" className="text-xs">+{persona.channels.length - 3}</Badge>
                        )}
                      </div>
                      {/* Traits */}
                      {persona.personalityTraits.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          {persona.personalityTraits.slice(0, 2).join(', ')}
                          {persona.personalityTraits.length > 2 && '...'}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Configuration */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Agent Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Customer Support Agent"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Briefly describe this agent's purpose..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isLoading}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voice">Voice</Label>
                <Select
                  value={formData.voice}
                  onValueChange={(value) => setFormData({ ...formData, voice: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nova">Nova (Female)</SelectItem>
                    <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                    <SelectItem value="echo">Echo (Male)</SelectItem>
                    <SelectItem value="fable">Fable (Male)</SelectItem>
                    <SelectItem value="onyx">Onyx (Male)</SelectItem>
                    <SelectItem value="shimmer">Shimmer (Female)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="model">LLM Model</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => setFormData({ ...formData, model: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-4.1-mini">GPT-4.1 Mini</SelectItem>
                    <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                    <SelectItem value="claude-3.7-sonnet">Claude 3.7 Sonnet</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English (US)</SelectItem>
                  <SelectItem value="en-GB">English (UK)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                  <SelectItem value="de-DE">German</SelectItem>
                  <SelectItem value="it-IT">Italian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="temperature">
                Temperature: {formData.temperature.toFixed(1)}
              </Label>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[formData.temperature]}
                onValueChange={(value) => setFormData({ ...formData, temperature: value[0] })}
                disabled={isLoading}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Lower values make responses more focused and deterministic
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            {currentStep < 3 ? (
              <Button onClick={handleNext} disabled={isLoading}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Agent"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

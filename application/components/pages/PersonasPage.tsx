import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Search, Trash2, Edit, Users, Copy, CheckCircle2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { fetchPersonas, createPersona, updatePersona, deletePersona } from '@/components/../utils/api';

type PersonaType = 'customer_support' | 'sales' | 'technical_support' | 'receptionist' | 'survey' | 'custom';
type Channel = 'voice' | 'chat' | 'whatsapp' | 'email' | 'sms';

interface Persona {
  id: string;
  name: string;
  type: PersonaType;
  description: string;
  instructions: string;
  tone: string;
  style: string;
  personalityTraits: string[];
  channels: Channel[];
  tools: string[];
  brandProfileId?: string | null;
  isTemplate: boolean;
  usageCount?: number;
  createdAt: string;
}

const personaTypeOptions = [
  { value: 'customer_support', label: 'Customer Support' },
  { value: 'sales', label: 'Sales Agent' },
  { value: 'technical_support', label: 'Technical Support' },
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'survey', label: 'Survey Collector' },
  { value: 'custom', label: 'Custom' },
];

const toneOptions = ['Friendly', 'Professional', 'Casual', 'Formal', 'Empathetic'];
const styleOptions = ['Conversational', 'Formal', 'Technical', 'Simple'];
const traitSuggestions = ['Empathetic', 'Patient', 'Helpful', 'Confident', 'Friendly', 'Professional', 'Technical', 'Clear', 'Persuasive'];

const channelOptions: { value: Channel; label: string; icon: string; color: string }[] = [
  { value: 'voice', label: 'Voice', icon: '🎤', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  { value: 'chat', label: 'Chat', icon: '💬', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '📱', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  { value: 'email', label: 'Email', icon: '✉️', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  { value: 'sms', label: 'SMS', icon: '📨', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' },
];

const toolOptions = [
  { value: 'knowledge_base', label: 'Knowledge Base Search' },
  { value: 'calendar', label: 'Calendar Scheduling' },
  { value: 'crm', label: 'CRM Integration' },
  { value: 'payment', label: 'Payment Processing' },
  { value: 'ticketing', label: 'Ticketing System' },
  { value: 'screen_sharing', label: 'Screen Sharing' },
  { value: 'call_routing', label: 'Call Routing' },
];

interface PersonasPageProps {
  accessToken: string;
}

export function PersonasPage({ accessToken }: PersonasPageProps) {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [showTemplatesOnly, setShowTemplatesOnly] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Persona>>({
    name: '',
    type: 'customer_support',
    description: '',
    instructions: '',
    tone: 'professional',
    style: 'conversational',
    personalityTraits: [],
    channels: ['voice'],
    tools: [],
  });
  const [newTrait, setNewTrait] = useState('');

  useEffect(() => {
    loadPersonas();
  }, []);

  useEffect(() => {
    filterPersonas();
  }, [personas, searchTerm, filterType, filterChannel, showTemplatesOnly]);

  const loadPersonas = async () => {
    try {
      setLoading(true);
      const data = await fetchPersonas(accessToken);
      setPersonas(data.personas || []);
    } catch (error) {
      console.error('Error loading personas:', error);
      toast.error('Failed to load personas');
    } finally {
      setLoading(false);
    }
  };

  const filterPersonas = () => {
    let filtered = [...personas];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(p => p.type === filterType);
    }

    // Channel filter
    if (filterChannel !== 'all') {
      filtered = filtered.filter(p => p.channels.includes(filterChannel as Channel));
    }

    // Template filter
    if (showTemplatesOnly) {
      filtered = filtered.filter(p => p.isTemplate);
    }

    setFilteredPersonas(filtered);
  };

  const handleCreateOrUpdate = async () => {
    try {
      if (!formData.name || !formData.type) {
        toast.error('Name and type are required');
        return;
      }

      if (editingPersona) {
        await updatePersona(accessToken, editingPersona.id, formData);
        toast.success('Persona updated successfully!');
      } else {
        await createPersona(accessToken, formData as Omit<Persona, 'id' | 'createdAt' | 'isTemplate'>);
        toast.success('Persona created successfully!');
      }

      setShowCreateDialog(false);
      setEditingPersona(null);
      resetForm();
      loadPersonas();
    } catch (error: any) {
      console.error('Error saving persona:', error);
      toast.error(error.message || 'Failed to save persona');
    }
  };

  const handleDelete = async (persona: Persona) => {
    if (persona.isTemplate) {
      toast.error('Cannot delete system templates');
      return;
    }

    if (persona.usageCount && persona.usageCount > 0) {
      toast.error(`Cannot delete: ${persona.usageCount} agents are using this persona`);
      return;
    }

    if (!confirm(`Are you sure you want to delete "${persona.name}"?`)) {
      return;
    }

    try {
      await deletePersona(accessToken, persona.id);
      toast.success('Persona deleted successfully!');
      loadPersonas();
    } catch (error: any) {
      console.error('Error deleting persona:', error);
      toast.error(error.message || 'Failed to delete persona');
    }
  };

  const handleEdit = (persona: Persona) => {
    if (persona.isTemplate) {
      toast.error('Cannot edit system templates');
      return;
    }

    setEditingPersona(persona);
    setFormData({
      name: persona.name,
      type: persona.type,
      description: persona.description,
      instructions: persona.instructions,
      tone: persona.tone,
      style: persona.style,
      personalityTraits: [...persona.personalityTraits],
      channels: [...persona.channels],
      tools: [...persona.tools],
      brandProfileId: persona.brandProfileId,
    });
    setShowCreateDialog(true);
  };

  const handleDuplicate = (persona: Persona) => {
    setFormData({
      name: `${persona.name} (Copy)`,
      type: persona.type,
      description: persona.description,
      instructions: persona.instructions,
      tone: persona.tone,
      style: persona.style,
      personalityTraits: [...persona.personalityTraits],
      channels: [...persona.channels],
      tools: [...persona.tools],
    });
    setShowCreateDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'customer_support',
      description: '',
      instructions: '',
      tone: 'professional',
      style: 'conversational',
      personalityTraits: [],
      channels: ['voice'],
      tools: [],
    });
    setNewTrait('');
  };

  const addTrait = (trait: string) => {
    if (trait && !formData.personalityTraits?.includes(trait)) {
      setFormData({
        ...formData,
        personalityTraits: [...(formData.personalityTraits || []), trait],
      });
      setNewTrait('');
    }
  };

  const removeTrait = (trait: string) => {
    setFormData({
      ...formData,
      personalityTraits: formData.personalityTraits?.filter(t => t !== trait) || [],
    });
  };

  const toggleChannel = (channel: Channel) => {
    const channels = formData.channels || [];
    if (channels.includes(channel)) {
      setFormData({ ...formData, channels: channels.filter(c => c !== channel) });
    } else {
      setFormData({ ...formData, channels: [...channels, channel] });
    }
  };

  const toggleTool = (tool: string) => {
    const tools = formData.tools || [];
    if (tools.includes(tool)) {
      setFormData({ ...formData, tools: tools.filter(t => t !== tool) });
    } else {
      setFormData({ ...formData, tools: [...tools, tool] });
    }
  };

  const getPersonaIcon = (type: PersonaType) => {
    const icons = {
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1>Persona Library</h1>
          <p className="text-muted-foreground">Create reusable personality templates for your AI agents</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateDialog(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Create Persona
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search personas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Type Filter */}
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {personaTypeOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Channel Filter */}
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger>
                <SelectValue placeholder="All Channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {channelOptions.map(ch => (
                  <SelectItem key={ch.value} value={ch.value}>{ch.icon} {ch.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Template Toggle */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="templates-only"
                checked={showTemplatesOnly}
                onCheckedChange={(checked) => setShowTemplatesOnly(checked as boolean)}
              />
              <Label htmlFor="templates-only" className="cursor-pointer">System Templates Only</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personas Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredPersonas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-muted-foreground">No personas found</h3>
            <p className="text-sm text-muted-foreground mt-2">
              {searchTerm || filterType !== 'all' || filterChannel !== 'all'
                ? 'Try adjusting your filters'
                : 'Create personas to get started'}
            </p>
            {!searchTerm && filterType === 'all' && filterChannel === 'all' && (
              <Button onClick={() => { resetForm(); setShowCreateDialog(true); }} className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Persona
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPersonas.map((persona) => (
            <Card key={persona.id} className="hover:border-primary transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getPersonaIcon(persona.type)}</span>
                    <div>
                      <CardTitle className="text-lg">{persona.name}</CardTitle>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline">{personaTypeOptions.find(t => t.value === persona.type)?.label}</Badge>
                        {persona.isTemplate && <Badge variant="secondary">Template</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!persona.isTemplate && (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(persona)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(persona)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleDuplicate(persona)} title="Duplicate">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="line-clamp-2">{persona.description}</CardDescription>

                {/* Channels */}
                <div>
                  <Label className="text-xs text-muted-foreground">Communication Channels</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {persona.channels.map(ch => {
                      const channelInfo = channelOptions.find(c => c.value === ch);
                      return (
                        <Badge key={ch} variant="secondary" className={channelInfo?.color}>
                          {channelInfo?.icon} {channelInfo?.label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {/* Personality Traits */}
                {persona.personalityTraits.length > 0 && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Personality Traits</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {persona.personalityTraits.slice(0, 3).map(trait => (
                        <Badge key={trait} variant="outline">{trait}</Badge>
                      ))}
                      {persona.personalityTraits.length > 3 && (
                        <Badge variant="outline">+{persona.personalityTraits.length - 3} more</Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Tone & Style */}
                <div className="flex gap-2">
                  <Badge variant="secondary">Tone: {persona.tone}</Badge>
                  <Badge variant="secondary">Style: {persona.style}</Badge>
                </div>

                {/* Tools */}
                {persona.tools.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    <CheckCircle2 className="inline h-3 w-3 mr-1" />
                    {persona.tools.length} tool{persona.tools.length !== 1 ? 's' : ''} enabled
                  </div>
                )}

                {/* Usage Stats */}
                <div className="pt-3 border-t">
                  {persona.usageCount !== undefined && persona.usageCount > 0 ? (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">{persona.usageCount} agent{persona.usageCount !== 1 ? 's' : ''} using this persona</span>
                    </div>
                  ) : persona.isTemplate ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Info className="h-4 w-4" />
                      <span>System template • Cannot be edited</span>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Not currently in use</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={(open) => {
        setShowCreateDialog(open);
        if (!open) {
          setEditingPersona(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPersona ? 'Edit Persona' : 'Create New Persona'}</DialogTitle>
            <DialogDescription>
              {editingPersona ? 'Update your persona settings' : 'Configure personality and behavior for your AI agents'}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="tone">Instructions & Tone</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
            </TabsList>

            {/* Tab 1: Basic Info */}
            <TabsContent value="basic" className="space-y-4">
              <div>
                <Label htmlFor="name">Persona Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Customer Support Agent"
                />
              </div>

              <div>
                <Label htmlFor="type">Persona Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as PersonaType })}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {personaTypeOptions.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this persona's purpose..."
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Tab 2: Instructions & Tone */}
            <TabsContent value="tone" className="space-y-4">
              <div>
                <Label htmlFor="instructions">Base Instructions</Label>
                <Textarea
                  id="instructions"
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Define the persona's core behavior, knowledge, and conversation style..."
                  rows={6}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                    <SelectTrigger id="tone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map(tone => (
                        <SelectItem key={tone} value={tone.toLowerCase()}>{tone}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="style">Language Style</Label>
                  <Select value={formData.style} onValueChange={(value) => setFormData({ ...formData, style: value })}>
                    <SelectTrigger id="style">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {styleOptions.map(style => (
                        <SelectItem key={style} value={style.toLowerCase()}>{style}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Personality Traits</Label>
                <div className="flex gap-2 mt-2 mb-3">
                  <Input
                    placeholder="Add a trait..."
                    value={newTrait}
                    onChange={(e) => setNewTrait(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTrait(newTrait);
                      }
                    }}
                  />
                  <Button type="button" onClick={() => addTrait(newTrait)} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.personalityTraits?.map(trait => (
                    <Badge key={trait} variant="secondary" className="cursor-pointer" onClick={() => removeTrait(trait)}>
                      {trait} ×
                    </Badge>
                  ))}
                </div>
                <div className="mt-3">
                  <Label className="text-xs text-muted-foreground">Suggestions:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {traitSuggestions.filter(t => !formData.personalityTraits?.includes(t)).map(trait => (
                      <Badge key={trait} variant="outline" className="cursor-pointer" onClick={() => addTrait(trait)}>
                        + {trait}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab 3: Communication */}
            <TabsContent value="communication" className="space-y-4">
              <div>
                <Label>Multi-Channel Capabilities</Label>
                <div className="space-y-3 mt-2">
                  {channelOptions.map(channel => (
                    <div key={channel.value} className="flex items-start space-x-2">
                      <Checkbox
                        id={`channel-${channel.value}`}
                        checked={formData.channels?.includes(channel.value)}
                        onCheckedChange={() => toggleChannel(channel.value)}
                      />
                      <div className="flex-1">
                        <Label htmlFor={`channel-${channel.value}`} className="cursor-pointer">
                          {channel.icon} {channel.label}
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Tab 4: Tools */}
            <TabsContent value="tools" className="space-y-4">
              <div>
                <Label>Available Tools</Label>
                <div className="space-y-3 mt-2">
                  {toolOptions.map(tool => (
                    <div key={tool.value} className="flex items-start space-x-2">
                      <Checkbox
                        id={`tool-${tool.value}`}
                        checked={formData.tools?.includes(tool.value)}
                        onCheckedChange={() => toggleTool(tool.value)}
                      />
                      <Label htmlFor={`tool-${tool.value}`} className="cursor-pointer">
                        {tool.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false);
              setEditingPersona(null);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateOrUpdate}>
              {editingPersona ? 'Update Persona' : 'Create Persona'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

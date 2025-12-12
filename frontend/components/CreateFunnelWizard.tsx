import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Target, Phone, Globe, MessageSquare, Mail, Smartphone, Bot, Check, Settings as SettingsIcon, Zap, Calendar, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CreateFunnelWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onFunnelCreated?: (funnel: any) => void;
  agents: any[];
  accessToken: string;
}

const STEPS = [
  { id: 1, title: 'Funnel Type & Goal', icon: Target },
  { id: 2, title: 'Entry Points', icon: Phone },
  { id: 3, title: 'AI Agent', icon: Bot },
  { id: 4, title: 'Qualification Rules', icon: Zap },
  { id: 5, title: 'Integrations', icon: SettingsIcon },
];

export function CreateFunnelWizard({ isOpen, onClose, onFunnelCreated, agents, accessToken }: CreateFunnelWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    type: 'lead_generation',
    description: '',
    
    // Step 2
    entryPoints: [] as string[],
    phoneNumber: '',
    webFormEnabled: false,
    chatEnabled: false,
    emailEnabled: false,
    smsEnabled: false,
    
    // Step 3
    agentId: '',
    createNewAgent: false,
    newAgentName: '',
    
    // Step 4
    qualificationQuestions: [] as string[],
    hotLeadThreshold: 70,
    warmLeadThreshold: 40,
    
    // Step 5
    calendarIntegration: '',
    crmIntegration: '',
    emailNotifications: true,
    smsNotifications: false,
    slackNotifications: false,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleEntryPoint = (point: string) => {
    setFormData(prev => ({
      ...prev,
      entryPoints: prev.entryPoints.includes(point)
        ? prev.entryPoints.filter(p => p !== point)
        : [...prev.entryPoints, point]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name.length > 0 && formData.type;
      case 2:
        return formData.entryPoints.length > 0;
      case 3:
        return formData.agentId || (formData.createNewAgent && formData.newAgentName);
      case 4:
        return formData.qualificationQuestions.length > 0;
      case 5:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleCreate = async () => {
    setCreating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newFunnel = {
        id: `funnel_${Date.now()}`,
        ...formData,
        status: 'active',
        stats: {
          totalCalls: 0,
          completed: 0,
          hotLeads: 0,
          booked: 0,
          conversionRate: 0,
        },
        createdAt: new Date().toISOString(),
      };
      
      toast.success('Funnel created successfully!');
      onFunnelCreated?.(newFunnel);
      onClose();
    } catch (error) {
      toast.error('Failed to create funnel');
    } finally {
      setCreating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label htmlFor="name" className="text-base">Funnel Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          placeholder="e.g., Home Buyer Qualification"
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base mb-3 block">What's your funnel goal? *</Label>
        <RadioGroup value={formData.type} onValueChange={(v) => updateFormData('type', v)}>
          <div className="grid grid-cols-2 gap-4">
            <Card className={`cursor-pointer transition-all ${formData.type === 'lead_generation' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <CardHeader className="p-4" onClick={() => updateFormData('type', 'lead_generation')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lead_generation" id="lead_gen" />
                  <Label htmlFor="lead_gen" className="cursor-pointer flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Lead Generation
                  </Label>
                </div>
                <CardDescription className="mt-2">Capture & qualify new leads</CardDescription>
              </CardHeader>
            </Card>

            <Card className={`cursor-pointer transition-all ${formData.type === 'appointments' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <CardHeader className="p-4" onClick={() => updateFormData('type', 'appointments')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="appointments" id="appointments" />
                  <Label htmlFor="appointments" className="cursor-pointer flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Appointments
                  </Label>
                </div>
                <CardDescription className="mt-2">Schedule meetings automatically</CardDescription>
              </CardHeader>
            </Card>

            <Card className={`cursor-pointer transition-all ${formData.type === 'sales' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <CardHeader className="p-4" onClick={() => updateFormData('type', 'sales')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sales" id="sales" />
                  <Label htmlFor="sales" className="cursor-pointer flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Sales
                  </Label>
                </div>
                <CardDescription className="mt-2">Close deals with AI closer</CardDescription>
              </CardHeader>
            </Card>

            <Card className={`cursor-pointer transition-all ${formData.type === 'followup' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
              <CardHeader className="p-4" onClick={() => updateFormData('type', 'followup')}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="followup" id="followup" />
                  <Label htmlFor="followup" className="cursor-pointer flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Follow-up
                  </Label>
                </div>
                <CardDescription className="mt-2">Nurture existing leads</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="description" className="text-base">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          placeholder="Describe what this funnel does..."
          className="mt-2"
          rows={3}
        />
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">How will leads enter this funnel? *</h3>
        <div className="space-y-4">
          {/* Phone Entry */}
          <Card 
            className={`cursor-pointer transition-all ${formData.entryPoints.includes('phone') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onClick={() => toggleEntryPoint('phone')}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  checked={formData.entryPoints.includes('phone')}
                  onCheckedChange={() => toggleEntryPoint('phone')}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Phone className="h-5 w-5" />
                    <Label className="text-base cursor-pointer">Voice Call (Inbound Phone Number)</Label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Assign a phone number for inbound calls
                  </p>
                  {formData.entryPoints.includes('phone') && (
                    <Input
                      value={formData.phoneNumber}
                      onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="mt-3"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Web Form */}
          <Card 
            className={`cursor-pointer transition-all ${formData.entryPoints.includes('web_form') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onClick={() => toggleEntryPoint('web_form')}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  checked={formData.entryPoints.includes('web_form')}
                  onCheckedChange={() => toggleEntryPoint('web_form')}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-5 w-5" />
                    <Label className="text-base cursor-pointer">Web Form (Embeddable Widget)</Label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Embed a form on your website
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chat Widget */}
          <Card 
            className={`cursor-pointer transition-all ${formData.entryPoints.includes('chat') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onClick={() => toggleEntryPoint('chat')}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  checked={formData.entryPoints.includes('chat')}
                  onCheckedChange={() => toggleEntryPoint('chat')}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <MessageSquare className="h-5 w-5" />
                    <Label className="text-base cursor-pointer">Chat Widget (Website)</Label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Live chat on your website
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SMS/WhatsApp */}
          <Card 
            className={`cursor-pointer transition-all ${formData.entryPoints.includes('sms') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onClick={() => toggleEntryPoint('sms')}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  checked={formData.entryPoints.includes('sms')}
                  onCheckedChange={() => toggleEntryPoint('sms')}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Smartphone className="h-5 w-5" />
                    <Label className="text-base cursor-pointer">SMS/WhatsApp (Text-to-Voice)</Label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Text messages trigger voice calls
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card 
            className={`cursor-pointer transition-all ${formData.entryPoints.includes('email') ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
            onClick={() => toggleEntryPoint('email')}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Checkbox 
                  checked={formData.entryPoints.includes('email')}
                  onCheckedChange={() => toggleEntryPoint('email')}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="h-5 w-5" />
                    <Label className="text-base cursor-pointer">Email Response</Label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Respond to email inquiries
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Choose or create your AI agent *</h3>
        
        {agents.length > 0 && (
          <div className="mb-6">
            <Label className="text-base mb-3 block">Existing Agents</Label>
            <Select value={formData.agentId} onValueChange={(v) => updateFormData('agentId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select an agent..." />
              </SelectTrigger>
              <SelectContent>
                {agents.map(agent => (
                  <SelectItem key={agent.id} value={agent.id}>
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4" />
                      {agent.name} - {agent.model}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-900 px-2 text-slate-500">Or</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              checked={formData.createNewAgent}
              onCheckedChange={(checked) => updateFormData('createNewAgent', checked)}
              id="create-new"
            />
            <Label htmlFor="create-new" className="text-base cursor-pointer">
              Create New Agent
            </Label>
          </div>

          {formData.createNewAgent && (
            <div className="space-y-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-800">
              <div>
                <Label htmlFor="new-agent-name">Agent Name</Label>
                <Input
                  id="new-agent-name"
                  value={formData.newAgentName}
                  onChange={(e) => updateFormData('newAgentName', e.target.value)}
                  placeholder="e.g., Lead Qualifier"
                  className="mt-2"
                />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                You'll be able to configure voice, model, and instructions after creating the funnel
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const commonQuestions = [
      'Budget range',
      'Preferred location',
      'Timeline to purchase',
      'Number of bedrooms',
      'Pre-approved for financing',
      'Company size',
      'Decision maker role',
      'Current solution',
      'Pain points',
      'Implementation timeline',
    ];

    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-base font-medium mb-4">Lead Qualification & Routing *</h3>
          
          <div className="mb-6">
            <Label className="text-base mb-3 block">Qualification Questions</Label>
            <div className="grid grid-cols-2 gap-3">
              {commonQuestions.map(question => (
                <div key={question} className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.qualificationQuestions.includes(question)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        updateFormData('qualificationQuestions', [...formData.qualificationQuestions, question]);
                      } else {
                        updateFormData('qualificationQuestions', formData.qualificationQuestions.filter(q => q !== question));
                      }
                    }}
                    id={question}
                  />
                  <Label htmlFor={question} className="cursor-pointer text-sm">
                    {question}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label className="text-base">Hot Lead Threshold: {formData.hotLeadThreshold} points</Label>
              <Input
                type="range"
                min="50"
                max="100"
                step="5"
                value={formData.hotLeadThreshold}
                onChange={(e) => updateFormData('hotLeadThreshold', parseInt(e.target.value))}
                className="mt-2"
              />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Leads scoring {formData.hotLeadThreshold}+ points will be marked as hot leads
              </p>
            </div>

            <div>
              <Label className="text-base">Warm Lead Threshold: {formData.warmLeadThreshold} points</Label>
              <Input
                type="range"
                min="20"
                max="70"
                step="5"
                value={formData.warmLeadThreshold}
                onChange={(e) => updateFormData('warmLeadThreshold', parseInt(e.target.value))}
                className="mt-2"
              />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Leads scoring {formData.warmLeadThreshold}-{formData.hotLeadThreshold} points will be marked as warm leads
              </p>
            </div>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Routing Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Hot Leads (≥{formData.hotLeadThreshold} points)</span>
                <Badge variant="default">Book appointment immediately</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Warm Leads ({formData.warmLeadThreshold}-{formData.hotLeadThreshold} points)</span>
                <Badge variant="secondary">Add to nurture sequence</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Cold Leads (&lt;{formData.warmLeadThreshold} points)</span>
                <Badge variant="outline">Long-term follow-up</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-medium mb-4">Connect your tools & automate actions</h3>
        
        <div className="space-y-6">
          {/* Calendar Integration */}
          <div>
            <Label className="text-base mb-3 block">Calendar Integration</Label>
            <Select value={formData.calendarIntegration} onValueChange={(v) => updateFormData('calendarIntegration', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select calendar..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="calendly">Calendly</SelectItem>
                <SelectItem value="google">Google Calendar</SelectItem>
                <SelectItem value="outlook">Office 365</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* CRM Integration */}
          <div>
            <Label className="text-base mb-3 block">CRM Integration</Label>
            <Select value={formData.crmIntegration} onValueChange={(v) => updateFormData('crmIntegration', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select CRM..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="salesforce">Salesforce</SelectItem>
                <SelectItem value="hubspot">HubSpot</SelectItem>
                <SelectItem value="pipedrive">Pipedrive</SelectItem>
                <SelectItem value="followupboss">Follow Up Boss</SelectItem>
                <SelectItem value="none">None</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notifications */}
          <div>
            <Label className="text-base mb-3 block">Notifications</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => updateFormData('emailNotifications', checked)}
                  id="email-notif"
                />
                <Label htmlFor="email-notif" className="cursor-pointer">
                  Email me when hot lead is qualified
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.smsNotifications}
                  onCheckedChange={(checked) => updateFormData('smsNotifications', checked)}
                  id="sms-notif"
                />
                <Label htmlFor="sms-notif" className="cursor-pointer">
                  SMS alert for booked appointments
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={formData.slackNotifications}
                  onCheckedChange={(checked) => updateFormData('slackNotifications', checked)}
                  id="slack-notif"
                />
                <Label htmlFor="slack-notif" className="cursor-pointer">
                  Post to Slack channel
                </Label>
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Check className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Ready to Launch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                Your funnel will be created and activated immediately. You can pause or edit it anytime from the dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const progress = (currentStep / 5) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create Sales Funnel - Step {currentStep}/5</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Set up your automated sales funnel with AI-powered lead qualification
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="px-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-4">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-600 text-white' :
                    'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-xs text-center max-w-[80px] ${
                    isActive ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t dark:border-slate-700">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || creating}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {currentStep < 5 ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? 'Creating...' : 'Create Funnel & Go Live!'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

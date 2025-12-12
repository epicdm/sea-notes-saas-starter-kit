import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Phone, Sparkles, Settings, Brain, Zap } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface EditFunnelWizardProps {
  open: boolean;
  onClose: () => void;
  onSave: (funnel: any) => void;
  funnel: any;
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Phone },
  { id: 2, title: 'AI Configuration', icon: Brain },
  { id: 3, title: 'Qualification', icon: Zap },
  { id: 4, title: 'Integrations', icon: Settings },
  { id: 5, title: 'Review', icon: Check },
];

export function EditFunnelWizard({ open, onClose, onSave, funnel }: EditFunnelWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  // Portal root for dialog
  const portalRoot = typeof document !== 'undefined' 
    ? document.getElementById('portal-root') 
    : undefined;
  
  // Prevent background scroll
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  
  const [formData, setFormData] = useState({
    // Step 1
    name: '',
    description: '',
    phoneNumber: '',
    businessType: '',
    
    // Step 2
    persona: '',
    aiModel: '',
    voiceId: '',
    systemPrompt: '',
    language: '',
    temperature: 0.7,
    
    // Step 3
    qualificationEnabled: true,
    questions: [] as string[],
    hotThreshold: 70,
    warmThreshold: 40,
    autoBooking: false,
    
    // Step 4
    calendar: '',
    crm: '',
    emailNotifications: true,
    smsNotifications: false,
    webhookUrl: '',
    
    // Status
    status: 'active',
  });

  // Load funnel data when modal opens
  useEffect(() => {
    if (funnel && open) {
      setFormData({
        name: funnel.name || '',
        description: funnel.description || '',
        phoneNumber: funnel.phoneNumber || '',
        businessType: funnel.businessType || 'real_estate',
        persona: funnel.persona || 'professional',
        aiModel: funnel.aiModel || 'gpt-4',
        voiceId: funnel.voiceId || 'alloy',
        systemPrompt: funnel.systemPrompt || '',
        language: funnel.language || 'en-US',
        temperature: funnel.temperature || 0.7,
        qualificationEnabled: funnel.qualificationRules?.enabled !== false,
        questions: funnel.qualificationRules?.questions || ['budget', 'location', 'timeline'],
        hotThreshold: funnel.qualificationRules?.hotThreshold || 70,
        warmThreshold: funnel.qualificationRules?.warmThreshold || 40,
        autoBooking: funnel.autoBooking || false,
        calendar: funnel.integrations?.calendar || '',
        crm: funnel.integrations?.crm || '',
        emailNotifications: funnel.notifications?.email !== false,
        smsNotifications: funnel.notifications?.sms || false,
        webhookUrl: funnel.integrations?.webhookUrl || '',
        status: funnel.status || 'active',
      });
    }
  }, [funnel, open]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Simulate save
    setTimeout(() => {
      const updatedFunnel = {
        ...funnel,
        name: formData.name,
        description: formData.description,
        phoneNumber: formData.phoneNumber,
        businessType: formData.businessType,
        persona: formData.persona,
        aiModel: formData.aiModel,
        voiceId: formData.voiceId,
        systemPrompt: formData.systemPrompt,
        language: formData.language,
        temperature: formData.temperature,
        qualificationRules: {
          enabled: formData.qualificationEnabled,
          questions: formData.questions,
          hotThreshold: formData.hotThreshold,
          warmThreshold: formData.warmThreshold,
        },
        autoBooking: formData.autoBooking,
        integrations: {
          calendar: formData.calendar,
          crm: formData.crm,
          webhookUrl: formData.webhookUrl,
        },
        notifications: {
          email: formData.emailNotifications,
          sms: formData.smsNotifications,
        },
        status: formData.status,
        updatedAt: new Date().toISOString(),
      };
      
      onSave(updatedFunnel);
      setSaving(false);
      toast.success('Funnel updated successfully!');
      onClose();
      setCurrentStep(1);
    }, 1500);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Basic Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Funnel Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Real Estate Lead Qualifier"
                    value={formData.name}
                    onChange={(e) => updateFormData('name', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="What is this funnel used for?"
                    value={formData.description}
                    onChange={(e) => updateFormData('description', e.target.value)}
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phoneNumber}
                    onChange={(e) => updateFormData('phoneNumber', e.target.value)}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    The phone number customers will call
                  </p>
                </div>

                <div>
                  <Label htmlFor="business-type">Business Type</Label>
                  <Select value={formData.businessType} onValueChange={(value) => updateFormData('businessType', value)}>
                    <SelectTrigger id="business-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="real_estate">Real Estate</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="automotive">Automotive</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="services">Professional Services</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">AI Configuration</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="persona">Persona</Label>
                  <Select value={formData.persona} onValueChange={(value) => updateFormData('persona', value)}>
                    <SelectTrigger id="persona">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional & Courteous</SelectItem>
                      <SelectItem value="friendly">Friendly & Casual</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic & Energetic</SelectItem>
                      <SelectItem value="empathetic">Empathetic & Understanding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="ai-model">AI Model</Label>
                  <Select value={formData.aiModel} onValueChange={(value) => updateFormData('aiModel', value)}>
                    <SelectTrigger id="ai-model">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                      <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Faster)</SelectItem>
                      <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="voice">Voice</Label>
                  <Select value={formData.voiceId} onValueChange={(value) => updateFormData('voiceId', value)}>
                    <SelectTrigger id="voice">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                      <SelectItem value="echo">Echo (Male)</SelectItem>
                      <SelectItem value="fable">Fable (British)</SelectItem>
                      <SelectItem value="onyx">Onyx (Deep)</SelectItem>
                      <SelectItem value="nova">Nova (Female)</SelectItem>
                      <SelectItem value="shimmer">Shimmer (Soft)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={formData.language} onValueChange={(value) => updateFormData('language', value)}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="en-GB">English (UK)</SelectItem>
                      <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                      <SelectItem value="es-MX">Spanish (Mexico)</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="system-prompt">System Prompt</Label>
                  <Textarea
                    id="system-prompt"
                    placeholder="You are a helpful real estate assistant..."
                    value={formData.systemPrompt}
                    onChange={(e) => updateFormData('systemPrompt', e.target.value)}
                    rows={6}
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Custom instructions for the AI agent
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="temperature">Temperature: {formData.temperature}</Label>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {formData.temperature < 0.3 ? 'Very Focused' : 
                       formData.temperature < 0.6 ? 'Balanced' : 
                       formData.temperature < 0.8 ? 'Creative' : 'Very Creative'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.temperature}
                    onChange={(e) => updateFormData('temperature', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    Higher values make responses more creative, lower values more focused
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Lead Qualification</h3>
              
              <div className="flex items-center justify-between mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="font-medium">Enable Lead Qualification</div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Automatically score and categorize leads
                  </p>
                </div>
                <Switch
                  checked={formData.qualificationEnabled}
                  onCheckedChange={(checked) => updateFormData('qualificationEnabled', checked)}
                />
              </div>

              {formData.qualificationEnabled && (
                <>
                  <div className="mb-6">
                    <Label className="mb-3 block">Qualification Questions</Label>
                    <div className="space-y-2">
                      {[
                        { id: 'budget', label: 'Budget Range' },
                        { id: 'location', label: 'Preferred Location' },
                        { id: 'timeline', label: 'Purchase Timeline' },
                        { id: 'bedrooms', label: 'Number of Bedrooms' },
                        { id: 'preapproved', label: 'Pre-approval Status' },
                        { id: 'urgency', label: 'Urgency Level' },
                        { id: 'contact', label: 'Contact Preference' },
                      ].map(question => (
                        <div key={question.id} className="flex items-center gap-3 p-3 border dark:border-slate-700 rounded-lg">
                          <Checkbox
                            id={question.id}
                            checked={formData.questions.includes(question.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                updateFormData('questions', [...formData.questions, question.id]);
                              } else {
                                updateFormData('questions', formData.questions.filter(q => q !== question.id));
                              }
                            }}
                          />
                          <Label htmlFor={question.id} className="cursor-pointer flex-1">
                            {question.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4 mt-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Hot Lead Threshold: {formData.hotThreshold}%</Label>
                        <Badge className="bg-red-500">Hot</Badge>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="100"
                        value={formData.hotThreshold}
                        onChange={(e) => updateFormData('hotThreshold', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Leads scoring {formData.hotThreshold}% or higher are marked as HOT
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Warm Lead Threshold: {formData.warmThreshold}%</Label>
                        <Badge className="bg-yellow-500">Warm</Badge>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        value={formData.warmThreshold}
                        onChange={(e) => updateFormData('warmThreshold', parseInt(e.target.value))}
                        className="w-full"
                      />
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        Leads scoring {formData.warmThreshold}%-{formData.hotThreshold}% are WARM
                      </p>
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <div className="font-medium">Auto-Booking</div>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Automatically schedule appointments for hot leads
                      </p>
                    </div>
                    <Switch
                      checked={formData.autoBooking}
                      onCheckedChange={(checked) => updateFormData('autoBooking', checked)}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Integrations & Notifications</h3>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Calendar Integration</CardTitle>
                    <CardDescription>Connect your calendar for automatic booking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={formData.calendar} onValueChange={(value) => updateFormData('calendar', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select calendar service" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="calendly">Calendly</SelectItem>
                        <SelectItem value="google">Google Calendar</SelectItem>
                        <SelectItem value="outlook">Outlook Calendar</SelectItem>
                        <SelectItem value="cal">Cal.com</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">CRM Integration</CardTitle>
                    <CardDescription>Sync leads to your CRM automatically</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select value={formData.crm} onValueChange={(value) => updateFormData('crm', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select CRM" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salesforce">Salesforce</SelectItem>
                        <SelectItem value="hubspot">HubSpot</SelectItem>
                        <SelectItem value="pipedrive">Pipedrive</SelectItem>
                        <SelectItem value="followupboss">Follow Up Boss</SelectItem>
                        <SelectItem value="zoho">Zoho CRM</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Webhook</CardTitle>
                    <CardDescription>Send lead data to your custom endpoint</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="https://your-domain.com/webhook"
                      value={formData.webhookUrl}
                      onChange={(e) => updateFormData('webhookUrl', e.target.value)}
                    />
                  </CardContent>
                </Card>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-lg">
                      <div>
                        <div className="font-medium">Email Notifications</div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Get notified when new leads come in
                        </p>
                      </div>
                      <Switch
                        checked={formData.emailNotifications}
                        onCheckedChange={(checked) => updateFormData('emailNotifications', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-lg">
                      <div>
                        <div className="font-medium">SMS Notifications</div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Receive text messages for hot leads
                        </p>
                      </div>
                      <Switch
                        checked={formData.smsNotifications}
                        onCheckedChange={(checked) => updateFormData('smsNotifications', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Review Changes</h3>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Configuration Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Funnel Name</div>
                      <div className="font-medium">{formData.name || 'Not set'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Phone Number</div>
                      <div className="font-medium">{formData.phoneNumber || 'Not set'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Business Type</div>
                      <div className="font-medium capitalize">{formData.businessType.replace('_', ' ')}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Status</div>
                      <Badge variant={formData.status === 'active' ? 'default' : 'secondary'}>
                        {formData.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">AI Model</div>
                      <div className="font-medium">{formData.aiModel}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Voice</div>
                      <div className="font-medium capitalize">{formData.voiceId}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Persona</div>
                      <div className="font-medium capitalize">{formData.persona}</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Language</div>
                      <div className="font-medium">{formData.language}</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Qualification</div>
                      <div className="font-medium">
                        {formData.qualificationEnabled ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Questions</div>
                      <div className="font-medium">{formData.questions.length} selected</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Hot Threshold</div>
                      <div className="font-medium">{formData.hotThreshold}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Auto-Booking</div>
                      <div className="font-medium">
                        {formData.autoBooking ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Calendar</div>
                      <div className="font-medium capitalize">
                        {formData.calendar || 'Not connected'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">CRM</div>
                      <div className="font-medium capitalize">
                        {formData.crm || 'Not connected'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">Email Notifications</div>
                      <div className="font-medium">
                        {formData.emailNotifications ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">SMS Notifications</div>
                      <div className="font-medium">
                        {formData.smsNotifications ? 'Enabled' : 'Disabled'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="p-4 flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Ready to Save</h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                      Your changes will be applied immediately. The funnel will continue to receive calls without interruption.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal container={portalRoot}>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[99999] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        
        <Dialog.Content className="fixed top-1/2 left-1/2 z-[100000] w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white dark:bg-slate-900 p-0 shadow-xl outline-none data-[state=open]:animate-in data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:zoom-out-95">
          {/* Header */}
          <div className="p-6 pb-0 flex items-center justify-between">
            <div>
              <Dialog.Title className="text-2xl font-semibold">Edit Funnel</Dialog.Title>
              <Dialog.Description className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Update your funnel configuration
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </Dialog.Close>
          </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-y dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-colors ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : isComplete
                          ? 'bg-green-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {isComplete ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                    </div>
                    <div className="hidden md:block">
                      <div className="text-sm font-medium">{step.title}</div>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${isComplete ? 'bg-green-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  )}
                </div>
              );
            })}
          </div>
          <Progress value={(currentStep / STEPS.length) * 100} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[calc(90vh-280px)]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 border-t dark:border-slate-700 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep < STEPS.length ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

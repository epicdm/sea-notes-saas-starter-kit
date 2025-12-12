import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, Edit3, Calendar, Check, Lightbulb, BarChart, FileText, Image as ImageIcon, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface CreateSocialPostWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: (post: any) => void;
  connectedAccounts: any[];
  accessToken: string;
  initialTemplate?: any;
}

const STEPS = [
  { id: 1, title: 'Content Type & Topic', icon: Lightbulb },
  { id: 2, title: 'AI Generation & Editing', icon: Sparkles },
  { id: 3, title: 'Schedule & Publish', icon: Calendar },
];

export function CreateSocialPostWizard({ isOpen, onClose, onPostCreated, connectedAccounts, accessToken, initialTemplate }: CreateSocialPostWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1
    contentType: initialTemplate?.category || 'insight',
    topic: initialTemplate?.title || '',
    targetAudience: '',
    tone: 'brand_voice',
    
    // Step 2
    generatedContent: initialTemplate?.content || '',
    imageUrl: '',
    hashtags: initialTemplate?.tags || [] as string[],
    
    // Step 3
    platforms: initialTemplate?.platforms || [] as string[],
    publishType: 'now',
    scheduledDate: '',
    scheduledTime: '',
    autoEngage: true,
  });

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const togglePlatform = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.topic.length > 0;
      case 2:
        return formData.generatedContent.length > 0;
      case 3:
        return formData.platforms.length > 0 && 
          (formData.publishType === 'now' || (formData.scheduledDate && formData.scheduledTime));
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1 && canProceed()) {
      // Generate content
      handleGenerate();
    } else if (canProceed()) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const contentTemplates = {
        insight: `AI isn't replacing ${formData.targetAudience || 'professionals'} – it's empowering them to work smarter.\n\nHere's what I'm seeing in 2025:\n\n1. ${formData.topic} is transforming how we work\n2. New opportunities are emerging faster than ever\n3. Those who adapt early will lead the way\n\nWhat's your take? Share your thoughts below.\n\n#Innovation #${formData.topic.replace(/\s+/g, '')} #FutureOfWork`,
        tip: `3 key lessons about ${formData.topic}:\n\n1. Start with the fundamentals\nMaster the basics before moving to advanced techniques.\n\n2. Practice consistently\nDaily progress beats occasional brilliance.\n\n3. Learn from failures\nEvery mistake is a stepping stone to success.\n\nWhich resonates most with you?\n\n#Tips #${formData.topic.replace(/\s+/g, '')} #GrowthMindset`,
        case_study: `Just wrapped up an incredible case study 📊\n\nHelped a client achieve amazing results with ${formData.topic}.\n\nThe approach:\n• Clear strategy from day one\n• Data-driven decision making\n• Continuous optimization\n\nResults:\n✅ 300% improvement\n✅ Faster time to value\n✅ Measurable ROI\n\nWant to learn more? Drop a comment.\n\n#CaseStudy #${formData.topic.replace(/\s+/g, '')} #Results`,
        question: `Quick question for ${formData.targetAudience || 'everyone'}:\n\nWhat's your biggest challenge with ${formData.topic}?\n\nI'm curious to hear:\n• What you've tried so far\n• What's working (or not)\n• What you'd like to learn\n\nDrop your thoughts below 👇\n\n#Discussion #${formData.topic.replace(/\s+/g, '')} #Community`,
      };

      const content = contentTemplates[formData.contentType as keyof typeof contentTemplates] || contentTemplates.insight;
      
      updateFormData('generatedContent', content);
      updateFormData('hashtags', [`#${formData.topic.replace(/\s+/g, '')}`, '#Innovation', '#Growth']);
      setCurrentStep(2);
      toast.success('Content generated successfully!');
    } catch (error) {
      toast.error('Failed to generate content');
    } finally {
      setGenerating(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newPost = {
        id: `post_${Date.now()}`,
        ...formData,
        status: formData.publishType === 'now' ? 'published' : 'scheduled',
        createdAt: new Date().toISOString(),
        publishedAt: formData.publishType === 'now' ? new Date().toISOString() : null,
        scheduledFor: formData.publishType === 'schedule' 
          ? new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString() 
          : null,
      };
      
      toast.success(formData.publishType === 'now' ? 'Post published successfully!' : 'Post scheduled successfully!');
      onPostCreated?.(newPost);
      onClose();
    } catch (error) {
      toast.error('Failed to publish post');
    } finally {
      setPublishing(false);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return Linkedin;
      case 'twitter': return Twitter;
      case 'facebook': return Facebook;
      case 'instagram': return Instagram;
      default: return Linkedin;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base mb-3 block">What do you want to post about? *</Label>
        <RadioGroup value={formData.contentType} onValueChange={(v) => updateFormData('contentType', v)}>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { value: 'insight', label: '💡 Industry Insight', desc: 'Share expertise' },
              { value: 'tip', label: '📊 Tips & How-To', desc: 'Practical advice' },
              { value: 'case_study', label: '🎯 Case Study', desc: 'Success story' },
              { value: 'question', label: '🤔 Question/Poll', desc: 'Engage audience' },
            ].map(type => (
              <Card 
                key={type.value}
                className={`cursor-pointer transition-all ${formData.contentType === type.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => updateFormData('contentType', type.value)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-1">
                    <RadioGroupItem value={type.value} id={type.value} />
                    <Label htmlFor={type.value} className="cursor-pointer font-medium">
                      {type.label}
                    </Label>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 ml-6">{type.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="topic" className="text-base">Your topic *</Label>
        <Textarea
          id="topic"
          value={formData.topic}
          onChange={(e) => updateFormData('topic', e.target.value)}
          placeholder="e.g., AI's impact on marketing automation in 2025"
          className="mt-2"
          rows={3}
        />
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Describe what you want to say. AI will expand on this.
        </p>
      </div>

      <div>
        <Label htmlFor="audience" className="text-base">Target Audience</Label>
        <Input
          id="audience"
          value={formData.targetAudience}
          onChange={(e) => updateFormData('targetAudience', e.target.value)}
          placeholder="e.g., B2B Marketers, Founders, General Business"
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-base mb-3 block">Tone</Label>
        <RadioGroup value={formData.tone} onValueChange={(v) => updateFormData('tone', v)}>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="brand_voice" id="brand" />
              <Label htmlFor="brand" className="cursor-pointer">Use my brand voice</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="casual" id="casual" />
              <Label htmlFor="casual" className="cursor-pointer">More casual</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="professional" id="professional" />
              <Label htmlFor="professional" className="cursor-pointer">More professional</Label>
            </div>
          </div>
        </RadioGroup>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="stats">Stats & Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-base">AI-Generated Content</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleGenerate}
                disabled={generating}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generating ? 'Regenerating...' : 'Regenerate'}
              </Button>
            </div>
            <Textarea
              value={formData.generatedContent}
              onChange={(e) => updateFormData('generatedContent', e.target.value)}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Edit the content above or click quick actions below
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              updateFormData('generatedContent', formData.generatedContent + '\n\n[Add call-to-action]');
            }}>
              Add call-to-action
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              toast.info('Shortening content...');
            }}>
              Make it shorter
            </Button>
            <Button variant="outline" size="sm" onClick={() => {
              toast.info('Adding examples...');
            }}>
              Add examples
            </Button>
          </div>

          <div>
            <Label className="text-base mb-2 block">Add Media (Optional)</Label>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20">
                <div className="flex flex-col items-center gap-1">
                  <ImageIcon className="h-5 w-5" />
                  <span className="text-xs">Upload Image</span>
                </div>
              </Button>
              <Button variant="outline" className="h-20" onClick={() => {
                toast.success('AI generating image...');
                setTimeout(() => {
                  updateFormData('imageUrl', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800');
                  toast.success('Image generated!');
                }, 1500);
              }}>
                <div className="flex flex-col items-center gap-1">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-xs">AI Generate</span>
                </div>
              </Button>
            </div>
            {formData.imageUrl && (
              <div className="mt-3 relative">
                <img src={formData.imageUrl} alt="Generated" className="rounded-lg w-full max-h-48 object-cover" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => updateFormData('imageUrl', '')}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Content Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Word count</span>
                <span className="font-medium">{formData.generatedContent.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Character count</span>
                <span className="font-medium">{formData.generatedContent.length} characters</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Estimated read time</span>
                <span className="font-medium">~30 seconds</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Hashtags</span>
                <span className="font-medium">{formData.hashtags.length}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart className="h-5 w-5 text-green-600 dark:text-green-400" />
                Engagement Prediction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Expected engagement</span>
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">High (4.5/5)</span>
              </div>
              <Progress value={90} className="h-2" />
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Based on your historical performance and content type
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <Label className="text-base mb-3 block">Publish to *</Label>
        <div className="space-y-2">
          {connectedAccounts.map(account => {
            const Icon = getPlatformIcon(account.platform);
            return (
              <Card 
                key={account.id}
                className={`cursor-pointer transition-all ${formData.platforms.includes(account.platform) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}
                onClick={() => togglePlatform(account.platform)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      checked={formData.platforms.includes(account.platform)}
                      onCheckedChange={() => togglePlatform(account.platform)}
                    />
                    <Icon className="h-5 w-5" />
                    <div className="flex-1">
                      <p className="font-medium">{account.platform} - {account.accountName}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{account.handle}</p>
                    </div>
                    <Badge variant="default" className="bg-green-500">Connected</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <Label className="text-base mb-3 block">When to publish? *</Label>
        <RadioGroup value={formData.publishType} onValueChange={(v) => updateFormData('publishType', v)}>
          <Card className={`cursor-pointer ${formData.publishType === 'now' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            <CardContent className="p-4" onClick={() => updateFormData('publishType', 'now')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="now" id="now" />
                <Label htmlFor="now" className="cursor-pointer flex-1">
                  <div className="font-medium">Post Now</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Publish immediately</div>
                </Label>
              </div>
            </CardContent>
          </Card>

          <Card className={`cursor-pointer ${formData.publishType === 'schedule' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''}`}>
            <CardContent className="p-4" onClick={() => updateFormData('publishType', 'schedule')}>
              <div className="flex items-center space-x-2 mb-3">
                <RadioGroupItem value="schedule" id="schedule" />
                <Label htmlFor="schedule" className="cursor-pointer flex-1">
                  <div className="font-medium">Schedule</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Choose date and time</div>
                </Label>
              </div>
              {formData.publishType === 'schedule' && (
                <div className="grid grid-cols-2 gap-3 ml-6" onClick={(e) => e.stopPropagation()}>
                  <div>
                    <Label className="text-sm">Date</Label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => updateFormData('scheduledDate', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Time</Label>
                    <Input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => updateFormData('scheduledTime', e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </RadioGroup>

        {formData.publishType === 'schedule' && (
          <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mt-3">
            <CardContent className="p-4">
              <p className="text-sm">
                <strong>💡 Best time to post:</strong> Tuesday, 10:00 AM EST
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Based on your followers' activity
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => {
                  const bestTime = new Date();
                  bestTime.setDate(bestTime.getDate() + ((9 - bestTime.getDay()) % 7 || 7)); // Next Tuesday
                  bestTime.setHours(10, 0, 0, 0);
                  updateFormData('scheduledDate', bestTime.toISOString().split('T')[0]);
                  updateFormData('scheduledTime', '10:00');
                  toast.success('Set to optimal time!');
                }}
              >
                Schedule for This Time
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div>
        <Label className="text-base mb-3 block">Auto-Engagement Features</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={formData.autoEngage}
              onCheckedChange={(checked) => updateFormData('autoEngage', checked)}
              id="auto-engage"
            />
            <Label htmlFor="auto-engage" className="cursor-pointer">
              Auto-reply to comments (AI-powered)
            </Label>
          </div>
        </div>
      </div>
    </div>
  );

  const progress = (currentStep / 3) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Create Social Post - Step {currentStep}/3</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            Generate AI-powered social media content that matches your brand voice
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
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted ? 'bg-green-500 text-white' :
                    isActive ? 'bg-blue-600 text-white' :
                    'bg-slate-200 dark:bg-slate-700 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
                  </div>
                  <span className={`text-sm text-center max-w-[120px] ${
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
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t dark:border-slate-700">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || generating || publishing}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          {currentStep < 3 ? (
            <Button onClick={handleNext} disabled={!canProceed() || generating}>
              {generating ? 'Generating...' : 'Next'}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={!canProceed() || publishing}>
              {publishing 
                ? 'Publishing...' 
                : formData.publishType === 'now' 
                  ? 'Publish Post!' 
                  : 'Schedule Post!'
              }
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

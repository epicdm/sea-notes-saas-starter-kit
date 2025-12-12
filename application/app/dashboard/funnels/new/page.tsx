'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Spinner,
  RadioGroup,
  Radio
} from '@heroui/react';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  previewImage: string | null;
}

export default function NewFunnelPage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [funnelName, setFunnelName] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch('http://localhost:5001/f/templates');
      if (!response.ok) throw new Error('Failed to load templates');

      const data = await response.json();
      setTemplates(data.templates || []);

      // Auto-select first template
      if (data.templates && data.templates.length > 0) {
        setSelectedTemplate(data.templates[0].id);
        setFunnelName(data.templates[0].name);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!funnelName.trim()) {
      toast.error('Please enter a funnel name');
      return;
    }

    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('http://localhost:5001/api/user/funnels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Email': session?.user?.email || ''
        },
        body: JSON.stringify({
          name: funnelName,
          template_id: selectedTemplate
        })
      });

      if (!response.ok) throw new Error('Failed to create funnel');

      const data = await response.json();
      toast.success('Funnel created successfully!');
      router.push(`/dashboard/funnels/${data.id}/edit`);
    } catch (error) {
      console.error('Error creating funnel:', error);
      toast.error('Failed to create funnel');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  const groupedTemplates = templates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = [];
    }
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Funnel</h1>
          <p className="text-muted-foreground mt-1">
            Choose a template and customize your funnel
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Choose a Template</h2>
            </CardHeader>
            <CardBody className="space-y-6">
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  <RadioGroup
                    value={selectedTemplate}
                    onValueChange={(value) => {
                      setSelectedTemplate(value);
                      const template = templates.find(t => t.id === value);
                      if (template && !funnelName) {
                        setFunnelName(template.name);
                      }
                    }}
                  >
                    {categoryTemplates.map((template) => (
                      <Card
                        key={template.id}
                        isPressable
                        className={`cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? 'border-2 border-primary'
                            : 'border border-divider hover:border-primary/50'
                        }`}
                        onPress={() => {
                          setSelectedTemplate(template.id);
                          if (!funnelName) {
                            setFunnelName(template.name);
                          }
                        }}
                      >
                        <CardBody>
                          <div className="flex items-start gap-4">
                            <Radio value={template.id} />
                            <div className="flex-1">
                              <h4 className="font-semibold">{template.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {template.description}
                              </p>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        {/* Funnel Configuration */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Funnel Details</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Funnel Name"
                placeholder="My Lead Capture Funnel"
                value={funnelName}
                onValueChange={setFunnelName}
                isRequired
              />

              <div className="pt-4 space-y-3">
                <Button
                  color="primary"
                  fullWidth
                  size="lg"
                  startContent={<Sparkles className="h-4 w-4" />}
                  onPress={handleCreate}
                  isLoading={creating}
                  isDisabled={!funnelName.trim() || !selectedTemplate}
                >
                  {creating ? 'Creating...' : 'Create Funnel'}
                </Button>
                <Button
                  variant="light"
                  fullWidth
                  onPress={() => router.back()}
                  isDisabled={creating}
                >
                  Cancel
                </Button>
              </div>

              <div className="pt-4 border-t border-divider">
                <h3 className="text-sm font-semibold mb-2">What's included:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Pre-built pages and forms</li>
                  <li>✓ Customizable design</li>
                  <li>✓ Lead tracking and analytics</li>
                  <li>✓ Mobile responsive</li>
                  <li>✓ SEO optimized</li>
                </ul>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

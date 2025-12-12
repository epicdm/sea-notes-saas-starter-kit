'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Spinner,
  Chip
} from '@heroui/react';
import {
  ArrowLeft,
  Save,
  ExternalLink,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';

interface FunnelPage {
  id: string;
  pageOrder: number;
  pageType: string;
  name: string;
}

interface Funnel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  funnelType: string;
  isPublished: boolean;
  pages: FunnelPage[];
}

export default function EditFunnelPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const funnelId = params.id as string;

  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (session?.user?.email) {
      loadFunnel();
    }
  }, [session, funnelId]);

  const loadFunnel = async () => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/user/funnels/${funnelId}`,
        {
          headers: {
            'X-User-Email': session?.user?.email || ''
          }
        }
      );

      if (!response.ok) throw new Error('Failed to load funnel');

      const data = await response.json();
      setFunnel(data);
      setName(data.name);
      setDescription(data.description || '');
    } catch (error) {
      console.error('Error loading funnel:', error);
      toast.error('Failed to load funnel');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Funnel name is required');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `http://localhost:5001/api/user/funnels/${funnelId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-User-Email': session?.user?.email || ''
          },
          body: JSON.stringify({
            name,
            description: description || null
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update funnel');

      toast.success('Funnel updated successfully');
      loadFunnel();
    } catch (error) {
      console.error('Error updating funnel:', error);
      toast.error('Failed to update funnel');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!funnel) {
    return (
      <div className="text-center py-12">
        <p>Funnel not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.push('/dashboard/funnels')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Funnel</h1>
            <div className="flex items-center gap-2 mt-1">
              <Chip
                size="sm"
                color={funnel.isPublished ? 'success' : 'default'}
                variant="flat"
              >
                {funnel.isPublished ? 'Published' : 'Draft'}
              </Chip>
              <span className="text-sm text-muted-foreground">/f/{funnel.slug}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {funnel.isPublished && (
            <Button
              variant="bordered"
              startContent={<ExternalLink className="h-4 w-4" />}
              onPress={() => window.open(`/f/${funnel.slug}`, '_blank')}
            >
              Preview
            </Button>
          )}
          <Button
            variant="bordered"
            startContent={<Eye className="h-4 w-4" />}
            onPress={() => router.push(`/dashboard/funnels/${funnelId}/analytics`)}
          >
            Analytics
          </Button>
          <Button
            color="primary"
            startContent={<Save className="h-4 w-4" />}
            onPress={handleSave}
            isLoading={saving}
          >
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <Input
                label="Funnel Name"
                placeholder="My Lead Capture Funnel"
                value={name}
                onValueChange={setName}
                isRequired
              />
              <Input
                label="Description"
                placeholder="Brief description of your funnel"
                value={description}
                onValueChange={setDescription}
              />
              <div>
                <label className="text-sm font-medium">URL Slug</label>
                <div className="mt-1 p-3 bg-muted rounded-lg">
                  <code className="text-sm">/f/{funnel.slug}</code>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Pages */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Funnel Pages</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {funnel.pages
                  .sort((a, b) => a.pageOrder - b.pageOrder)
                  .map((page, index) => (
                    <div
                      key={page.id}
                      className="flex items-center justify-between p-4 border border-divider rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{page.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {page.pageType.replace('_', ' ')}
                          </p>
                        </div>
                      </div>
                      <Chip size="sm" variant="flat">
                        Page {page.pageOrder + 1}
                      </Chip>
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Funnel Settings</h2>
            </CardHeader>
            <CardBody className="space-y-4">
              <div>
                <label className="text-sm font-medium">Funnel Type</label>
                <div className="mt-1">
                  <Chip size="sm" variant="flat">
                    {funnel.funnelType.replace('_', ' ')}
                  </Chip>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="mt-1">
                  <Chip
                    size="sm"
                    color={funnel.isPublished ? 'success' : 'default'}
                    variant="flat"
                  >
                    {funnel.isPublished ? 'Published' : 'Draft'}
                  </Chip>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Total Pages</label>
                <p className="mt-1 text-2xl font-bold">{funnel.pages.length}</p>
              </div>

              <div className="pt-4 border-t border-divider">
                <p className="text-sm text-muted-foreground">
                  To edit page content, forms, and design, use the advanced page builder (coming soon).
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}

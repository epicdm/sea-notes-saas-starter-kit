'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
  Progress
} from '@heroui/react';
import {
  ArrowLeft,
  Users,
  FileText,
  TrendingUp,
  ExternalLink,
  Copy,
  Eye,
  EyeOff
} from 'lucide-react';
import { toast } from 'sonner';

interface Analytics {
  funnelId: string;
  isPublished: boolean;
  totalSubmissions: number;
  totalLeads: number;
  conversionRate: number;
  statusBreakdown: Record<string, number>;
}

interface Funnel {
  id: string;
  name: string;
  slug: string;
  isPublished: boolean;
}

export default function FunnelAnalyticsPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const funnelId = params.id as string;

  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      loadData();
    }
  }, [session, funnelId]);

  const loadData = async () => {
    try {
      // Load funnel details
      const funnelResponse = await fetch(
        `http://localhost:5001/api/user/funnels/${funnelId}`,
        {
          headers: {
            'X-User-Email': session?.user?.email || ''
          }
        }
      );

      if (!funnelResponse.ok) throw new Error('Failed to load funnel');
      const funnelData = await funnelResponse.json();
      setFunnel(funnelData);

      // Load analytics
      const analyticsResponse = await fetch(
        `http://localhost:5001/api/user/funnels/${funnelId}/analytics`,
        {
          headers: {
            'X-User-Email': session?.user?.email || ''
          }
        }
      );

      if (!analyticsResponse.ok) throw new Error('Failed to load analytics');
      const analyticsData = await analyticsResponse.json();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    if (!funnel) return;

    setPublishing(true);
    try {
      const endpoint = funnel.isPublished ? 'unpublish' : 'publish';
      const response = await fetch(
        `http://localhost:5001/api/user/funnels/${funnelId}/${endpoint}`,
        {
          method: 'POST',
          headers: {
            'X-User-Email': session?.user?.email || ''
          }
        }
      );

      if (!response.ok) throw new Error('Failed to update publish status');

      toast.success(`Funnel ${funnel.isPublished ? 'unpublished' : 'published'} successfully`);
      loadData();
    } catch (error) {
      console.error('Error toggling publish:', error);
      toast.error('Failed to update publish status');
    } finally {
      setPublishing(false);
    }
  };

  const copyPublicUrl = () => {
    if (!funnel) return;
    const url = `${window.location.origin}/f/${funnel.slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Public URL copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!funnel || !analytics) {
    return (
      <div className="text-center py-12">
        <p>Funnel not found</p>
      </div>
    );
  }

  const statusColors: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    new: 'default',
    contacted: 'primary',
    qualified: 'success',
    unqualified: 'warning',
    converted: 'success',
    lost: 'danger'
  };

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
            <h1 className="text-3xl font-bold">{funnel.name}</h1>
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
          <Button
            variant="bordered"
            startContent={<Copy className="h-4 w-4" />}
            onPress={copyPublicUrl}
          >
            Copy URL
          </Button>
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
            color={funnel.isPublished ? 'default' : 'primary'}
            startContent={funnel.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            onPress={handlePublishToggle}
            isLoading={publishing}
          >
            {funnel.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Submissions</p>
                <p className="text-3xl font-bold mt-1">{analytics.totalSubmissions}</p>
              </div>
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Leads</p>
                <p className="text-3xl font-bold mt-1">{analytics.totalLeads}</p>
              </div>
              <div className="h-12 w-12 bg-success/10 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-success" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold mt-1">{analytics.conversionRate.toFixed(1)}%</p>
              </div>
              <div className="h-12 w-12 bg-warning/10 rounded-full flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-warning" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Lead Status Breakdown */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Lead Pipeline</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          {Object.entries(analytics.statusBreakdown)
            .filter(([, count]) => count > 0)
            .map(([status, count]) => {
              const total = analytics.totalLeads;
              const percentage = total > 0 ? (count / total) * 100 : 0;

              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Chip
                        size="sm"
                        color={statusColors[status] || 'default'}
                        variant="flat"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Chip>
                      <span className="text-sm text-muted-foreground">
                        {count} lead{count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <span className="text-sm font-medium">{percentage.toFixed(1)}%</span>
                  </div>
                  <Progress
                    value={percentage}
                    color={statusColors[status] || 'default'}
                    size="sm"
                  />
                </div>
              );
            })}

          {Object.values(analytics.statusBreakdown).every(count => count === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              No leads yet. Start promoting your funnel to collect leads.
            </div>
          )}
        </CardBody>
      </Card>

      {/* Public URL Card */}
      {funnel.isPublished && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Public Funnel URL</h2>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <code className="flex-1 text-sm">
                {window.location.origin}/f/{funnel.slug}
              </code>
              <Button
                size="sm"
                isIconOnly
                variant="light"
                onPress={copyPublicUrl}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                isIconOnly
                variant="light"
                onPress={() => window.open(`/f/${funnel.slug}`, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Copy, Trash2, Share2, Calendar, Clock, TrendingUp, MessageSquare, Heart, Repeat2, Eye, Users, BarChart3, Linkedin, Twitter, Facebook, Instagram, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface SocialPostDetailPageProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  postId: string;
  accessToken: string;
  onBack: () => void;
}

export default function SocialPostDetailPage({ postId, accessToken, onBack }: SocialPostDetailPageProps) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPostDetails();
  }, [postId]);

  const loadPostDetails = async () => {
    setLoading(true);
    try {
      // Mock post data
      const mockPost = {
        id: postId,
        title: 'AI Marketing Trends 2025',
        content: `AI isn't replacing marketers – it's empowering them to work smarter.

Here's what I'm seeing in 2025:

1. AI-powered personalization is becoming the norm
2. New opportunities are emerging faster than ever
3. Those who adapt early will lead the way

What's your take on AI in marketing? Share your thoughts below.

#Innovation #AIMarketing #FutureOfWork #DigitalTransformation`,
        platforms: ['linkedin', 'twitter'],
        status: 'published',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        scheduledFor: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
        hashtags: ['#Innovation', '#AIMarketing', '#FutureOfWork', '#DigitalTransformation'],
        accounts: {
          linkedin: {
            accountName: 'John Smith',
            handle: '@johnsmith',
            postUrl: 'https://linkedin.com/post/123456',
          },
          twitter: {
            accountName: '@johnsmith',
            handle: '@johnsmith',
            postUrl: 'https://twitter.com/johnsmith/status/123456',
          },
        },
        engagement: {
          total: {
            impressions: 12450,
            reach: 8920,
            clicks: 456,
            likes: 342,
            comments: 28,
            shares: 67,
            saves: 45,
          },
          linkedin: {
            impressions: 8920,
            reach: 6420,
            clicks: 312,
            likes: 256,
            comments: 18,
            shares: 42,
          },
          twitter: {
            impressions: 3530,
            reach: 2500,
            clicks: 144,
            likes: 86,
            comments: 10,
            shares: 25,
          },
        },
        demographics: {
          topCountries: ['United States (42%)', 'United Kingdom (18%)', 'Canada (12%)'],
          topIndustries: ['Technology (35%)', 'Marketing (28%)', 'Sales (15%)'],
          audienceType: 'Professionals, 25-45',
        },
        aiGenerated: true,
        topic: 'AI automation trends',
        tone: 'professional',
      };

      setPost(mockPost);
    } catch (error) {
      console.error('Error loading post details:', error);
      toast.error('Failed to load post details');
    } finally {
      setLoading(false);
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

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      published: { variant: 'default', label: 'Published' },
      scheduled: { variant: 'secondary', label: 'Scheduled' },
      draft: { variant: 'outline', label: 'Draft' },
      failed: { variant: 'destructive', label: 'Failed' },
    };
    const config = variants[status] || variants.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  // Chart data
  const engagementOverTimeData = [
    { hour: '0-4h', impressions: 450, engagement: 12 },
    { hour: '4-8h', impressions: 1240, engagement: 34 },
    { hour: '8-12h', impressions: 3420, engagement: 98 },
    { hour: '12-16h', impressions: 4280, engagement: 142 },
    { hour: '16-20h', impressions: 2140, engagement: 76 },
    { hour: '20-24h', impressions: 920, engagement: 28 },
  ];

  const platformComparisonData = [
    { metric: 'Impressions', linkedin: 8920, twitter: 3530 },
    { metric: 'Clicks', linkedin: 312, twitter: 144 },
    { metric: 'Likes', linkedin: 256, twitter: 86 },
    { metric: 'Shares', linkedin: 42, twitter: 25 },
  ];

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading post details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MessageSquare className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-xl mb-2">Post Not Found</h3>
            <Button onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Social Media
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const engagementRate = ((post.engagement.total.likes + post.engagement.total.comments + post.engagement.total.shares) / post.engagement.total.impressions * 100).toFixed(2);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Social Media
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl tracking-tight">{post.title}</h1>
              {getStatusBadge(post.status)}
              {post.aiGenerated && (
                <Badge variant="outline" className="bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                  AI Generated
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Published {new Date(post.publishedAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(post.publishedAt).toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-2">
                {post.platforms.map((platform: string) => {
                  const Icon = getPlatformIcon(platform);
                  return <Icon key={platform} className="h-4 w-4" />;
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.info('Duplicating post...')}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button variant="outline" onClick={() => toast.info('Editing post...')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" onClick={() => toast.success('Exporting...')}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              Impressions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{post.engagement.total.impressions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Reach
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{post.engagement.total.reach.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Likes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{post.engagement.total.likes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Comments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{post.engagement.total.comments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Repeat2 className="h-4 w-4" />
              Shares
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{post.engagement.total.shares}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Engagement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{engagementRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Content Preview */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="preview" className="w-full">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="platforms">Platform Posts</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Preview Tab */}
            <TabsContent value="preview">
              <Card>
                <CardHeader>
                  <CardTitle>Post Content</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt="Post image"
                      className="w-full rounded-lg"
                    />
                  )}
                  <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                    {post.content}
                  </div>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.hashtags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Platforms Tab */}
            <TabsContent value="platforms" className="space-y-4">
              {post.platforms.map((platform: string) => {
                const Icon = getPlatformIcon(platform);
                const accountInfo = post.accounts[platform];
                const platformEngagement = post.engagement[platform];

                return (
                  <Card key={platform}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-5 w-5" />
                          <CardTitle className="text-base capitalize">{platform}</CardTitle>
                        </div>
                        {accountInfo?.postUrl && (
                          <Button variant="outline" size="sm" onClick={() => window.open(accountInfo.postUrl, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Post
                          </Button>
                        )}
                      </div>
                      <CardDescription>
                        {accountInfo?.accountName} • {accountInfo?.handle}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold">{platformEngagement?.impressions.toLocaleString()}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Impressions</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{platformEngagement?.clicks}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Clicks</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{platformEngagement?.likes}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Likes</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{platformEngagement?.shares}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Shares</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Engagement Over Time</CardTitle>
                  <CardDescription>Post performance in the first 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={engagementOverTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Legend />
                      <Line yAxisId="left" type="monotone" dataKey="impressions" stroke="#3b82f6" name="Impressions" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#10b981" name="Engagements" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Platform Comparison</CardTitle>
                  <CardDescription>Performance across different platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={platformComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="linkedin" fill="#0077b5" name="LinkedIn" />
                      <Bar dataKey="twitter" fill="#1da1f2" name="Twitter" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Post Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Post Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="text-slate-600 dark:text-slate-400 mb-1">Status</div>
                <div>{getStatusBadge(post.status)}</div>
              </div>
              <Separator />
              <div>
                <div className="text-slate-600 dark:text-slate-400 mb-1">Created</div>
                <div>{new Date(post.createdAt).toLocaleString()}</div>
              </div>
              <Separator />
              <div>
                <div className="text-slate-600 dark:text-slate-400 mb-1">Published</div>
                <div>{new Date(post.publishedAt).toLocaleString()}</div>
              </div>
              <Separator />
              <div>
                <div className="text-slate-600 dark:text-slate-400 mb-1">Topic</div>
                <div>{post.topic}</div>
              </div>
              <Separator />
              <div>
                <div className="text-slate-600 dark:text-slate-400 mb-1">Tone</div>
                <div className="capitalize">{post.tone}</div>
              </div>
            </CardContent>
          </Card>

          {/* Audience Demographics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Audience Insights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <div className="text-slate-600 dark:text-slate-400 mb-2">Top Countries</div>
                <div className="space-y-1">
                  {post.demographics.topCountries.map((country: string) => (
                    <div key={country}>{country}</div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-slate-600 dark:text-slate-400 mb-2">Top Industries</div>
                <div className="space-y-1">
                  {post.demographics.topIndustries.map((industry: string) => (
                    <div key={industry}>{industry}</div>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-slate-600 dark:text-slate-400 mb-1">Audience Type</div>
                <div>{post.demographics.audienceType}</div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Creating similar post...')}>
                <Copy className="h-4 w-4 mr-2" />
                Create Similar Post
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Sharing post...')}>
                <Share2 className="h-4 w-4 mr-2" />
                Share Again
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600" onClick={() => toast.error('Post deleted')}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Post
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

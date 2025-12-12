'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from 'react';
import { Plus, Linkedin, Twitter, Facebook, Instagram, TrendingUp, Calendar, BarChart3, FileText, Settings as SettingsIcon, Sparkles, Link as LinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CreateSocialPostWizard } from '@/components/CreateSocialPostWizard';
import { SocialTemplatesModal } from '@/components/SocialTemplatesModal';
import { BulkSchedulerModal } from '@/components/BulkSchedulerModal';

interface SocialMediaPageProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  accessToken: string;
  onNavigate?: (page: string) => void;
  onViewCalendar?: () => void;
  onViewPost?: (postId: string) => void;
}

export default function SocialMediaPage({ accessToken, onNavigate, onViewCalendar, onViewPost }: SocialMediaPageProps) {
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [showBulkScheduler, setShowBulkScheduler] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Mock data - in production would call API
      const mockAccounts = [
        {
          id: 'social_1',
          platform: 'linkedin',
          accountName: 'Sarah Johnson',
          handle: '@sarah-johnson',
          followers: 2456,
          connected: true,
          brandVoice: 'Professional yet approachable, focuses on family values and home dreams',
          avgEngagement: 4.2,
        },
      ];

      const mockPosts = [
        {
          id: 'post_1',
          platforms: ['linkedin'],
          content: 'AI isn\'t replacing marketers – it\'s empowering them to work smarter...',
          status: 'scheduled',
          scheduledFor: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          estimatedEngagement: 4.5,
        },
        {
          id: 'post_2',
          platforms: ['linkedin'],
          content: '3 lessons I learned closing 47 deals this quarter...',
          status: 'published',
          publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          actualEngagement: 5.2,
          views: 2134,
          likes: 156,
          comments: 23,
        },
      ];

      setConnectedAccounts(mockAccounts);
      setRecentPosts(mockPosts);
    } catch (error) {
      console.error('Error loading social media data:', error);
      toast.error('Failed to load data');
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

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'linkedin': return 'text-blue-600 dark:text-blue-400';
      case 'twitter': return 'text-sky-500 dark:text-sky-400';
      case 'facebook': return 'text-blue-700 dark:text-blue-500';
      case 'instagram': return 'text-pink-600 dark:text-pink-400';
      default: return 'text-blue-600';
    }
  };

  const handleConnectAccount = (platform: string) => {
    toast.info(`Connecting to ${platform}...`);
    // In production: initiate OAuth flow
  };

  const handleCreatePost = () => {
    setIsWizardOpen(true);
  };

  const handleSelectTemplate = (template: any) => {
    setSelectedTemplate(template);
    setShowTemplates(false);
    setIsWizardOpen(true);
  };

  const handlePostCreated = (post: any) => {
    setRecentPosts([post, ...recentPosts]);
    toast.success(post.status === 'published' ? 'Post published!' : 'Post scheduled!');
  };

  const handleBulkSchedule = (posts: any[]) => {
    setRecentPosts([...posts, ...recentPosts]);
    toast.success(`Successfully scheduled ${posts.length} posts!`);
  };

  const handleAnalyzeVoice = (accountId: string) => {
    toast.success('Analyzing brand voice from your posts...');
    setTimeout(() => {
      toast.success('Brand voice analysis complete!');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const hasConnectedAccounts = connectedAccounts.length > 0;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-3xl tracking-tight">AI Social Media</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Generate authentic content with AI-powered brand voice
            </p>
          </div>
          {hasConnectedAccounts && (
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowBulkScheduler(true)} size="lg">
                <Calendar className="h-5 w-5 mr-2" />
                Bulk Schedule
              </Button>
              <Button variant="outline" onClick={() => setShowTemplates(true)} size="lg">
                <Sparkles className="h-5 w-5 mr-2" />
                Templates
              </Button>
              <Button onClick={handleCreatePost} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Post
              </Button>
            </div>
          )}
        </div>
      </div>

      {!hasConnectedAccounts ? (
        // No Accounts Connected State
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex gap-3 mb-6">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <Linkedin className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-full">
                <Twitter className="h-8 w-8 text-sky-500 dark:text-sky-400" />
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                <Facebook className="h-8 w-8 text-blue-700 dark:text-blue-500" />
              </div>
              <div className="p-3 bg-pink-50 dark:bg-pink-900/20 rounded-full">
                <Instagram className="h-8 w-8 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
            <h3 className="text-2xl mb-3">Connect your social media accounts</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 text-center max-w-md">
              Connect your accounts to start generating AI-powered content that matches your unique brand voice
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleConnectAccount('LinkedIn')}
                className="border-blue-200 dark:border-blue-800"
              >
                <Linkedin className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                LinkedIn
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleConnectAccount('Twitter')}
                className="border-sky-200 dark:border-sky-800"
              >
                <Twitter className="h-5 w-5 mr-2 text-sky-500 dark:text-sky-400" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleConnectAccount('Facebook')}
                className="border-blue-200 dark:border-blue-800"
              >
                <Facebook className="h-5 w-5 mr-2 text-blue-700 dark:text-blue-500" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleConnectAccount('Instagram')}
                className="border-pink-200 dark:border-pink-800"
              >
                <Instagram className="h-5 w-5 mr-2 text-pink-600 dark:text-pink-400" />
                Instagram
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // Connected State
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Posts This Month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">24</div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    +20% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Total Reach</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">12.4K</div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Engagement Rate</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">5.2%</div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    Above average
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>New Followers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl">+340</div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                    This month
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Connected Accounts */}
            <div>
              <h3 className="text-lg mb-4">Connected Accounts</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {connectedAccounts.map((account) => {
                  const Icon = getPlatformIcon(account.platform);
                  const colorClass = getPlatformColor(account.platform);
                  return (
                    <Card key={account.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 bg-slate-100 dark:bg-slate-800 rounded-lg ${colorClass}`}>
                              <Icon className="h-6 w-6" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{account.accountName}</CardTitle>
                              <CardDescription>{account.handle}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="default" className="bg-green-500">
                            ● Connected
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Followers</span>
                          <span className="font-medium">{account.followers.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-600 dark:text-slate-400">Avg Engagement</span>
                          <span className="font-medium">{account.avgEngagement}%</span>
                        </div>
                        
                        {account.brandVoice && (
                          <div className="pt-4 border-t dark:border-slate-700">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Brand Voice:</p>
                            <p className="text-sm italic">{account.brandVoice}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleAnalyzeVoice(account.id)}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Analyze Voice
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            <SettingsIcon className="h-4 w-4 mr-2" />
                            Settings
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {/* Add Account Card */}
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Plus className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                    <h3 className="text-lg mb-2">Add Account</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4 text-center text-sm">
                      Connect another social media account
                    </p>
                    <Button variant="outline" onClick={() => toast.info('Account connection coming soon!')}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Connect Account
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Recent Posts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg">Recent Posts</h3>
                <Button variant="ghost" size="sm">
                  View All →
                </Button>
              </div>
              <div className="space-y-4">
                {recentPosts.map((post) => (
                  <Card key={post.id} className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={() => onViewPost?.(post.id)}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex gap-2">
                          {post.platforms.map((platform: string) => {
                            const Icon = getPlatformIcon(platform);
                            return (
                              <div key={platform} className={`p-1.5 bg-slate-100 dark:bg-slate-800 rounded ${getPlatformColor(platform)}`}>
                                <Icon className="h-4 w-4" />
                              </div>
                            );
                          })}
                        </div>
                        <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                          {post.status === 'published' ? 'Published' : 'Scheduled'}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 line-clamp-3">
                        {post.content}
                      </p>
                      <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                        <span>
                          {post.status === 'published' 
                            ? `${post.views?.toLocaleString()} views • ${post.likes} likes • ${post.comments} comments`
                            : `Scheduled for ${new Date(post.scheduledFor).toLocaleDateString()}`
                          }
                        </span>
                        {post.actualEngagement && (
                          <span className="text-green-600 dark:text-green-400">
                            {post.actualEngagement}% engagement
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <FileText className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl mb-2">Posts Library</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Manage all your content in one place
                </p>
                <Button onClick={handleCreatePost}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Post
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <Card className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" onClick={onViewCalendar}>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl mb-2">Content Calendar</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Plan and schedule your content
                </p>
                <Button onClick={handleCreatePost}>
                  <Plus className="h-5 w-5 mr-2" />
                  Schedule Post
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <BarChart3 className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl mb-2">Performance Analytics</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Track engagement and growth metrics
                </p>
                <Button variant="outline">
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Bulk Scheduler Modal */}
      <BulkSchedulerModal
        open={showBulkScheduler}
        onClose={() => setShowBulkScheduler(false)}
        onSchedule={handleBulkSchedule}
        connectedAccounts={connectedAccounts}
      />

      {/* Templates Modal */}
      <SocialTemplatesModal
        open={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Create Post Wizard */}
      <CreateSocialPostWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setSelectedTemplate(null);
        }}
        onPostCreated={handlePostCreated}
        connectedAccounts={connectedAccounts}
        accessToken={accessToken}
        initialTemplate={selectedTemplate}
      />
    </div>
  );
}

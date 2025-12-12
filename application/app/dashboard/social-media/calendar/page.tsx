'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Filter, Linkedin, Twitter, Facebook, Instagram, Clock, Eye, Edit, Trash2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface SocialMediaCalendarPageProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  accessToken: string;
  onBack: () => void;
  onCreatePost: () => void;
  onViewPost: (postId: string) => void;
}

export default function SocialMediaCalendarPage({ accessToken, onBack, onCreatePost, onViewPost }: SocialMediaCalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setLoading(true);
    try {
      // Generate mock scheduled posts
      const mockPosts = generateMockPosts(30);
      setPosts(mockPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const generateMockPosts = (count: number) => {
    const platforms = ['linkedin', 'twitter', 'facebook', 'instagram'];
    const statuses = ['scheduled', 'published', 'draft', 'failed'];
    const titles = [
      'AI Marketing Trends 2025',
      'Customer Success Story',
      'Product Launch Announcement',
      'Industry Insights',
      'Team Spotlight',
      'Weekly Tips',
      'Behind the Scenes',
      'Q&A Session',
    ];

    return Array.from({ length: count }, (_, i) => {
      const daysOffset = Math.floor(Math.random() * 30) - 15; // -15 to +15 days
      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + daysOffset);
      scheduledDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), 0, 0);

      return {
        id: `post_${i}`,
        title: titles[i % titles.length],
        content: 'AI isn\'t replacing professionals – it\'s empowering them to work smarter...',
        platforms: [platforms[Math.floor(Math.random() * platforms.length)]],
        status: daysOffset < 0 ? 'published' : statuses[Math.floor(Math.random() * statuses.length)],
        scheduledFor: scheduledDate.toISOString(),
        engagement: daysOffset < 0 ? {
          likes: Math.floor(Math.random() * 500),
          comments: Math.floor(Math.random() * 50),
          shares: Math.floor(Math.random() * 100),
        } : null,
      };
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-500';
      case 'scheduled': return 'bg-blue-500';
      case 'draft': return 'bg-gray-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const getPostsForDate = (date: Date) => {
    return posts.filter(post => {
      const postDate = new Date(post.scheduledFor);
      return postDate.toDateString() === date.toDateString() &&
        (platformFilter === 'all' || post.platforms.includes(platformFilter));
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-[120px] bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === new Date().toDateString();
      const dayPosts = getPostsForDate(date);

      days.push(
        <div
          key={day}
          className={`min-h-[120px] border border-slate-200 dark:border-slate-700 p-2 ${
            isToday ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-500' : 'bg-white dark:bg-slate-800'
          } hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors`}
        >
          <div className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            {day}
            {isToday && <Badge variant="default" className="ml-2 text-xs">Today</Badge>}
          </div>
          <div className="space-y-1">
            {dayPosts.slice(0, 3).map(post => {
              const Icon = getPlatformIcon(post.platforms[0]);
              return (
                <div
                  key={post.id}
                  className="text-xs p-2 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 cursor-pointer transition-colors"
                  onClick={() => onViewPost(post.id)}
                >
                  <div className="flex items-center gap-1 mb-1">
                    <Icon className="h-3 w-3" />
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(post.status)}`}></span>
                    <span className="font-medium truncate flex-1">{new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="truncate text-slate-600 dark:text-slate-400">
                    {post.title}
                  </div>
                </div>
              );
            })}
            {dayPosts.length > 3 && (
              <div className="text-xs text-slate-500 dark:text-slate-400 pl-2">
                +{dayPosts.length - 3} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const renderWeekView = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    return (
      <div className="space-y-4">
        {[0, 1, 2, 3, 4, 5, 6].map(dayOffset => {
          const date = new Date(startOfWeek);
          date.setDate(startOfWeek.getDate() + dayOffset);
          const isToday = date.toDateString() === today.toDateString();
          const dayPosts = getPostsForDate(date);

          return (
            <Card key={dayOffset} className={isToday ? 'border-blue-500' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {date.toLocaleDateString('en-US', { weekday: 'long' })}
                      {isToday && <Badge variant="default" className="ml-2">Today</Badge>}
                    </CardTitle>
                    <CardDescription>{date.toLocaleDateString()}</CardDescription>
                  </div>
                  <Button size="sm" variant="outline" onClick={onCreatePost}>
                    <Plus className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {dayPosts.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No posts scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {dayPosts.map(post => {
                      const Icon = getPlatformIcon(post.platforms[0]);
                      return (
                        <div
                          key={post.id}
                          className="flex items-start gap-3 p-3 rounded-lg border dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
                          onClick={() => onViewPost(post.id)}
                        >
                          <Icon className="h-5 w-5 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{post.title}</span>
                              <Badge variant="outline" className={getStatusColor(post.status)}>
                                {post.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                              {post.content}
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(post.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              {post.engagement && (
                                <>
                                  <span>👍 {post.engagement.likes}</span>
                                  <span>💬 {post.engagement.comments}</span>
                                  <span>🔄 {post.engagement.shares}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toast.info('Editing post...'); }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); toast.success('Post duplicated!'); }}>
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Social Media
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl tracking-tight mb-2">Content Calendar</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Schedule and manage your social media posts
            </p>
          </div>
          <Button onClick={onCreatePost}>
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[200px] text-center">
              <span className="text-lg font-semibold">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Platforms</SelectItem>
              <SelectItem value="linkedin">LinkedIn</SelectItem>
              <SelectItem value="twitter">Twitter</SelectItem>
              <SelectItem value="facebook">Facebook</SelectItem>
              <SelectItem value="instagram">Instagram</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-1 border rounded-lg dark:border-slate-700">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
            >
              Month
            </Button>
            <Button
              variant={viewMode === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('week')}
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>Published</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-gray-500"></span>
          <span>Draft</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span>Failed</span>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'month' ? (
        <div className="grid grid-cols-7 gap-px bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
          {/* Day headers */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="bg-slate-100 dark:bg-slate-800 p-3 text-center font-medium text-sm">
              {day}
            </div>
          ))}
          {/* Calendar days */}
          {renderMonthView()}
        </div>
      ) : (
        <div>
          {renderWeekView()}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mt-8">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Scheduled Posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {posts.filter(p => p.status === 'scheduled').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Published This Week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {posts.filter(p => {
                const postDate = new Date(p.scheduledFor);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return p.status === 'published' && postDate > weekAgo;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">
              {posts.reduce((sum, p) => sum + (p.engagement?.likes || 0), 0)}
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Likes</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Avg Engagement Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl">4.2%</div>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">+0.8% vs last week</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

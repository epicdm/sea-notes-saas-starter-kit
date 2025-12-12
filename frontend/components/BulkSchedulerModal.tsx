import { useState } from 'react';
import { X, Upload, Calendar, Plus, Trash2, Copy, Check, AlertCircle, Sparkles, Clock, TrendingUp, Download, FileText, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

interface BulkSchedulerModalProps {
  open: boolean;
  onClose: () => void;
  onSchedule: (posts: any[]) => void;
  connectedAccounts: any[];
}

export function BulkSchedulerModal({ open, onClose, onSchedule, connectedAccounts }: BulkSchedulerModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [posts, setPosts] = useState<any[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [scheduling, setScheduling] = useState(false);

  // Best times configuration
  const bestTimes = {
    linkedin: [
      { day: 'Tuesday', time: '10:00', reason: 'Highest engagement' },
      { day: 'Wednesday', time: '12:00', reason: 'Lunch hour peak' },
      { day: 'Thursday', time: '09:00', reason: 'Morning routine' },
    ],
    twitter: [
      { day: 'Monday', time: '12:00', reason: 'Lunch break' },
      { day: 'Wednesday', time: '15:00', reason: 'Mid-afternoon' },
      { day: 'Friday', time: '10:00', reason: 'End of week' },
    ],
    facebook: [
      { day: 'Tuesday', time: '13:00', reason: 'Peak activity' },
      { day: 'Thursday', time: '11:00', reason: 'High reach' },
      { day: 'Saturday', time: '10:00', reason: 'Weekend audience' },
    ],
  };

  const handleAddPost = () => {
    const newPost = {
      id: `post_${Date.now()}`,
      content: '',
      platforms: [],
      scheduledDate: '',
      scheduledTime: '',
      status: 'draft',
    };
    setPosts([...posts, newPost]);
  };

  const handleUpdatePost = (id: string, field: string, value: any) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, [field]: value } : post
    ));
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(post => post.id !== id));
    setSelectedPosts(selectedPosts.filter(postId => postId !== id));
  };

  const handleDuplicatePost = (id: string) => {
    const postToDuplicate = posts.find(post => post.id === id);
    if (postToDuplicate) {
      const newPost = {
        ...postToDuplicate,
        id: `post_${Date.now()}`,
      };
      setPosts([...posts, newPost]);
      toast.success('Post duplicated');
    }
  };

  const handleSelectPost = (id: string) => {
    if (selectedPosts.includes(id)) {
      setSelectedPosts(selectedPosts.filter(postId => postId !== id));
    } else {
      setSelectedPosts([...selectedPosts, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === posts.length) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(posts.map(post => post.id));
    }
  };

  const handleApplyBestTimes = () => {
    const updatedPosts = posts.map((post, index) => {
      const platform = post.platforms[0] || 'linkedin';
      const bestTimeOptions = bestTimes[platform as keyof typeof bestTimes] || bestTimes.linkedin;
      const bestTime = bestTimeOptions[index % bestTimeOptions.length];
      
      // Calculate next occurrence of the day
      const today = new Date();
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const targetDay = daysOfWeek.indexOf(bestTime.day);
      const currentDay = today.getDay();
      const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysUntilTarget);
      
      return {
        ...post,
        scheduledDate: targetDate.toISOString().split('T')[0],
        scheduledTime: bestTime.time,
      };
    });
    
    setPosts(updatedPosts);
    toast.success('Best times applied to all posts');
  };

  const handleImportCSV = () => {
    // Simulate CSV import
    const samplePosts = [
      {
        id: `post_${Date.now()}_1`,
        content: 'Excited to share our latest product update! 🚀\n\nNew features include:\n• Advanced analytics\n• Better performance\n• Improved UX\n\nTry it today!',
        platforms: ['linkedin', 'twitter'],
        scheduledDate: '',
        scheduledTime: '',
        status: 'draft',
      },
      {
        id: `post_${Date.now()}_2`,
        content: 'Customer success story: How @CompanyName increased conversions by 300% 📈\n\nRead the full case study: [link]',
        platforms: ['linkedin', 'facebook'],
        scheduledDate: '',
        scheduledTime: '',
        status: 'draft',
      },
      {
        id: `post_${Date.now()}_3`,
        content: '💡 Quick Tip Tuesday!\n\nWant to improve your social media engagement?\n\n1. Post consistently\n2. Use visuals\n3. Engage with comments\n\nWhat works for you?',
        platforms: ['twitter', 'linkedin'],
        scheduledDate: '',
        scheduledTime: '',
        status: 'draft',
      },
    ];
    
    setPosts(samplePosts);
    toast.success('3 posts imported from CSV');
  };

  const handleScheduleAll = async () => {
    // Validate all posts
    const invalidPosts = posts.filter(post => 
      !post.content || 
      post.platforms.length === 0 || 
      !post.scheduledDate || 
      !post.scheduledTime
    );
    
    if (invalidPosts.length > 0) {
      toast.error(`${invalidPosts.length} post(s) are incomplete. Please fill in all required fields.`);
      return;
    }
    
    setScheduling(true);
    
    // Simulate scheduling
    setTimeout(() => {
      onSchedule(posts);
      setScheduling(false);
      toast.success(`Successfully scheduled ${posts.length} posts!`);
      onClose();
      setPosts([]);
      setCurrentStep(1);
    }, 2000);
  };

  const getCompletionPercentage = () => {
    if (posts.length === 0) return 0;
    
    const totalFields = posts.length * 4; // content, platforms, date, time
    let completedFields = 0;
    
    posts.forEach(post => {
      if (post.content) completedFields++;
      if (post.platforms.length > 0) completedFields++;
      if (post.scheduledDate) completedFields++;
      if (post.scheduledTime) completedFields++;
    });
    
    return Math.round((completedFields / totalFields) * 100);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl mb-2">Add Posts to Schedule</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Import from CSV, use templates, or create manually
              </p>
            </div>

            {/* Import Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={handleImportCSV}>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Upload className="h-12 w-12 text-blue-600 dark:text-blue-400 mb-3" />
                  <h4 className="font-medium mb-1">Import CSV</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    Upload a CSV file with your posts
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={() => toast.info('Templates coming soon!')}>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Sparkles className="h-12 w-12 text-purple-600 dark:text-purple-400 mb-3" />
                  <h4 className="font-medium mb-1">Use Templates</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    Start from proven templates
                  </p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-blue-500 transition-colors" onClick={handleAddPost}>
                <CardContent className="flex flex-col items-center justify-center py-8">
                  <Plus className="h-12 w-12 text-green-600 dark:text-green-400 mb-3" />
                  <h4 className="font-medium mb-1">Create Manually</h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                    Write your own posts
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Posts List */}
            {posts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">Your Posts ({posts.length})</h4>
                    <Button variant="outline" size="sm" onClick={handleAddPost}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Another
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={handleSelectAll}>
                      {selectedPosts.length === posts.length ? 'Deselect All' : 'Select All'}
                    </Button>
                    {selectedPosts.length > 0 && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          selectedPosts.forEach(id => handleDeletePost(id));
                          toast.success(`${selectedPosts.length} posts deleted`);
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected ({selectedPosts.length})
                      </Button>
                    )}
                  </div>
                </div>

                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {posts.map((post, index) => (
                      <Card key={post.id} className={selectedPosts.includes(post.id) ? 'border-blue-500' : ''}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedPosts.includes(post.id)}
                              onCheckedChange={() => handleSelectPost(post.id)}
                            />
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">Post {index + 1}</Badge>
                                {!post.content && <Badge variant="destructive">Missing content</Badge>}
                                {post.platforms.length === 0 && <Badge variant="destructive">No platforms</Badge>}
                                {(!post.scheduledDate || !post.scheduledTime) && <Badge variant="destructive">No schedule</Badge>}
                              </div>
                              
                              <Textarea
                                placeholder="Write your post content..."
                                value={post.content}
                                onChange={(e) => handleUpdatePost(post.id, 'content', e.target.value)}
                                rows={3}
                              />
                              
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDuplicatePost(post.id)}
                                >
                                  <Copy className="h-4 w-4 mr-2" />
                                  Duplicate
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePost(post.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl mb-2">Configure Platforms & Timing</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Choose platforms and schedule for each post
              </p>
            </div>

            {/* AI Optimization */}
            <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardContent className="p-4 flex items-start gap-3">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium mb-1">AI-Optimized Scheduling</h4>
                  <p className="text-sm text-slate-700 dark:text-slate-300 mb-3">
                    We can automatically schedule your posts at the best times for maximum engagement
                  </p>
                  <Button size="sm" onClick={handleApplyBestTimes}>
                    <Clock className="h-4 w-4 mr-2" />
                    Apply Best Times
                  </Button>
                </div>
              </CardContent>
            </Card>

            <ScrollArea className="h-[500px]">
              <div className="space-y-4">
                {posts.map((post, index) => (
                  <Card key={post.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">Post {index + 1}</CardTitle>
                        <Badge variant="outline">
                          {post.content.length} characters
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {post.content || 'No content'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Platforms */}
                      <div>
                        <Label className="mb-2 block">Platforms *</Label>
                        <div className="flex gap-2">
                          {['linkedin', 'twitter', 'facebook', 'instagram'].map(platform => (
                            <Button
                              key={platform}
                              variant={post.platforms.includes(platform) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => {
                                const newPlatforms = post.platforms.includes(platform)
                                  ? post.platforms.filter((p: string) => p !== platform)
                                  : [...post.platforms, platform];
                                handleUpdatePost(post.id, 'platforms', newPlatforms);
                              }}
                              className="capitalize"
                            >
                              {platform}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`date-${post.id}`}>Date *</Label>
                          <Input
                            id={`date-${post.id}`}
                            type="date"
                            value={post.scheduledDate}
                            onChange={(e) => handleUpdatePost(post.id, 'scheduledDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`time-${post.id}`}>Time *</Label>
                          <Input
                            id={`time-${post.id}`}
                            type="time"
                            value={post.scheduledTime}
                            onChange={(e) => handleUpdatePost(post.id, 'scheduledTime', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Best Time Suggestion */}
                      {post.platforms.length > 0 && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                          <div className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                            <div className="text-sm">
                              <div className="font-medium mb-1">Best time for {post.platforms[0]}:</div>
                              <div className="text-slate-600 dark:text-slate-400">
                                {bestTimes[post.platforms[0] as keyof typeof bestTimes]?.[0].day} at{' '}
                                {bestTimes[post.platforms[0] as keyof typeof bestTimes]?.[0].time} -{' '}
                                {bestTimes[post.platforms[0] as keyof typeof bestTimes]?.[0].reason}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        );

      case 3:
        const completion = getCompletionPercentage();
        const readyToSchedule = completion === 100;

        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl mb-2">Review & Schedule</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Review your posts before scheduling
              </p>
            </div>

            {/* Completion Status */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium mb-1">Setup Progress</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {readyToSchedule ? 'All posts are ready!' : 'Complete all fields to schedule'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{completion}%</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Complete</div>
                  </div>
                </div>
                <Progress value={completion} className="h-2" />
              </CardContent>
            </Card>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold mb-1">{posts.length}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Posts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold mb-1">
                    {posts.reduce((sum, post) => sum + post.platforms.length, 0)}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Platform Posts</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-3xl font-bold mb-1">
                    {new Set(posts.flatMap(post => post.platforms)).size}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Platforms</div>
                </CardContent>
              </Card>
            </div>

            {/* Posts Preview */}
            <div>
              <h4 className="font-medium mb-3">Posts to Schedule</h4>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {posts.map((post, index) => {
                    const isComplete = post.content && post.platforms.length > 0 && post.scheduledDate && post.scheduledTime;
                    
                    return (
                      <Card key={post.id} className={isComplete ? 'border-green-500' : 'border-red-500'}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {isComplete ? (
                              <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">Post {index + 1}</Badge>
                                {isComplete ? (
                                  <Badge className="bg-green-500">Ready</Badge>
                                ) : (
                                  <Badge variant="destructive">Incomplete</Badge>
                                )}
                              </div>
                              <p className="text-sm mb-2 line-clamp-2">{post.content}</p>
                              <div className="flex flex-wrap gap-2 text-sm text-slate-600 dark:text-slate-400">
                                {post.platforms.length > 0 && (
                                  <span className="capitalize">{post.platforms.join(', ')}</span>
                                )}
                                {post.scheduledDate && post.scheduledTime && (
                                  <span>
                                    • {new Date(post.scheduledDate).toLocaleDateString()} at {post.scheduledTime}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            {!readyToSchedule && (
              <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium mb-1">Action Required</h4>
                    <p className="text-sm">
                      Some posts are missing required information. Go back to complete all fields.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">Bulk Post Scheduler</DialogTitle>
          <DialogDescription>
            Schedule multiple posts at once for maximum efficiency
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-y dark:border-slate-700">
          <div className="flex items-center justify-between">
            {[
              { num: 1, title: 'Add Posts' },
              { num: 2, title: 'Configure' },
              { num: 3, title: 'Review' },
            ].map((step, index) => (
              <div key={step.num} className="flex items-center flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      currentStep === step.num
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.num
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {currentStep > step.num ? <Check className="h-5 w-5" /> : step.num}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{step.title}</div>
                    {currentStep === step.num && (
                      <div className="text-xs text-slate-600 dark:text-slate-400">Current step</div>
                    )}
                  </div>
                </div>
                {index < 2 && (
                  <div className="flex-1 h-0.5 bg-slate-200 dark:bg-slate-700 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="px-6 pb-6">
          <ScrollArea className="max-h-[calc(90vh-300px)]">
            {renderStepContent()}
          </ScrollArea>
        </div>

        {/* Footer */}
        <div className="p-6 pt-0 border-t dark:border-slate-700 flex items-center justify-between">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Back
              </Button>
            )}
            {currentStep < 3 ? (
              <Button 
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={currentStep === 1 && posts.length === 0}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleScheduleAll}
                disabled={getCompletionPercentage() !== 100 || scheduling}
              >
                {scheduling ? (
                  <>
                    <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-r-transparent mr-2"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule All {posts.length} Posts
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

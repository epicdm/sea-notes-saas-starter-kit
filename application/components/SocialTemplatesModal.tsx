import { useState } from 'react';
import { X, Search, Tag, Star, Copy, Eye, Sparkles, TrendingUp, Calendar, Heart, MessageSquare, Share2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

interface SocialTemplatesModalProps {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: any) => void;
}

export function SocialTemplatesModal({ open, onClose, onSelectTemplate }: SocialTemplatesModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Mock templates
  const templates = [
    {
      id: 1,
      title: 'Product Launch Announcement',
      content: `🚀 Excited to announce our latest innovation!

[Product Name] is here to revolutionize the way you [benefit].

✨ Key features:
• [Feature 1]
• [Feature 2]
• [Feature 3]

Try it today: [link]

#ProductLaunch #Innovation #[YourBrand]`,
      category: 'announcement',
      platforms: ['linkedin', 'twitter', 'facebook'],
      engagement: { likes: 245, comments: 18, shares: 34 },
      performance: 'high',
      tags: ['product', 'launch', 'announcement'],
    },
    {
      id: 2,
      title: 'Customer Success Story',
      content: `💙 Customer Spotlight: [Customer Name]

"[Compelling quote about how your product/service helped them]"

Here's how [Customer Name] achieved [specific result] using [your solution]:

📈 [Metric 1]
⚡ [Metric 2]
🎯 [Metric 3]

See their full story: [link]

#CustomerSuccess #CaseStudy #[Industry]`,
      category: 'testimonial',
      platforms: ['linkedin', 'facebook'],
      engagement: { likes: 189, comments: 24, shares: 42 },
      performance: 'high',
      tags: ['testimonial', 'case-study', 'success'],
    },
    {
      id: 3,
      title: 'Industry Insights & Trends',
      content: `📊 [Industry] Trends Alert

We're seeing 3 major shifts that will shape [industry] in 2025:

1️⃣ [Trend 1] - Why it matters
2️⃣ [Trend 2] - How to prepare
3️⃣ [Trend 3] - What's next

What trends are you watching? Let's discuss 👇

#[Industry] #Trends #FutureOfWork`,
      category: 'educational',
      platforms: ['linkedin', 'twitter'],
      engagement: { likes: 312, comments: 45, shares: 67 },
      performance: 'high',
      tags: ['insights', 'trends', 'industry'],
    },
    {
      id: 4,
      title: 'Behind The Scenes',
      content: `👋 Behind the scenes at [Company]!

Here's what a day looks like for our [team/department]:

☕ Morning standup & goal setting
💡 Brainstorming session
🛠️ Building amazing things
🎉 Celebrating small wins

We're always learning, growing, and having fun along the way.

What does your day look like? 

#CompanyCulture #TeamWork #BehindTheScenes`,
      category: 'culture',
      platforms: ['linkedin', 'instagram', 'facebook'],
      engagement: { likes: 156, comments: 12, shares: 19 },
      performance: 'medium',
      tags: ['culture', 'team', 'behind-the-scenes'],
    },
    {
      id: 5,
      title: 'Weekly Tips & Advice',
      content: `💡 [Day] Tips: [Topic]

Quick tips to help you [achieve goal]:

✅ Tip #1: [Brief explanation]
✅ Tip #2: [Brief explanation]
✅ Tip #3: [Brief explanation]

💬 Which tip resonates with you most? Drop a comment!

Bookmark this for later 🔖

#Tips #Advice #[Category]`,
      category: 'educational',
      platforms: ['linkedin', 'twitter', 'facebook'],
      engagement: { likes: 223, comments: 31, shares: 28 },
      performance: 'high',
      tags: ['tips', 'advice', 'educational'],
    },
    {
      id: 6,
      title: 'Event Promotion',
      content: `📅 Save the Date!

Join us for [Event Name] on [Date]

🎯 What: [Brief description]
📍 Where: [Location/Platform]
⏰ When: [Date & Time]
🎟️ Register: [Link]

You'll learn:
• [Learning point 1]
• [Learning point 2]
• [Learning point 3]

Limited spots available. Reserve yours today!

#Event #Webinar #[Topic]`,
      category: 'event',
      platforms: ['linkedin', 'facebook', 'twitter'],
      engagement: { likes: 134, comments: 19, shares: 45 },
      performance: 'medium',
      tags: ['event', 'webinar', 'promotion'],
    },
    {
      id: 7,
      title: 'Question & Discussion',
      content: `🤔 Let's discuss: [Thought-provoking question]

We've been thinking about [topic] and want to hear your perspective.

Some things to consider:
• [Point 1]
• [Point 2]
• [Point 3]

Drop your thoughts in the comments 👇

No wrong answers - let's learn from each other!

#Discussion #Community #[Topic]`,
      category: 'engagement',
      platforms: ['linkedin', 'twitter', 'facebook'],
      engagement: { likes: 267, comments: 89, shares: 34 },
      performance: 'high',
      tags: ['question', 'discussion', 'engagement'],
    },
    {
      id: 8,
      title: 'Achievement & Milestone',
      content: `🎉 Milestone Alert!

We're thrilled to share that we've reached [milestone]!

This wouldn't be possible without:
💙 Our amazing customers
🌟 Our dedicated team
🤝 Our supportive partners

Thank you for being part of our journey.

Here's to the next chapter! 🚀

#Milestone #ThankYou #Growth`,
      category: 'announcement',
      platforms: ['linkedin', 'facebook', 'instagram'],
      engagement: { likes: 412, comments: 67, shares: 89 },
      performance: 'high',
      tags: ['milestone', 'achievement', 'celebration'],
    },
  ];

  const categories = [
    { id: 'all', label: 'All Templates', count: templates.length },
    { id: 'announcement', label: 'Announcements', count: templates.filter(t => t.category === 'announcement').length },
    { id: 'educational', label: 'Educational', count: templates.filter(t => t.category === 'educational').length },
    { id: 'testimonial', label: 'Testimonials', count: templates.filter(t => t.category === 'testimonial').length },
    { id: 'engagement', label: 'Engagement', count: templates.filter(t => t.category === 'engagement').length },
    { id: 'culture', label: 'Culture', count: templates.filter(t => t.category === 'culture').length },
    { id: 'event', label: 'Events', count: templates.filter(t => t.category === 'event').length },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: any) => {
    onSelectTemplate(template);
    toast.success('Template loaded! Customize it to match your brand.');
    onClose();
  };

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'high':
        return <Badge className="bg-green-500">High Performing</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium</Badge>;
      default:
        return <Badge variant="outline">New</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl">Content Templates</DialogTitle>
          <DialogDescription>
            Choose from proven templates to create engaging social media posts
          </DialogDescription>
        </DialogHeader>

        <div className="px-6">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto">
              {categories.map(cat => (
                <TabsTrigger key={cat.id} value={cat.id}>
                  {cat.label} ({cat.count})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Templates Grid */}
        <ScrollArea className="h-[500px] px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:border-blue-500 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base mb-2">{template.title}</CardTitle>
                      <div className="flex flex-wrap gap-1">
                        {template.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {getPerformanceBadge(template.performance)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Content Preview */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm max-h-32 overflow-hidden relative">
                    <div className="whitespace-pre-wrap line-clamp-4">
                      {template.content}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 dark:from-slate-800 to-transparent"></div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {template.engagement.likes}
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {template.engagement.comments}
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      {template.engagement.shares}
                    </div>
                  </div>

                  {/* Platforms */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Works on:</span>
                    <div className="flex gap-1">
                      {template.platforms.map(platform => (
                        <Badge key={platform} variant="secondary" className="text-xs capitalize">
                          {platform}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => handleUseTemplate(template)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Use Template
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => toast.info('Preview coming soon!')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl mb-2">No templates found</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search or category filter
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        <div className="p-6 pt-0 border-t dark:border-slate-700 flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            <Sparkles className="inline h-4 w-4 mr-1" />
            All templates are AI-optimized for engagement
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

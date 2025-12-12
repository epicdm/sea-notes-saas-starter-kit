import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Play, Pause, Download, Copy, Loader2, ThumbsUp, ThumbsDown, Tag, MessageSquare, TrendingUp, TrendingDown, Clock, DollarSign, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CallDetailPageProps {
  callId: string;
  accessToken: string;
  onBack: () => void;
}

export function CallDetailPage({ callId, accessToken, onBack }: CallDetailPageProps) {
  const [call, setCall] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    loadCallDetail();
  }, [callId]);

  const loadCallDetail = async () => {
    try {
      setIsLoading(true);
      // Mock comprehensive call center data
      setCall({
        id: callId,
        from: "+1 (555) 123-4567",
        to: "+1 (555) 987-6543",
        direction: "inbound",
        startedAt: "2025-10-31T14:23:45Z",
        endedAt: "2025-10-31T14:27:52Z",
        duration: 247,
        outcome: "success",
        disposition: "interested",
        agentName: "Sales Bot",
        voiceUsed: "OpenAI Alloy",
        llmModel: "GPT-4",
        systemInstructions: "You are a helpful sales assistant...",
        recordingUrl: "https://example.com/recording.mp3",
        costs: {
          stt: 0.12,
          llm: 0.34,
          tts: 0.18,
          telecom: 0.45,
          total: 1.09
        },
        // Call Center Metrics
        metrics: {
          waitTime: 0,
          talkTime: 247,
          holdTime: 0,
          transferCount: 0,
          callQuality: 4.5,
          customerSatisfaction: 5,
          silencePercentage: 8,
          overtalkPercentage: 3
        },
        // AI Analysis
        aiAnalysis: {
          sentiment: "positive",
          sentimentScore: 0.82,
          topics: ["product inquiry", "pricing", "features"],
          keyPhrases: ["interested in demo", "budget approval needed", "follow up next week"],
          intent: "purchase_interest",
          summary: "Customer called inquiring about the product features and pricing. Showed strong interest and requested a demo. Budget approval needed from management. Scheduled follow-up call for next week.",
          actionItems: [
            "Send product demo link",
            "Prepare pricing proposal",
            "Schedule follow-up call for next Tuesday"
          ],
          concerns: ["pricing compared to competitors"],
          opportunities: ["enterprise package interest", "multi-year contract potential"]
        },
        // Transcript with detailed timestamps and speaker diarization
        transcript: [
          { 
            speaker: "customer", 
            timestamp: "00:00",
            absoluteTime: "14:23:45",
            text: "Hello, I'm interested in learning more about your AI voice agent platform.",
            sentiment: "neutral",
            confidence: 0.95
          },
          { 
            speaker: "agent", 
            timestamp: "00:03",
            absoluteTime: "14:23:48", 
            text: "Hi! Thank you for calling. I'd be happy to help you learn more about our platform. What specific aspects are you most interested in?",
            sentiment: "positive",
            confidence: 0.98
          },
          { 
            speaker: "customer", 
            timestamp: "00:12",
            absoluteTime: "14:23:57",
            text: "I need something for our customer support team. We get about 500 calls per day and want to automate the initial screening.",
            sentiment: "neutral",
            confidence: 0.96
          },
          { 
            speaker: "agent", 
            timestamp: "00:22",
            absoluteTime: "14:24:07",
            text: "That's a perfect use case for our platform. Our AI agents can handle initial call screening, gather customer information, and route calls to the appropriate department. Can you tell me more about your current process?",
            sentiment: "positive",
            confidence: 0.97
          },
          { 
            speaker: "customer", 
            timestamp: "00:35",
            absoluteTime: "14:24:20",
            text: "Right now, customers wait in a queue and our team manually handles everything. We're looking to reduce wait times and free up our agents for complex issues.",
            sentiment: "slightly_negative",
            confidence: 0.94
          },
          { 
            speaker: "agent", 
            timestamp: "00:48",
            absoluteTime: "14:24:33",
            text: "I understand. Our AI agents can reduce wait times by 80% and handle routine inquiries automatically. For 500 calls per day, you'd save significant time and costs. Would you like to see a demo?",
            sentiment: "positive",
            confidence: 0.99
          },
          { 
            speaker: "customer", 
            timestamp: "00:58",
            absoluteTime: "14:24:43",
            text: "Yes, absolutely! What about pricing? We need to get budget approval.",
            sentiment: "interested",
            confidence: 0.97
          },
          { 
            speaker: "agent", 
            timestamp: "01:05",
            absoluteTime: "14:24:50",
            text: "Great! Our pricing is usage-based. For 500 calls per day, you'd be looking at approximately $800-1200 per month depending on call duration. I can send you a detailed proposal. When would be a good time for the demo?",
            sentiment: "positive",
            confidence: 0.98
          },
          { 
            speaker: "customer", 
            timestamp: "01:20",
            absoluteTime: "14:25:05",
            text: "Next Tuesday would work. Can you send the proposal today so I can review it before our meeting?",
            sentiment: "positive",
            confidence: 0.96
          },
          { 
            speaker: "agent", 
            timestamp: "01:28",
            absoluteTime: "14:25:13",
            text: "Absolutely! I'll send the proposal within the next hour. Let me schedule our demo for next Tuesday. What time works best for you?",
            sentiment: "positive",
            confidence: 0.99
          }
        ],
        tags: ["high-priority", "demo-scheduled", "enterprise"],
        notes: "Strong lead. Budget authority confirmed. Very interested in enterprise features."
      });
      setNotes(call?.notes || "");
      setTags(call?.tags || []);
    } catch (error) {
      console.error('Error loading call detail:', error);
      toast.error("Failed to load call details");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const copyTranscript = () => {
    if (call?.transcript) {
      const text = call.transcript.map((t: any) => 
        `[${t.timestamp}] ${t.speaker.toUpperCase()}: ${t.text}`
      ).join('\n');
      navigator.clipboard.writeText(text);
      toast.success("Transcript copied to clipboard");
    }
  };

  const downloadRecording = () => {
    toast.success("Recording download started");
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
      toast.success("Tag added");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
    toast.success("Tag removed");
  };

  const saveNotes = () => {
    toast.success("Notes saved successfully");
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'interested':
        return 'text-green-600 bg-green-50';
      case 'negative':
      case 'slightly_negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case 'positive':
      case 'interested':
        return <TrendingUp className="h-4 w-4" />;
      case 'negative':
      case 'slightly_negative':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Calls
        </Button>
        <p className="text-slate-600">Call not found</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Calls
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl mb-2">Call Details</h1>
            <p className="text-slate-600">Call ID: {call.id}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant={call.outcome === 'success' ? 'default' : 'destructive'} className="text-sm px-4 py-2">
              {call.outcome}
            </Badge>
            <Badge variant="outline" className="text-sm px-4 py-2">
              {call.disposition}
            </Badge>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Duration</span>
            </div>
            <div className="text-2xl">{formatDuration(call.duration)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Cost</span>
            </div>
            <div className="text-2xl">${call.costs.total.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <ThumbsUp className="h-4 w-4" />
              <span className="text-sm">Quality Score</span>
            </div>
            <div className="text-2xl">{call.metrics.callQuality}/5.0</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-slate-600 mb-1">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm">Sentiment</span>
            </div>
            <div className="text-2xl capitalize">{call.aiAnalysis.sentiment}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transcript">Transcript</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recording */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recording Player</CardTitle>
                  <CardDescription>Full call audio with waveform visualization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enhanced Waveform Visualization */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 h-32 rounded-lg relative overflow-hidden border border-slate-200 dark:border-slate-700">
                    {/* Waveform bars */}
                    <div className="absolute inset-0 flex items-center justify-center gap-[2px] px-4">
                      {Array.from({ length: 120 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 rounded-full transition-all duration-200"
                          style={{
                            height: `${Math.random() * 70 + 10}%`,
                            backgroundColor: i < playbackPosition ? '#3b82f6' : '#cbd5e1',
                            opacity: i < playbackPosition ? 1 : 0.4
                          }}
                        />
                      ))}
                    </div>
                    
                    {/* Playback overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-full p-4 shadow-lg">
                        <Button 
                          size="lg"
                          onClick={() => {
                            setIsPlaying(!isPlaying);
                            if (!isPlaying) {
                              // Simulate playback progress
                              const interval = setInterval(() => {
                                setPlaybackPosition(prev => {
                                  if (prev >= 120) {
                                    clearInterval(interval);
                                    setIsPlaying(false);
                                    return 0;
                                  }
                                  return prev + 1;
                                });
                              }, 50);
                            }
                          }}
                          className="rounded-full h-14 w-14"
                        >
                          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-1" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Playback progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        {formatDuration(Math.floor((playbackPosition / 120) * call.duration))}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400">
                        {formatDuration(call.duration)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 cursor-pointer">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${(playbackPosition / 120) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {/* Playback controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={downloadRecording}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Select defaultValue="1">
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">0.5x</SelectItem>
                          <SelectItem value="0.75">0.75x</SelectItem>
                          <SelectItem value="1">1.0x</SelectItem>
                          <SelectItem value="1.25">1.25x</SelectItem>
                          <SelectItem value="1.5">1.5x</SelectItem>
                          <SelectItem value="2">2.0x</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      MP3 • {((call.duration * 0.5) / 1024).toFixed(1)} MB
                    </Badge>
                  </div>
                  
                  {/* Audio quality indicator */}
                  <div className="flex items-center justify-between text-sm p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-slate-700 dark:text-slate-300">High Quality Audio</span>
                    </div>
                    <span className="text-slate-600 dark:text-slate-400">48kHz • Stereo</span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-600" />
                    <CardTitle>AI Summary</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700">{call.aiAnalysis.summary}</p>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm mb-2">Action Items</h4>
                      <ul className="space-y-1">
                        {call.aiAnalysis.actionItems.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <span className="text-blue-600">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-sm mb-2">Key Topics</h4>
                      <div className="flex flex-wrap gap-2">
                        {call.aiAnalysis.topics.map((topic: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="bg-blue-50">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Call Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Call Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-500">From</div>
                    <div className="font-mono">{call.from}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-slate-500">To</div>
                    <div className="font-mono">{call.to}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-slate-500">Direction</div>
                    <Badge variant="outline" className="capitalize">{call.direction}</Badge>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-slate-500">Started</div>
                    <div className="text-sm">{formatDate(call.startedAt)}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm text-slate-500">Agent</div>
                    <div>{call.agentName}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Speech-to-Text</span>
                    <span>${call.costs.stt.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">LLM Processing</span>
                    <span>${call.costs.llm.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Text-to-Speech</span>
                    <span>${call.costs.tts.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Telecom</span>
                    <span>${call.costs.telecom.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span>Total Cost</span>
                    <span className="text-lg">${call.costs.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Tags */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <CardTitle>Tags</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button size="sm" onClick={addTag}>Add</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card>
                <CardHeader>
                  <CardTitle>Notes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this call..."
                    rows={4}
                  />
                  <Button size="sm" onClick={saveNotes}>Save Notes</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TRANSCRIPT TAB */}
        <TabsContent value="transcript">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Full Transcript</CardTitle>
                <Button variant="outline" size="sm" onClick={copyTranscript}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {call.transcript.map((item: any, idx: number) => (
                  <div key={idx} className={`flex gap-4 ${item.speaker === 'agent' ? '' : 'flex-row-reverse'}`}>
                    <div className={`flex-1 max-w-[80%] p-4 rounded-lg ${
                      item.speaker === 'agent' 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-slate-50 border border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs uppercase">{item.speaker === 'agent' ? 'Agent' : 'Customer'}</span>
                          <span className="text-xs text-slate-500">{item.timestamp}</span>
                          <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs ${getSentimentColor(item.sentiment)}`}>
                            {getSentimentIcon(item.sentiment)}
                            <span className="capitalize">{item.sentiment.replace('_', ' ')}</span>
                          </div>
                        </div>
                        <span className="text-xs text-slate-400">{(item.confidence * 100).toFixed(0)}%</span>
                      </div>
                      <div className="text-sm">{item.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI ANALYSIS TAB */}
        <TabsContent value="ai-analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Overall Sentiment</span>
                  <Badge className={getSentimentColor(call.aiAnalysis.sentiment)} variant="outline">
                    {call.aiAnalysis.sentiment}
                  </Badge>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Sentiment Score</span>
                    <span>{(call.aiAnalysis.sentimentScore * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${call.aiAnalysis.sentimentScore * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Intent</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="text-lg px-4 py-2">{call.aiAnalysis.intent.replace('_', ' ')}</Badge>
                <p className="text-sm text-slate-600 mt-4">
                  Based on conversation analysis, the customer's primary intent has been identified as purchase interest with high engagement signals.
                </p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Key Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="mb-2">Key Phrases</h4>
                  <div className="flex flex-wrap gap-2">
                    {call.aiAnalysis.keyPhrases.map((phrase: string, idx: number) => (
                      <Badge key={idx} variant="outline">"{phrase}"</Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="mb-2 text-red-600">Concerns Raised</h4>
                    <ul className="space-y-1">
                      {call.aiAnalysis.concerns.map((concern: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          {concern}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="mb-2 text-green-600">Opportunities</h4>
                    <ul className="space-y-1">
                      {call.aiAnalysis.opportunities.map((opp: string, idx: number) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-green-600">•</span>
                          {opp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* METRICS TAB */}
        <TabsContent value="metrics">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-slate-600 mb-1">Talk Time</div>
                <div className="text-3xl mb-1">{formatDuration(call.metrics.talkTime)}</div>
                <div className="text-xs text-slate-500">Active conversation time</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-slate-600 mb-1">Wait Time</div>
                <div className="text-3xl mb-1">{formatDuration(call.metrics.waitTime)}</div>
                <div className="text-xs text-slate-500">Before agent answered</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-slate-600 mb-1">Hold Time</div>
                <div className="text-3xl mb-1">{formatDuration(call.metrics.holdTime)}</div>
                <div className="text-xs text-slate-500">Customer on hold</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-slate-600 mb-1">Call Quality</div>
                <div className="text-3xl mb-1">{call.metrics.callQuality}/5.0</div>
                <div className="text-xs text-slate-500">Audio quality rating</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-slate-600 mb-1">Customer Satisfaction</div>
                <div className="text-3xl mb-1">{call.metrics.customerSatisfaction}/5.0</div>
                <div className="text-xs text-slate-500">Estimated CSAT score</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-slate-600 mb-1">Transfers</div>
                <div className="text-3xl mb-1">{call.metrics.transferCount}</div>
                <div className="text-xs text-slate-500">Times transferred</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-slate-600 mb-1">Silence</div>
                <div className="text-3xl mb-1">{call.metrics.silencePercentage}%</div>
                <div className="text-xs text-slate-500">Of total call time</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="text-sm text-slate-600 mb-1">Overtalk</div>
                <div className="text-3xl mb-1">{call.metrics.overtalkPercentage}%</div>
                <div className="text-xs text-slate-500">Simultaneous speech</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

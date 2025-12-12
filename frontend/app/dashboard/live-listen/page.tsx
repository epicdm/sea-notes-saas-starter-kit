'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Headphones, 
  Radio, 
  MessageSquare, 
  Volume2,
  VolumeX,
  Eye,
  AlertCircle,
  Clock,
  Users,
  Activity,
  Loader2,
  PhoneForwarded,
  Pause,
  Play,
  TrendingUp,
  TrendingDown,
  Minus,
  Signal,
  Zap,
  Filter
} from "lucide-react";
import { toast } from "sonner";

interface LiveCallsPageProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  accessToken: string;
}

interface LiveCall {
  id: string;
  agentName: string;
  customerPhone: string;
  customerName?: string;
  status: 'ringing' | 'talking' | 'hold' | 'transferring';
  duration: number;
  direction: 'inbound' | 'outbound';
  sentiment: 'positive' | 'neutral' | 'negative';
  qualityScore: number;
  transcript: Array<{
    speaker: 'agent' | 'customer';
    text: string;
    timestamp: string;
  }>;
  metrics: {
    talkTime: number;
    silenceTime: number;
    overtalkTime: number;
  };
}

type MonitorMode = 'listen' | 'whisper' | 'barge' | null;

export default function LiveCallsPage({ accessToken }: LiveCallsPageProps) {
  const [liveCalls, setLiveCalls] = useState<LiveCall[]>([]);
  const [selectedCall, setSelectedCall] = useState<LiveCall | null>(null);
  const [monitorMode, setMonitorMode] = useState<MonitorMode>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSentiment, setFilterSentiment] = useState<string>('all');
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [transferTarget, setTransferTarget] = useState<string>("");

  useEffect(() => {
    loadLiveCalls();
    const interval = setInterval(() => {
      loadLiveCalls();
      setCurrentTime(new Date());
    }, 2000); // Refresh every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const loadLiveCalls = async () => {
    try {
      // Mock live calls data
      const mockCalls: LiveCall[] = [
        {
          id: '1',
          agentName: 'Sales Bot',
          customerPhone: '+1 (555) 123-4567',
          customerName: 'John Smith',
          status: 'talking',
          duration: 127,
          direction: 'inbound',
          sentiment: 'positive',
          qualityScore: 4.5,
          transcript: [
            { speaker: 'customer', text: "Hi, I'm interested in your product", timestamp: '00:05' },
            { speaker: 'agent', text: "Great! I'd be happy to help you learn more.", timestamp: '00:12' },
            { speaker: 'customer', text: "What are your pricing options?", timestamp: '00:20' },
          ],
          metrics: {
            talkTime: 115,
            silenceTime: 8,
            overtalkTime: 4
          }
        },
        {
          id: '2',
          agentName: 'Support Bot',
          customerPhone: '+1 (555) 987-6543',
          customerName: 'Sarah Johnson',
          status: 'talking',
          duration: 89,
          direction: 'inbound',
          sentiment: 'neutral',
          qualityScore: 4.2,
          transcript: [
            { speaker: 'customer', text: "I need help with my account", timestamp: '00:03' },
            { speaker: 'agent', text: "I can help you with that. What seems to be the issue?", timestamp: '00:08' },
          ],
          metrics: {
            talkTime: 78,
            silenceTime: 6,
            overtalkTime: 5
          }
        },
        {
          id: '3',
          agentName: 'Sales Bot',
          customerPhone: '+1 (555) 456-7890',
          status: 'ringing',
          duration: 8,
          direction: 'outbound',
          sentiment: 'neutral',
          qualityScore: 5.0,
          transcript: [],
          metrics: {
            talkTime: 0,
            silenceTime: 0,
            overtalkTime: 0
          }
        }
      ];
      setLiveCalls(mockCalls);
    } catch (error) {
      console.error('Error loading live calls:', error);
    }
  };

  const handleStartMonitoring = (call: LiveCall, mode: MonitorMode) => {
    setSelectedCall(call);
    setMonitorMode(mode);
    setIsMonitoring(true);
    
    let modeText = '';
    switch(mode) {
      case 'listen':
        modeText = 'Listen Mode - You can hear the call but cannot be heard';
        break;
      case 'whisper':
        modeText = 'Whisper Mode - Only the agent can hear you';
        break;
      case 'barge':
        modeText = 'Barge Mode - Both agent and customer can hear you';
        break;
    }
    
    toast.success(`Started monitoring in ${modeText}`);
  };

  const handleStopMonitoring = () => {
    setIsMonitoring(false);
    setMonitorMode(null);
    setSelectedCall(null);
    toast.info('Stopped monitoring');
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
    toast.success(isMuted ? 'Unmuted' : 'Muted');
  };

  const handleHoldCall = (call: LiveCall) => {
    const newStatus = call.status === 'hold' ? 'talking' : 'hold';
    setLiveCalls(liveCalls.map(c => 
      c.id === call.id ? { ...c, status: newStatus as any } : c
    ));
    toast.success(newStatus === 'hold' ? 'Call placed on hold' : 'Call resumed');
  };

  const handleTransferCall = () => {
    if (!transferTarget) {
      toast.error("Please enter a transfer destination");
      return;
    }
    toast.success(`Transferring call to ${transferTarget}...`);
    setShowTransferDialog(false);
    setTransferTarget("");
    setTimeout(() => {
      toast.success("Call transferred successfully!");
    }, 2000);
  };

  const handleEndCall = (call: LiveCall) => {
    setLiveCalls(liveCalls.filter(c => c.id !== call.id));
    toast.success("Call ended");
    if (selectedCall?.id === call.id) {
      handleStopMonitoring();
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'negative': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'talking': return 'bg-green-500';
      case 'ringing': return 'bg-blue-500 animate-pulse';
      case 'hold': return 'bg-yellow-500';
      default: return 'bg-slate-500';
    }
  };

  // Filter calls
  const filteredCalls = liveCalls.filter(call => {
    if (filterStatus !== 'all' && call.status !== filterStatus) return false;
    if (filterSentiment !== 'all' && call.sentiment !== filterSentiment) return false;
    return true;
  });

  // Calculate stats
  const avgQuality = liveCalls.length > 0
    ? (liveCalls.reduce((sum, c) => sum + c.qualityScore, 0) / liveCalls.length).toFixed(1)
    : '0';
  const totalDuration = liveCalls.reduce((sum, c) => sum + c.duration, 0);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl mb-2">Live Call Monitoring</h1>
          <p className="text-slate-600 dark:text-slate-400">Monitor active calls in real-time</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-green-600 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-400">Live</span>
          </div>
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Active Calls</CardTitle>
              <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{liveCalls.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live now
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Talking</CardTitle>
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{liveCalls.filter(c => c.status === 'talking').length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              In conversation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Avg Quality</CardTitle>
              <Signal className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{avgQuality}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Out of 5.0
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Duration</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{formatDuration(totalDuration)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Combined time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Monitoring</CardTitle>
              <Headphones className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{isMonitoring ? 1 : 0}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active sessions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-slate-400" />
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-sm"
              >
                <option value="all">All Status</option>
                <option value="talking">Talking</option>
                <option value="ringing">Ringing</option>
                <option value="hold">On Hold</option>
              </select>

              <select
                value={filterSentiment}
                onChange={(e) => setFilterSentiment(e.target.value)}
                className="px-3 py-1.5 border dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 text-sm"
              >
                <option value="all">All Sentiment</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
            {(filterStatus !== 'all' || filterSentiment !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterStatus('all');
                  setFilterSentiment('all');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Calls List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredCalls.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Phone className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <h3 className="text-2xl mb-2">No Active Calls</h3>
              <p className="text-slate-600 dark:text-slate-400">
                When agents are on calls, they will appear here for real-time monitoring
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCalls.map((call) => (
            <Card key={call.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(call.status)}`} />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{call.customerName || call.customerPhone}</span>
                          <Badge variant="outline" className="capitalize">
                            {call.direction}
                          </Badge>
                          <Badge className={getSentimentColor(call.sentiment)} variant="outline">
                            {call.sentiment}
                          </Badge>
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          Agent: {call.agentName} • Duration: {formatDuration(call.duration)}
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-4 gap-4 mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</div>
                        <div className="capitalize">{call.status}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Quality</div>
                        <div className="flex items-center gap-1">
                          <span>{call.qualityScore.toFixed(1)}</span>
                          <span className="text-xs text-slate-500">/5.0</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Talk Time</div>
                        <div>{formatDuration(call.metrics.talkTime)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Silence</div>
                        <div>{call.metrics.silenceTime}s</div>
                      </div>
                    </div>

                    {/* Live Transcript Preview */}
                    {call.transcript.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Latest:</div>
                        <div className="text-sm p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <span className="text-xs text-slate-500 dark:text-slate-400 uppercase">
                            {call.transcript[call.transcript.length - 1].speaker}:
                          </span>{' '}
                          {call.transcript[call.transcript.length - 1].text}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Monitor Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    {!isMonitoring ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartMonitoring(call, 'listen')}
                          className="gap-2"
                        >
                          <Headphones className="h-4 w-4" />
                          Listen
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartMonitoring(call, 'whisper')}
                          className="gap-2"
                        >
                          <Radio className="h-4 w-4" />
                          Whisper
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartMonitoring(call, 'barge')}
                          className="gap-2"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Barge
                        </Button>
                        <Separator className="my-1" />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleHoldCall(call)}
                          className="gap-2"
                        >
                          {call.status === 'hold' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                          {call.status === 'hold' ? 'Resume' : 'Hold'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCall(call);
                            setShowTransferDialog(true);
                          }}
                          className="gap-2"
                        >
                          <PhoneForwarded className="h-4 w-4" />
                          Transfer
                        </Button>
                      </>
                    ) : (
                      isMonitoring && selectedCall?.id === call.id && (
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                          Monitoring
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Monitor Dialog */}
      <Dialog open={isMonitoring} onOpenChange={(open) => !open && handleStopMonitoring()}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {monitorMode === 'listen' && <Headphones className="h-5 w-5" />}
              {monitorMode === 'whisper' && <Radio className="h-5 w-5" />}
              {monitorMode === 'barge' && <MessageSquare className="h-5 w-5" />}
              Monitoring: {selectedCall?.customerName || selectedCall?.customerPhone}
            </DialogTitle>
            <DialogDescription>
              {monitorMode === 'listen' && 'Listen Mode - You can hear the call but cannot be heard'}
              {monitorMode === 'whisper' && 'Whisper Mode - Only the agent can hear you'}
              {monitorMode === 'barge' && 'Barge Mode - Both agent and customer can hear you'}
            </DialogDescription>
          </DialogHeader>

          {selectedCall && (
            <div className="space-y-6">
              {/* Call Info */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Duration</div>
                  <div className="text-lg">{formatDuration(selectedCall.duration)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Agent</div>
                  <div className="text-lg">{selectedCall.agentName}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Sentiment</div>
                  <Badge className={getSentimentColor(selectedCall.sentiment)}>
                    {selectedCall.sentiment}
                  </Badge>
                </div>
              </div>

              {/* Audio Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Audio Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center gap-4">
                    {/* Waveform visualization */}
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-24 rounded-lg flex items-center justify-center gap-1 px-4">
                      {Array.from({ length: 50 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-blue-400 dark:bg-blue-600 rounded-full animate-pulse"
                          style={{
                            height: `${Math.random() * 60 + 20}%`,
                            animationDelay: `${i * 0.1}s`
                          }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      {(monitorMode === 'whisper' || monitorMode === 'barge') && (
                        <Button
                          variant={isMuted ? 'outline' : 'default'}
                          onClick={handleToggleMute}
                          className="gap-2"
                        >
                          {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          {isMuted ? 'Unmute' : 'Mute'}
                        </Button>
                      )}
                      <Button variant="outline" className="gap-2">
                        <Volume2 className="h-4 w-4" />
                        Volume
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Live Transcript */}
              <Card>
                <CardHeader>
                  <CardTitle>Live Transcript</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {selectedCall.transcript.length === 0 ? (
                      <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Waiting for conversation to start...</p>
                      </div>
                    ) : (
                      selectedCall.transcript.map((item, idx) => (
                        <div
                          key={idx}
                          className={`flex gap-3 ${item.speaker === 'agent' ? '' : 'flex-row-reverse'}`}
                        >
                          <div
                            className={`flex-1 max-w-[80%] p-3 rounded-lg ${
                              item.speaker === 'agent'
                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                                : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs uppercase text-slate-500 dark:text-slate-400">
                                {item.speaker === 'agent' ? 'Agent' : 'Customer'}
                              </span>
                              <span className="text-xs text-slate-400">{item.timestamp}</span>
                            </div>
                            <div className="text-sm">{item.text}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Warning for Barge/Whisper */}
              {(monitorMode === 'whisper' || monitorMode === 'barge') && (
                <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-yellow-800 dark:text-yellow-200">
                      <strong>Active {monitorMode} mode:</strong>{' '}
                      {monitorMode === 'whisper'
                        ? 'Only the agent can hear you. Use this to coach the agent during the call.'
                        : 'Both the agent and customer can hear you. Use caution when speaking.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={handleStopMonitoring}>
                  <Eye className="h-4 w-4 mr-2" />
                  Stop Monitoring
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleEndCall(selectedCall)}
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Call
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onOpenChange={setShowTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transfer Call</DialogTitle>
            <DialogDescription>
              Transfer {selectedCall?.customerName || selectedCall?.customerPhone} to another number or agent
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-target">Transfer To</Label>
              <Input
                id="transfer-target"
                placeholder="Phone number or agent name..."
                value={transferTarget}
                onChange={(e) => setTransferTarget(e.target.value)}
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
              <p className="text-slate-700 dark:text-slate-300">
                The call will be transferred immediately. You can choose to stay on the line or disconnect after transfer.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowTransferDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleTransferCall}>
              <PhoneForwarded className="h-4 w-4 mr-2" />
              Transfer Call
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

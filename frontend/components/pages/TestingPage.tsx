import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TestTube2, Phone, CheckCircle2, XCircle, Clock, Loader2, Play, PhoneCall, MessageSquare, Volume2, Mic, AlertCircle, ThumbsUp, ThumbsDown, TrendingUp } from "lucide-react";
import { Agent, getAgents } from "@/components/../utils/api";
import { toast } from "sonner";

interface TestingPageProps {
  accessToken: string;
}

type TestStatus = 'idle' | 'initiating' | 'ringing' | 'connected' | 'completed' | 'failed';

interface TestTranscript {
  speaker: 'agent' | 'user';
  text: string;
  timestamp: string;
}

export function TestingPage({ accessToken }: TestingPageProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [testType, setTestType] = useState<'inbound' | 'outbound'>('inbound');
  const [phoneNumber, setPhoneNumber] = useState("");
  const [testStatus, setTestStatus] = useState<TestStatus>('idle');
  const [testProgress, setTestProgress] = useState(0);
  const [testDuration, setTestDuration] = useState(0);
  const [transcript, setTranscript] = useState<TestTranscript[]>([]);
  const [testResults, setTestResults] = useState<any>(null);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    loadAgents();
  }, []);

  // Timer for test duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (testStatus === 'connected') {
      interval = setInterval(() => {
        setTestDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testStatus]);

  const loadAgents = async () => {
    try {
      const fetchedAgents = await getAgents(accessToken);
      const validAgents = fetchedAgents.filter(agent => agent != null && agent.id);
      setAgents(validAgents);
    } catch (error) {
      console.error('Error loading agents:', error);
      toast.error("Failed to load agents");
    }
  };

  const startTestCall = async () => {
    if (!selectedAgent || !phoneNumber) {
      toast.error("Please select an agent and enter a phone number");
      return;
    }

    // Reset state
    setTestStatus('initiating');
    setTestProgress(0);
    setTestDuration(0);
    setTranscript([]);
    setTestResults(null);
    setNotes("");

    toast.success("Initiating test call...");

    // Simulate test call progress
    setTimeout(() => {
      setTestStatus('ringing');
      setTestProgress(25);
      toast.info("Ringing...");
    }, 1000);

    setTimeout(() => {
      setTestStatus('connected');
      setTestProgress(50);
      toast.success("Call connected!");
      simulateConversation();
    }, 3000);
  };

  const simulateConversation = () => {
    const mockTranscript: TestTranscript[] = [
      { speaker: 'agent', text: "Hello! This is a test call. How can I help you today?", timestamp: "00:00" },
      { speaker: 'user', text: "Hi, I'm just testing the system.", timestamp: "00:03" },
      { speaker: 'agent', text: "Great! I'm here to assist. What would you like to test?", timestamp: "00:06" },
      { speaker: 'user', text: "Can you tell me about your services?", timestamp: "00:10" },
      { speaker: 'agent', text: "Of course! We offer AI-powered voice agents for customer support, sales, and more. Our platform handles inbound and outbound calls with natural conversation.", timestamp: "00:13" },
      { speaker: 'user', text: "That sounds interesting. How does it work?", timestamp: "00:22" },
      { speaker: 'agent', text: "Our AI agents use advanced language models to understand and respond naturally. They can be customized with your business logic and integrate with your systems.", timestamp: "00:26" },
      { speaker: 'user', text: "Perfect! Thank you for the information.", timestamp: "00:35" },
    ];

    // Add transcript messages one by one
    mockTranscript.forEach((message, index) => {
      setTimeout(() => {
        setTranscript(prev => [...prev, message]);
        if (index === mockTranscript.length - 1) {
          // End call after last message
          setTimeout(() => {
            endTestCall(true);
          }, 2000);
        }
      }, index * 2000);
    });
  };

  const endTestCall = (success: boolean = true) => {
    setTestStatus(success ? 'completed' : 'failed');
    setTestProgress(100);

    // Generate test results
    const results = {
      success: success,
      duration: testDuration,
      transcriptLength: transcript.length,
      responseTime: '1.2s',
      audioQuality: '4.8/5.0',
      conversationFlow: '4.5/5.0',
      sentimentScore: 0.85,
      issues: success ? [] : ['Connection timeout', 'Audio quality degraded'],
      recommendations: [
        'Agent responded well to questions',
        'Natural conversation flow maintained',
        'Consider reducing response latency',
        'Add more context to greetings'
      ]
    };

    setTestResults(results);
    toast.success(success ? "Test call completed successfully!" : "Test call failed");
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTest = () => {
    setTestStatus('idle');
    setTestProgress(0);
    setTestDuration(0);
    setTranscript([]);
    setTestResults(null);
    setNotes("");
  };
  const isTestInProgress = ['initiating', 'ringing', 'connected'].includes(testStatus);
  const isTestComplete = ['completed', 'failed'].includes(testStatus);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl mb-2">Agent Testing</h1>
          <p className="text-slate-600 dark:text-slate-400">Test your agents before going live</p>
        </div>
        {isTestComplete && (
          <Button onClick={resetTest} variant="outline">
            <Play className="h-4 w-4 mr-2" />
            New Test
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Test Status</CardTitle>
              {testStatus === 'idle' && <Clock className="h-4 w-4 text-slate-400" />}
              {testStatus === 'initiating' && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
              {testStatus === 'ringing' && <PhoneCall className="h-4 w-4 text-yellow-600 animate-pulse" />}
              {testStatus === 'connected' && <Phone className="h-4 w-4 text-green-600" />}
              {testStatus === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
              {testStatus === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-1 capitalize">{testStatus}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Current state
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Duration</CardTitle>
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-1">{formatDuration(testDuration)}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Call length
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-1">{transcript.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Exchanges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl mb-1">{testProgress}%</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Test Configuration */}
      {testStatus === 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>
              Configure and run a test call with your AI agent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="test-agent">Select Agent</Label>
              <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                <SelectTrigger id="test-agent">
                  <SelectValue placeholder="Choose an agent to test" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Test Type</Label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="test-type" 
                    value="inbound" 
                    checked={testType === 'inbound'}
                    onChange={() => setTestType('inbound')}
                  />
                  <span>Inbound Call (Agent receives)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="radio" 
                    name="test-type" 
                    value="outbound"
                    checked={testType === 'outbound'}
                    onChange={() => setTestType('outbound')}
                  />
                  <span>Outbound Call (Agent makes)</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="test-phone">Your Phone Number</Label>
              <Input
                id="test-phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>

            <Button 
              className="w-full" 
              size="lg"
              onClick={startTestCall}
              disabled={!selectedAgent || !phoneNumber}
            >
              <Phone className="h-5 w-5 mr-2" />
              Start Test Call
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Live Test Progress */}
      {isTestInProgress && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testStatus === 'initiating' && <Loader2 className="h-5 w-5 animate-spin" />}
              {testStatus === 'ringing' && <PhoneCall className="h-5 w-5 animate-pulse" />}
              {testStatus === 'connected' && <Phone className="h-5 w-5" />}
              Live Test Progress
            </CardTitle>
            <CardDescription>
              Real-time monitoring of your test call
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Test Progress</span>
                <span className="font-medium">{testProgress}%</span>
              </div>
              <Progress value={testProgress} className="h-2" />
            </div>

            {/* Status Messages */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {testStatus === 'initiating' && 'Initializing test call...'}
                {testStatus === 'ringing' && 'Ringing your phone...'}
                {testStatus === 'connected' && `Call connected - Duration: ${formatDuration(testDuration)}`}
              </AlertDescription>
            </Alert>

            {/* Real-time Transcript */}
            {transcript.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <h4 className="font-medium">Live Transcript</h4>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto border dark:border-slate-700 rounded-lg p-4">
                  {transcript.map((message, idx) => (
                    <div 
                      key={idx}
                      className={`flex gap-3 ${message.speaker === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`flex-1 max-w-[80%] p-3 rounded-lg ${
                        message.speaker === 'agent'
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          {message.speaker === 'agent' ? <Mic className="h-3 w-3" /> : <Phone className="h-3 w-3" />}
                          <span className="text-xs uppercase font-medium">
                            {message.speaker === 'agent' ? 'Agent' : 'You'}
                          </span>
                          <span className="text-xs text-slate-500">{message.timestamp}</span>
                        </div>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {isTestComplete && testResults && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {testResults.success ? (
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600" />
                )}
                <CardTitle>
                  {testResults.success ? 'Test Passed!' : 'Test Failed'}
                </CardTitle>
              </div>
              <Badge variant={testResults.success ? 'default' : 'destructive'} className="text-sm px-3 py-1">
                {testResults.success ? 'Success' : 'Failed'}
              </Badge>
            </div>
            <CardDescription>
              Detailed analysis of your test call
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border dark:border-slate-700 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Duration</div>
                <div className="text-2xl">{formatDuration(testResults.duration)}</div>
              </div>
              <div className="p-4 border dark:border-slate-700 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Messages</div>
                <div className="text-2xl">{testResults.transcriptLength}</div>
              </div>
              <div className="p-4 border dark:border-slate-700 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Response Time</div>
                <div className="text-2xl">{testResults.responseTime}</div>
              </div>
              <div className="p-4 border dark:border-slate-700 rounded-lg">
                <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Audio Quality</div>
                <div className="text-2xl">{testResults.audioQuality}</div>
              </div>
            </div>

            <Separator />

            {/* Quality Scores */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Quality Metrics</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Conversation Flow</span>
                      <span className="font-medium">{testResults.conversationFlow}</span>
                    </div>
                    <Progress value={parseFloat(testResults.conversationFlow) * 20} />
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Sentiment Score</span>
                      <span className="font-medium">{(testResults.sentimentScore * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={testResults.sentimentScore * 100} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Recommendations</h4>
                <ul className="space-y-2">
                  {testResults.recommendations.map((rec: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <ThumbsUp className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Issues */}
            {testResults.issues.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h4 className="font-medium text-red-600">Issues Detected</h4>
                  <ul className="space-y-2">
                    {testResults.issues.map((issue: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <ThumbsDown className="h-4 w-4 text-red-600 mt-0.5" />
                        <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {/* Notes */}
            <Separator />
            <div className="space-y-3">
              <Label htmlFor="test-notes">Test Notes (Optional)</Label>
              <Textarea
                id="test-notes"
                placeholder="Add any notes about this test..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

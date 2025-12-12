import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Settings, 
  Mic, 
  Brain, 
  MessageSquare, 
  Zap, 
  FileText,
  Save,
  X
} from "lucide-react";
import { Agent, updateAgent } from "@/utils/api";
import { toast } from "sonner";

interface EditAgentDialogProps {
  agent: Agent;
  isOpen: boolean;
  onClose: () => void;
  onAgentUpdated: (agent: Agent) => void;
  accessToken: string;
}

interface LiveKitAgentConfig {
  // Basic
  name: string;
  type: 'voice' | 'chat';
  status: 'active' | 'inactive';
  
  // LLM Settings
  llmProvider: string;
  llmModel: string;
  llmTemperature: number;
  llmMaxTokens: number;
  systemPrompt: string;
  
  // Voice Settings (TTS)
  ttsProvider: string;
  ttsVoice: string;
  ttsSpeed: number;
  ttsStability: number;
  
  // Speech-to-Text Settings
  sttProvider: string;
  sttLanguage: string;
  sttModel: string;
  
  // Turn Detection
  enableTurnDetection: boolean;
  turnDetectionThreshold: number;
  prefixPaddingMs: number;
  silenceTimeoutMs: number;
  
  // Interruption Handling
  enableInterruptions: boolean;
  interruptionThreshold: number;
  
  // Advanced Settings
  maxCallDuration: number;
  enableTranscription: boolean;
  enableRecording: boolean;
  
  // Function Calling
  enableFunctionCalling: boolean;
  functions: string;
  
  // Knowledge Base
  knowledgeBase: string;
}

export function EditAgentDialog({ 
  agent, 
  isOpen, 
  onClose, 
  onAgentUpdated, 
  accessToken 
}: EditAgentDialogProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  
  const [config, setConfig] = useState<LiveKitAgentConfig>({
    name: agent.name || "",
    type: agent.type || "voice",
    status: agent.status || "active",
    
    llmProvider: "openai",
    llmModel: agent.model || "gpt-4",
    llmTemperature: 0.7,
    llmMaxTokens: 2048,
    systemPrompt: agent.systemPrompt || "",
    
    ttsProvider: "openai",
    ttsVoice: agent.voice || "alloy",
    ttsSpeed: 1.0,
    ttsStability: 0.5,
    
    sttProvider: "deepgram",
    sttLanguage: agent.language || "en-US",
    sttModel: "nova-2",
    
    enableTurnDetection: true,
    turnDetectionThreshold: 0.5,
    prefixPaddingMs: 300,
    silenceTimeoutMs: 800,
    
    enableInterruptions: true,
    interruptionThreshold: 0.7,
    
    maxCallDuration: 3600,
    enableTranscription: true,
    enableRecording: true,
    
    enableFunctionCalling: false,
    functions: "",
    
    knowledgeBase: ""
  });

  const handleSave = async () => {
    if (!config.name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    setIsSaving(true);
    try {
      const updatedAgent = await updateAgent(accessToken, agent.id, {
        name: config.name,
        type: config.type,
        status: config.status,
        model: config.llmModel,
        voice: config.ttsVoice,
        language: config.sttLanguage,
        systemPrompt: config.systemPrompt
      });
      
      onAgentUpdated(updatedAgent);
      toast.success("Agent updated successfully");
      onClose();
    } catch (error) {
      console.error('Error updating agent:', error);
      toast.error("Failed to update agent");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Edit AI Agent</DialogTitle>
              <DialogDescription>
                Configure LiveKit AI agent properties and behavior
              </DialogDescription>
            </div>
            <Badge variant={config.status === 'active' ? 'default' : 'secondary'}>
              {config.status}
            </Badge>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="border-b px-6">
            <TabsList className="w-full justify-start h-auto p-0 bg-transparent">
              <TabsTrigger value="basic" className="gap-2">
                <Settings className="h-4 w-4" />
                Basic
              </TabsTrigger>
              <TabsTrigger value="llm" className="gap-2">
                <Brain className="h-4 w-4" />
                LLM
              </TabsTrigger>
              <TabsTrigger value="voice" className="gap-2">
                <Mic className="h-4 w-4" />
                Voice & STT
              </TabsTrigger>
              <TabsTrigger value="behavior" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Behavior
              </TabsTrigger>
              <TabsTrigger value="advanced" className="gap-2">
                <Zap className="h-4 w-4" />
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[500px] px-6 py-4">
            {/* BASIC TAB */}
            <TabsContent value="basic" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Configure agent identity and type</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Agent Name *</Label>
                    <Input
                      id="name"
                      value={config.name}
                      onChange={(e) => setConfig({ ...config, name: e.target.value })}
                      placeholder="e.g., Customer Support Agent"
                      disabled={isSaving}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Agent Type</Label>
                      <Select
                        value={config.type}
                        onValueChange={(value: 'voice' | 'chat') => setConfig({ ...config, type: value })}
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="voice">Voice Agent</SelectItem>
                          <SelectItem value="chat">Chat Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select
                        value={config.status}
                        onValueChange={(value: 'active' | 'inactive') => setConfig({ ...config, status: value })}
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* LLM TAB */}
            <TabsContent value="llm" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Language Model Configuration</CardTitle>
                  <CardDescription>Configure the AI model and parameters</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="llmProvider">LLM Provider</Label>
                      <Select
                        value={config.llmProvider}
                        onValueChange={(value) => setConfig({ ...config, llmProvider: value })}
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="openai">OpenAI</SelectItem>
                          <SelectItem value="anthropic">Anthropic</SelectItem>
                          <SelectItem value="google">Google (Gemini)</SelectItem>
                          <SelectItem value="groq">Groq</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="llmModel">Model</Label>
                      <Select
                        value={config.llmModel}
                        onValueChange={(value) => setConfig({ ...config, llmModel: value })}
                        disabled={isSaving}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {config.llmProvider === 'openai' && (
                            <>
                              <SelectItem value="gpt-4">GPT-4</SelectItem>
                              <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                              <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                              <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                            </>
                          )}
                          {config.llmProvider === 'anthropic' && (
                            <>
                              <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                              <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                              <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                            </>
                          )}
                          {config.llmProvider === 'google' && (
                            <>
                              <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                              <SelectItem value="gemini-ultra">Gemini Ultra</SelectItem>
                            </>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Temperature: {config.llmTemperature.toFixed(2)}</Label>
                      <span className="text-xs text-slate-500">Controls randomness</span>
                    </div>
                    <Slider
                      value={[config.llmTemperature]}
                      onValueChange={([value]) => setConfig({ ...config, llmTemperature: value })}
                      min={0}
                      max={2}
                      step={0.1}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTokens">Max Tokens</Label>
                    <Input
                      id="maxTokens"
                      type="number"
                      value={config.llmMaxTokens}
                      onChange={(e) => setConfig({ ...config, llmMaxTokens: parseInt(e.target.value) })}
                      min={100}
                      max={8192}
                      disabled={isSaving}
                    />
                    <p className="text-xs text-slate-500">Maximum response length (100-8192)</p>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="systemPrompt">System Prompt</Label>
                    <Textarea
                      id="systemPrompt"
                      value={config.systemPrompt}
                      onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                      placeholder="You are a helpful AI assistant that..."
                      rows={8}
                      disabled={isSaving}
                    />
                    <p className="text-xs text-slate-500">
                      Define the personality, behavior, and guidelines for your AI agent
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* VOICE & STT TAB */}
            <TabsContent value="voice" className="space-y-6 mt-0">
              {config.type === 'voice' && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Text-to-Speech (TTS)</CardTitle>
                      <CardDescription>Configure how your agent speaks</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="ttsProvider">TTS Provider</Label>
                          <Select
                            value={config.ttsProvider}
                            onValueChange={(value) => setConfig({ ...config, ttsProvider: value })}
                            disabled={isSaving}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="openai">OpenAI</SelectItem>
                              <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                              <SelectItem value="cartesia">Cartesia</SelectItem>
                              <SelectItem value="deepgram">Deepgram</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ttsVoice">Voice</Label>
                          <Select
                            value={config.ttsVoice}
                            onValueChange={(value) => setConfig({ ...config, ttsVoice: value })}
                            disabled={isSaving}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {config.ttsProvider === 'openai' && (
                                <>
                                  <SelectItem value="alloy">Alloy</SelectItem>
                                  <SelectItem value="echo">Echo</SelectItem>
                                  <SelectItem value="fable">Fable</SelectItem>
                                  <SelectItem value="onyx">Onyx</SelectItem>
                                  <SelectItem value="nova">Nova</SelectItem>
                                  <SelectItem value="shimmer">Shimmer</SelectItem>
                                </>
                              )}
                              {config.ttsProvider === 'elevenlabs' && (
                                <>
                                  <SelectItem value="rachel">Rachel</SelectItem>
                                  <SelectItem value="domi">Domi</SelectItem>
                                  <SelectItem value="bella">Bella</SelectItem>
                                  <SelectItem value="antoni">Antoni</SelectItem>
                                  <SelectItem value="elli">Elli</SelectItem>
                                  <SelectItem value="josh">Josh</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Speech Speed: {config.ttsSpeed.toFixed(2)}x</Label>
                          <span className="text-xs text-slate-500">0.5x to 2.0x</span>
                        </div>
                        <Slider
                          value={[config.ttsSpeed]}
                          onValueChange={([value]) => setConfig({ ...config, ttsSpeed: value })}
                          min={0.5}
                          max={2}
                          step={0.1}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Voice Stability: {config.ttsStability.toFixed(2)}</Label>
                          <span className="text-xs text-slate-500">More stable vs more variable</span>
                        </div>
                        <Slider
                          value={[config.ttsStability]}
                          onValueChange={([value]) => setConfig({ ...config, ttsStability: value })}
                          min={0}
                          max={1}
                          step={0.1}
                          disabled={isSaving}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Speech-to-Text (STT)</CardTitle>
                      <CardDescription>Configure how your agent listens</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sttProvider">STT Provider</Label>
                          <Select
                            value={config.sttProvider}
                            onValueChange={(value) => setConfig({ ...config, sttProvider: value })}
                            disabled={isSaving}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="deepgram">Deepgram</SelectItem>
                              <SelectItem value="openai">OpenAI Whisper</SelectItem>
                              <SelectItem value="google">Google Speech</SelectItem>
                              <SelectItem value="azure">Azure Speech</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sttModel">STT Model</Label>
                          <Select
                            value={config.sttModel}
                            onValueChange={(value) => setConfig({ ...config, sttModel: value })}
                            disabled={isSaving}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {config.sttProvider === 'deepgram' && (
                                <>
                                  <SelectItem value="nova-2">Nova 2 (Latest)</SelectItem>
                                  <SelectItem value="nova">Nova</SelectItem>
                                  <SelectItem value="enhanced">Enhanced</SelectItem>
                                  <SelectItem value="base">Base</SelectItem>
                                </>
                              )}
                              {config.sttProvider === 'openai' && (
                                <>
                                  <SelectItem value="whisper-1">Whisper v1</SelectItem>
                                </>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sttLanguage">Language</Label>
                        <Select
                          value={config.sttLanguage}
                          onValueChange={(value) => setConfig({ ...config, sttLanguage: value })}
                          disabled={isSaving}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en-US">English (US)</SelectItem>
                            <SelectItem value="en-GB">English (UK)</SelectItem>
                            <SelectItem value="es-ES">Spanish (Spain)</SelectItem>
                            <SelectItem value="es-MX">Spanish (Mexico)</SelectItem>
                            <SelectItem value="fr-FR">French</SelectItem>
                            <SelectItem value="de-DE">German</SelectItem>
                            <SelectItem value="it-IT">Italian</SelectItem>
                            <SelectItem value="pt-BR">Portuguese (Brazil)</SelectItem>
                            <SelectItem value="zh-CN">Chinese (Simplified)</SelectItem>
                            <SelectItem value="ja-JP">Japanese</SelectItem>
                            <SelectItem value="ko-KR">Korean</SelectItem>
                            <SelectItem value="hi-IN">Hindi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {config.type === 'chat' && (
                <Card>
                  <CardContent className="py-20 text-center">
                    <MessageSquare className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600">Voice settings are not applicable for chat agents</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* BEHAVIOR TAB */}
            <TabsContent value="behavior" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Turn Detection</CardTitle>
                  <CardDescription>Configure when the agent should speak</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Turn Detection</Label>
                      <p className="text-xs text-slate-500">Automatically detect when user has finished speaking</p>
                    </div>
                    <Switch
                      checked={config.enableTurnDetection}
                      onCheckedChange={(checked) => setConfig({ ...config, enableTurnDetection: checked })}
                      disabled={isSaving}
                    />
                  </div>

                  {config.enableTurnDetection && (
                    <>
                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Detection Threshold: {config.turnDetectionThreshold.toFixed(2)}</Label>
                          <span className="text-xs text-slate-500">Sensitivity</span>
                        </div>
                        <Slider
                          value={[config.turnDetectionThreshold]}
                          onValueChange={([value]) => setConfig({ ...config, turnDetectionThreshold: value })}
                          min={0.1}
                          max={1}
                          step={0.05}
                          disabled={isSaving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="prefixPadding">Prefix Padding (ms)</Label>
                        <Input
                          id="prefixPadding"
                          type="number"
                          value={config.prefixPaddingMs}
                          onChange={(e) => setConfig({ ...config, prefixPaddingMs: parseInt(e.target.value) })}
                          min={0}
                          max={1000}
                          step={50}
                          disabled={isSaving}
                        />
                        <p className="text-xs text-slate-500">Milliseconds of audio to include before speech starts</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="silenceTimeout">Silence Timeout (ms)</Label>
                        <Input
                          id="silenceTimeout"
                          type="number"
                          value={config.silenceTimeoutMs}
                          onChange={(e) => setConfig({ ...config, silenceTimeoutMs: parseInt(e.target.value) })}
                          min={100}
                          max={3000}
                          step={100}
                          disabled={isSaving}
                        />
                        <p className="text-xs text-slate-500">How long to wait for silence before responding</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interruption Handling</CardTitle>
                  <CardDescription>Allow users to interrupt the agent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Interruptions</Label>
                      <p className="text-xs text-slate-500">Allow user to speak while agent is talking</p>
                    </div>
                    <Switch
                      checked={config.enableInterruptions}
                      onCheckedChange={(checked) => setConfig({ ...config, enableInterruptions: checked })}
                      disabled={isSaving}
                    />
                  </div>

                  {config.enableInterruptions && (
                    <>
                      <Separator />

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Interruption Threshold: {config.interruptionThreshold.toFixed(2)}</Label>
                          <span className="text-xs text-slate-500">How easily agent can be interrupted</span>
                        </div>
                        <Slider
                          value={[config.interruptionThreshold]}
                          onValueChange={([value]) => setConfig({ ...config, interruptionThreshold: value })}
                          min={0.1}
                          max={1}
                          step={0.05}
                          disabled={isSaving}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ADVANCED TAB */}
            <TabsContent value="advanced" className="space-y-6 mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Call Settings</CardTitle>
                  <CardDescription>Configure call duration and recording</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxDuration">Max Call Duration (seconds)</Label>
                    <Input
                      id="maxDuration"
                      type="number"
                      value={config.maxCallDuration}
                      onChange={(e) => setConfig({ ...config, maxCallDuration: parseInt(e.target.value) })}
                      min={60}
                      max={7200}
                      step={60}
                      disabled={isSaving}
                    />
                    <p className="text-xs text-slate-500">Maximum length of a single call (60-7200 seconds)</p>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Transcription</Label>
                      <p className="text-xs text-slate-500">Save text transcripts of conversations</p>
                    </div>
                    <Switch
                      checked={config.enableTranscription}
                      onCheckedChange={(checked) => setConfig({ ...config, enableTranscription: checked })}
                      disabled={isSaving}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Recording</Label>
                      <p className="text-xs text-slate-500">Save audio recordings of calls</p>
                    </div>
                    <Switch
                      checked={config.enableRecording}
                      onCheckedChange={(checked) => setConfig({ ...config, enableRecording: checked })}
                      disabled={isSaving}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Function Calling</CardTitle>
                  <CardDescription>Enable agent to call external functions/APIs</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Enable Function Calling</Label>
                      <p className="text-xs text-slate-500">Allow agent to execute custom functions</p>
                    </div>
                    <Switch
                      checked={config.enableFunctionCalling}
                      onCheckedChange={(checked) => setConfig({ ...config, enableFunctionCalling: checked })}
                      disabled={isSaving}
                    />
                  </div>

                  {config.enableFunctionCalling && (
                    <>
                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="functions">Function Definitions (JSON)</Label>
                        <Textarea
                          id="functions"
                          value={config.functions}
                          onChange={(e) => setConfig({ ...config, functions: e.target.value })}
                          placeholder='[{"name": "get_weather", "description": "Get weather info", "parameters": {...}}]'
                          rows={6}
                          disabled={isSaving}
                          className="font-mono text-sm"
                        />
                        <p className="text-xs text-slate-500">
                          Define functions in OpenAI function calling format
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Base</CardTitle>
                  <CardDescription>Provide additional context and information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="knowledgeBase">Knowledge Base Content</Label>
                    <Textarea
                      id="knowledgeBase"
                      value={config.knowledgeBase}
                      onChange={(e) => setConfig({ ...config, knowledgeBase: e.target.value })}
                      placeholder="Add company info, FAQs, product details, or any contextual information..."
                      rows={8}
                      disabled={isSaving}
                    />
                    <p className="text-xs text-slate-500">
                      This content will be available to the agent during conversations
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="border-t px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Last updated: {new Date(agent.createdAt).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

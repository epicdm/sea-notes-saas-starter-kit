import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Palette, Type, Globe, Eye, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface WhiteLabelPageProps {
  accessToken: string;
}

export function WhiteLabelPage({ accessToken }: WhiteLabelPageProps) {
  const [platformName, setPlatformName] = useState("Epic.ai");
  const [tagline, setTagline] = useState("Voice AI Platform");
  const [primaryColor, setPrimaryColor] = useState("#3B82F6");
  const [previewMode, setPreviewMode] = useState<'light' | 'dark'>('light');
  const [selectedFont, setSelectedFont] = useState("inter");

  const handleSave = () => {
    toast.success("White-label settings saved");
  };

  const handlePublish = () => {
    toast.success("Changes published successfully");
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl mb-2">White-Label Settings</h1>
          <p className="text-slate-600">Customize the platform with your brand identity</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Branding</CardTitle>
                <CardDescription>Upload your logos and brand assets</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Light Mode Logo</Label>
                  <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">PNG, JPG or SVG. Recommended: 200x50px</p>
                  </div>
                </div>

                <div>
                  <Label>Dark Mode Logo</Label>
                  <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">PNG, JPG or SVG. Recommended: 200x50px</p>
                  </div>
                </div>

                <div>
                  <Label>Favicon</Label>
                  <div className="mt-2 border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-400">ICO or PNG. Recommended: 32x32px</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Colors</CardTitle>
                <CardDescription>Customize your brand colors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        defaultValue="#8B5CF6"
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input defaultValue="#8B5CF6" placeholder="#8B5CF6" />
                    </div>
                  </div>
                  <div>
                    <Label>Success Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        defaultValue="#10B981"
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input defaultValue="#10B981" placeholder="#10B981" />
                    </div>
                  </div>
                  <div>
                    <Label>Warning Color</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        type="color"
                        defaultValue="#F59E0B"
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input defaultValue="#F59E0B" placeholder="#F59E0B" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Label className="mb-3 block">Color Preview</Label>
                  <div className="flex gap-2">
                    <Button style={{ backgroundColor: primaryColor }}>Primary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
                <CardDescription>Choose your font style</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Font Family</Label>
                  <Select value={selectedFont} onValueChange={setSelectedFont}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter (Default)</SelectItem>
                      <SelectItem value="roboto">Roboto</SelectItem>
                      <SelectItem value="opensans">Open Sans</SelectItem>
                      <SelectItem value="lato">Lato</SelectItem>
                      <SelectItem value="poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 border-t">
                  <Label className="mb-3 block">Typography Preview</Label>
                  <div className="space-y-2">
                    <h1 className="text-4xl">Heading 1 - Epic.ai</h1>
                    <h2 className="text-2xl">Heading 2 - Dashboard</h2>
                    <p className="text-slate-600">Body text - The quick brown fox jumps over the lazy dog</p>
                    <p className="text-sm text-slate-500">Small text - Additional information</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Identity</CardTitle>
                <CardDescription>Customize platform name and messaging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Platform Name</Label>
                  <Input
                    value={platformName}
                    onChange={(e) => setPlatformName(e.target.value)}
                    placeholder="Epic.ai"
                    className="mt-2"
                  />
                  <p className="text-sm text-slate-500 mt-1">This will replace "Epic.ai" throughout the platform</p>
                </div>

                <div>
                  <Label>Tagline</Label>
                  <Input
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Voice AI Platform"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Footer Text</Label>
                  <Input
                    defaultValue="© 2025 All rights reserved"
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Domain</CardTitle>
                <CardDescription>Use your own domain name</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Custom Domain</Label>
                  <Input
                    placeholder="voice.yourdomain.com"
                    className="mt-2"
                  />
                  <p className="text-sm text-slate-500 mt-1">Enter your custom domain</p>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm mb-2">DNS Configuration</h4>
                  <p className="text-sm text-slate-600 mb-3">Add the following CNAME record to your DNS:</p>
                  <div className="space-y-1 text-sm font-mono bg-white p-3 rounded border">
                    <div><span className="text-slate-500">Type:</span> CNAME</div>
                    <div><span className="text-slate-500">Name:</span> voice</div>
                    <div><span className="text-slate-500">Value:</span> epic.ai</div>
                  </div>
                </div>

                <Button variant="outline">Verify Domain</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dashboard Customization</CardTitle>
                <CardDescription>Configure navigation and default views</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Default Landing Page</Label>
                  <Select defaultValue="dashboard">
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dashboard">Dashboard</SelectItem>
                      <SelectItem value="agents">AI Agents</SelectItem>
                      <SelectItem value="calls">Calls</SelectItem>
                      <SelectItem value="analytics">Analytics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-3 block">Visible Pages</Label>
                  <div className="space-y-2">
                    {[
                      { id: "dashboard", label: "Dashboard" },
                      { id: "agents", label: "AI Agents" },
                      { id: "phone-numbers", label: "Phone Numbers" },
                      { id: "calls", label: "Calls" },
                      { id: "leads", label: "Leads" },
                      { id: "campaigns", label: "Campaigns" },
                      { id: "analytics", label: "Analytics" },
                      { id: "testing", label: "Testing" },
                    ].map((page) => (
                      <div key={page.id} className="flex items-center space-x-2">
                        <Checkbox id={page.id} defaultChecked />
                        <label htmlFor={page.id} className="text-sm cursor-pointer">
                          {page.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={handleSave} variant="outline">
                Save as Draft
              </Button>
              <Button onClick={handlePublish} className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Publish Changes
              </Button>
            </div>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={previewMode === 'light' ? 'default' : 'outline'}
                        onClick={() => setPreviewMode('light')}
                      >
                        Light
                      </Button>
                      <Button
                        size="sm"
                        variant={previewMode === 'dark' ? 'default' : 'outline'}
                        onClick={() => setPreviewMode('dark')}
                      >
                        Dark
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`border rounded-lg overflow-hidden ${previewMode === 'dark' ? 'bg-slate-900' : 'bg-white'}`}>
                    {/* Preview of customized dashboard */}
                    <div className={`p-4 border-b ${previewMode === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <span className="text-sm">AI</span>
                        </div>
                        <div>
                          <div className={`text-sm ${previewMode === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                            {platformName}
                          </div>
                          <div className={`text-xs ${previewMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                            {tagline}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <div className={`text-xs ${previewMode === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Navigation</div>
                      {["Dashboard", "AI Agents", "Phone Numbers", "Calls"].map((item, idx) => (
                        <div 
                          key={idx}
                          className={`text-sm p-2 rounded ${
                            idx === 0 
                              ? previewMode === 'dark' ? 'bg-slate-800 text-white' : 'bg-slate-100'
                              : previewMode === 'dark' ? 'text-slate-300' : 'text-slate-700'
                          }`}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    <div className={`p-4 border-t ${previewMode === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                      <Button 
                        size="sm" 
                        className="w-full"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Create Agent
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start gap-2 text-sm">
                    <Eye className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-slate-900 mb-1">Preview Note</div>
                      <div className="text-slate-600 text-xs">
                        This is a simplified preview. Changes will be applied across all pages when published.
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

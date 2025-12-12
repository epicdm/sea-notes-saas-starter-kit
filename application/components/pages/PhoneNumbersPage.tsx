import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Phone, Plus, Loader2, Settings, Download, Upload, MessageSquare, Check, X, Search, Globe, MapPin, Bot } from "lucide-react";
import { PhoneNumber, getPhoneNumbers, assignPhoneNumber, Agent, getAgents } from "@/components/../utils/api";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface PhoneNumbersPageProps {
  accessToken: string;
}

export function PhoneNumbersPage({ accessToken }: PhoneNumbersPageProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhone, setSelectedPhone] = useState<PhoneNumber | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState<string>("__unassigned__");
  const [isBuyDialogOpen, setIsBuyDialogOpen] = useState(false);
  const [isPortDialogOpen, setIsPortDialogOpen] = useState(false);
  const [searchCountry, setSearchCountry] = useState("US");
  const [searchAreaCode, setSearchAreaCode] = useState("");
  const [availableNumbers, setAvailableNumbers] = useState<string[]>([]);
  const [portingNumber, setPortingNumber] = useState("");
  const [currentProvider, setCurrentProvider] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [phonesData, agentsData] = await Promise.all([
        getPhoneNumbers(accessToken),
        getAgents(accessToken)
      ]);
      // Filter out null values
      const validPhones = (phonesData || []).filter(phone => phone != null);
      const validAgents = (agentsData || []).filter(agent => agent != null && agent.id);
      setPhoneNumbers(validPhones);
      setAgents(validAgents);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error("Failed to load phone numbers");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignClick = (phone: PhoneNumber) => {
    setSelectedPhone(phone);
    setSelectedAgentId(phone.assignedAgentId || "__unassigned__");
    setIsAssignDialogOpen(true);
  };

  const handleAssign = async () => {
    if (!selectedPhone) return;

    try {
      const agentId = selectedAgentId === "__unassigned__" ? null : selectedAgentId;
      const updatedPhone = await assignPhoneNumber(
        accessToken, 
        selectedPhone.id, 
        agentId
      );
      
      setPhoneNumbers(phoneNumbers.map(p => 
        p.id === updatedPhone.id ? updatedPhone : p
      ));
      
      setIsAssignDialogOpen(false);
      toast.success(agentId ? "Phone number assigned!" : "Phone number unassigned!");
    } catch (error) {
      console.error('Error assigning phone:', error);
      toast.error("Failed to assign phone number");
    }
  };

  const totalPhones = phoneNumbers.length;
  const assignedPhones = phoneNumbers.filter(p => p.status === 'active').length;
  const availablePhones = totalPhones - assignedPhones;

  const getAgentName = (agentId?: string) => {
    if (!agentId) return null;
    const agent = agents.find(a => a.id === agentId);
    return agent?.name || 'Unknown Agent';
  };

  // Search for available numbers
  const searchNumbers = () => {
    // Mock available numbers
    const mockNumbers = Array.from({ length: 10 }, (_, i) => {
      const areaCode = searchAreaCode || "555";
      const prefix = Math.floor(Math.random() * 900 + 100);
      const line = Math.floor(Math.random() * 9000 + 1000);
      return `+1 (${areaCode}) ${prefix}-${line}`;
    });
    setAvailableNumbers(mockNumbers);
    toast.success(`Found ${mockNumbers.length} available numbers`);
  };

  // Purchase number
  const handlePurchaseNumber = (number: string) => {
    // Mock purchase - in production would call API
    const newPhone: PhoneNumber = {
      id: `phone_${Date.now()}`,
      number: number.replace(/\D/g, ''),
      formattedNumber: number,
      country: searchCountry,
      status: 'active',
      totalCalls: 0,
      totalMinutes: 0,
      totalCost: '0.00',
      capabilities: { voice: true, sms: true, mms: false },
      assignedAgentId: undefined
    };
    setPhoneNumbers([...phoneNumbers, newPhone]);
    setIsBuyDialogOpen(false);
    toast.success(`Purchased ${number}!`);
  };

  // Port number
  const handlePortNumber = () => {
    if (!portingNumber || !currentProvider) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Mock porting - in production would call API
    const newPhone: PhoneNumber = {
      id: `phone_${Date.now()}`,
      number: portingNumber.replace(/\D/g, ''),
      formattedNumber: portingNumber,
      country: 'US',
      status: 'pending',
      totalCalls: 0,
      totalMinutes: 0,
      totalCost: '0.00',
      capabilities: { voice: true, sms: true, mms: false },
      assignedAgentId: undefined
    };
    setPhoneNumbers([...phoneNumbers, newPhone]);
    setIsPortDialogOpen(false);
    setPortingNumber("");
    setCurrentProvider("");
    setAccountNumber("");
    toast.success("Porting request submitted! This usually takes 3-5 business days.");
  };

  // Toggle SMS capability
  const toggleSMS = (phoneId: string) => {
    setPhoneNumbers(phoneNumbers.map(p => 
      p.id === phoneId 
        ? { 
            ...p, 
            capabilities: { 
              voice: p.capabilities?.voice ?? true,
              sms: !(p.capabilities?.sms ?? false),
              mms: p.capabilities?.mms ?? false,
            } 
          }
        : p
    ));
    toast.success("SMS capability updated");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl mb-2">Phone Numbers</h1>
          <p className="text-slate-600 dark:text-slate-400">Manage your provisioned phone numbers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsPortDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Port Number
          </Button>
          <Button onClick={() => setIsBuyDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Buy Number
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Total Numbers</CardTitle>
              <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{totalPhones}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provisioned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Assigned</CardTitle>
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{assignedPhones}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              To agents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Available</CardTitle>
              <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">{availablePhones}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Unassigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">SMS Enabled</CardTitle>
              <MessageSquare className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl mb-1">
              {phoneNumbers.filter(p => p.capabilities?.sms).length}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              With SMS
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Phone Numbers List */}
      <div className="space-y-4">
        {phoneNumbers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Phone className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-2xl mb-2">No Phone Numbers</h3>
              <p className="text-slate-600 mb-6">
                Purchase phone numbers to start making calls
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Purchase Your First Number
              </Button>
            </CardContent>
          </Card>
        ) : (
          phoneNumbers.map(phone => (
            <Card key={phone.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${
                        phone.status === 'active' ? 'bg-green-100 dark:bg-green-900/20' : 
                        phone.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        <Phone className={`h-6 w-6 ${
                          phone.status === 'active' ? 'text-green-600 dark:text-green-400' : 
                          phone.status === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                          'text-slate-400'
                        }`} />
                      </div>
                      <div>
                        <div className="text-xl mb-1">{phone.formattedNumber}</div>
                        <div className="flex items-center gap-2 text-sm">
                          <Badge variant={phone.status === 'active' ? 'default' : phone.status === 'pending' ? 'secondary' : 'outline'}>
                            {phone.status}
                          </Badge>
                          {phone.country && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {phone.country}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAssignClick(phone)}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        {phone.assignedAgentId ? 'Reassign' : 'Assign'}
                      </Button>
                    </div>
                  </div>

                  {/* Assignment Info */}
                  {phone.assignedAgentId && getAgentName(phone.assignedAgentId) && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
                      <Bot className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-slate-700 dark:text-slate-300">
                        Assigned to <span className="font-medium">{getAgentName(phone.assignedAgentId)}</span>
                      </span>
                    </div>
                  )}
                  {!phone.assignedAgentId && (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm text-slate-600 dark:text-slate-400">
                      <X className="h-4 w-4" />
                      <span>Not assigned to any agent</span>
                    </div>
                  )}

                  {/* Stats & Capabilities */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-slate-700">
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Usage Stats</div>
                      <div className="space-y-1 text-sm">
                        <div>{phone.totalCalls} calls</div>
                        <div>{Math.floor(phone.totalMinutes / 60)}h {phone.totalMinutes % 60}m total</div>
                        <div className="text-slate-500">${phone.totalCost} cost</div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">Capabilities</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">Voice Calls</span>
                          <Badge variant={phone.capabilities?.voice ? 'default' : 'outline'}>
                            {phone.capabilities?.voice ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">SMS</span>
                          <Switch
                            checked={phone.capabilities?.sms || false}
                            onCheckedChange={() => toggleSMS(phone.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Assign Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPhone?.assignedAgentId ? 'Reassign' : 'Assign'} Phone Number
            </DialogTitle>
            <DialogDescription>
              {selectedPhone?.formattedNumber}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm">Assign to Agent</label>
              <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an agent or leave unassigned" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__unassigned__">Unassign (No Agent)</SelectItem>
                  {agents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name} ({agent.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssign}>
              Save Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Buy Number Dialog */}
      <Dialog open={isBuyDialogOpen} onOpenChange={setIsBuyDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buy Phone Number</DialogTitle>
            <DialogDescription>
              Search and purchase phone numbers for your agents
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="search">Search Numbers</TabsTrigger>
              <TabsTrigger value="results">Available Numbers</TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Select value={searchCountry} onValueChange={setSearchCountry}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Area Code (Optional)</Label>
                  <Input
                    placeholder="e.g., 415, 212, 310"
                    value={searchAreaCode}
                    onChange={(e) => setSearchAreaCode(e.target.value)}
                    maxLength={3}
                  />
                </div>
              </div>

              <Button onClick={searchNumbers} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Search Available Numbers
              </Button>
            </TabsContent>

            <TabsContent value="results" className="py-4">
              {availableNumbers.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  Click "Search Available Numbers" to find phone numbers
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {availableNumbers.map((number, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="font-mono">{number}</span>
                      </div>
                      <Button size="sm" onClick={() => handlePurchaseNumber(number)}>
                        Purchase $1/mo
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBuyDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Port Number Dialog */}
      <Dialog open={isPortDialogOpen} onOpenChange={setIsPortDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Port Existing Number</DialogTitle>
            <DialogDescription>
              Transfer your existing phone number to our platform
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Phone Number to Port</Label>
              <Input
                placeholder="+1 (555) 123-4567"
                value={portingNumber}
                onChange={(e) => setPortingNumber(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Current Provider</Label>
              <Input
                placeholder="e.g., Verizon, AT&T, T-Mobile"
                value={currentProvider}
                onChange={(e) => setCurrentProvider(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Account Number (Optional)</Label>
              <Input
                placeholder="Your account number with current provider"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
              <p className="text-slate-700 dark:text-slate-300">
                <strong>Note:</strong> Number porting typically takes 3-5 business days. 
                You'll receive updates via email throughout the process.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPortDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePortNumber}>
              Submit Porting Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

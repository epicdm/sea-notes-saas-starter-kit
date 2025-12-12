'use client'
import { useSession } from 'next-auth/react'

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CreditCard, Download, TrendingUp, TrendingDown, DollarSign, Loader2, Check, Zap, ArrowRight, AlertCircle, Plus, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  period: string;
}

interface BillingPageProps {
  // TODO: Remove accessToken prop, use useSession() hook instead
  accessToken: string;
}

type Plan = 'starter' | 'professional' | 'enterprise';

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank';
  last4: string;
  brand?: string;
  expiry?: string;
  isDefault: boolean;
}

export default function BillingPage({ accessToken }: BillingPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan>('professional');
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [isAddPaymentDialogOpen, setIsAddPaymentDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan>('professional');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', type: 'card', last4: '4242', brand: 'Visa', expiry: '12/2026', isDefault: true },
    { id: '2', type: 'card', last4: '5555', brand: 'Mastercard', expiry: '09/2027', isDefault: false }
  ]);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setIsLoading(true);
      // Mock data
      setInvoices([
        { id: "INV-001", date: "2025-10-01", amount: 234.56, status: "paid", period: "Oct 2025" },
        { id: "INV-002", date: "2025-09-01", amount: 198.32, status: "paid", period: "Sep 2025" },
        { id: "INV-003", date: "2025-08-01", amount: 276.89, status: "paid", period: "Aug 2025" },
        { id: "INV-004", date: "2025-07-01", amount: 312.45, status: "paid", period: "Jul 2025" },
      ]);
    } catch (error) {
      console.error('Error loading billing data:', error);
      toast.error("Failed to load billing data");
    } finally {
      setIsLoading(false);
    }
  };

  const currentMonth = {
    calls: 1247,
    minutes: 2456,
    cost: 234.56,
    trend: { value: "+12%", isPositive: true }
  };

  const costBreakdown = [
    { name: "STT", value: 45.60, percentage: 19, color: "#3B82F6" },
    { name: "LLM", value: 98.34, percentage: 42, color: "#8B5CF6" },
    { name: "TTS", value: 52.12, percentage: 22, color: "#10B981" },
    { name: "Telecom", value: 38.50, percentage: 17, color: "#F59E0B" },
  ];

  const dailyCosts = [
    { date: "Oct 24", cost: 8.5 },
    { date: "Oct 25", cost: 12.3 },
    { date: "Oct 26", cost: 9.8 },
    { date: "Oct 27", cost: 15.6 },
    { date: "Oct 28", cost: 11.2 },
    { date: "Oct 29", cost: 14.8 },
    { date: "Oct 30", cost: 13.4 },
    { date: "Oct 31", cost: 10.9 },
  ];

  const plans = {
    starter: {
      name: 'Starter',
      price: 49,
      limits: { calls: 500, agents: 2, minutes: 1000 },
      features: ['2 AI Agents', '500 calls/month', '1,000 minutes', 'Basic analytics', 'Email support']
    },
    professional: {
      name: 'Professional',
      price: 199,
      limits: { calls: 5000, agents: 10, minutes: 10000 },
      features: ['10 AI Agents', '5,000 calls/month', '10,000 minutes', 'Advanced analytics', 'Priority support', 'Custom integrations']
    },
    enterprise: {
      name: 'Enterprise',
      price: 999,
      limits: { calls: -1, agents: -1, minutes: -1 },
      features: ['Unlimited AI Agents', 'Unlimited calls', 'Unlimited minutes', 'Advanced analytics', '24/7 support', 'Custom integrations', 'White-label options', 'Dedicated account manager']
    }
  };

  const usage = {
    calls: { used: currentMonth.calls, limit: plans[currentPlan].limits.calls },
    minutes: { used: currentMonth.minutes, limit: plans[currentPlan].limits.minutes },
    agents: { used: 3, limit: plans[currentPlan].limits.agents }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const handleUpgradePlan = () => {
    setCurrentPlan(selectedPlan);
    setIsUpgradeDialogOpen(false);
    toast.success(`Successfully upgraded to ${plans[selectedPlan].name} plan!`);
  };

  const handleAddPaymentMethod = () => {
    const newMethod: PaymentMethod = {
      id: `${paymentMethods.length + 1}`,
      type: 'card',
      last4: '1234',
      brand: 'Visa',
      expiry: '12/2028',
      isDefault: false
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    setIsAddPaymentDialogOpen(false);
    toast.success("Payment method added successfully");
  };

  const handleSetDefaultPayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
    toast.success("Default payment method updated");
  };

  const handleDeletePayment = (id: string) => {
    const method = paymentMethods.find(pm => pm.id === id);
    if (method?.isDefault) {
      toast.error("Cannot delete default payment method");
      return;
    }
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    toast.success("Payment method deleted");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-slate-100 text-slate-700';
    }
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
      <div>
        <h1 className="text-4xl mb-2">Billing & Usage</h1>
        <p className="text-slate-600 dark:text-slate-400">Monitor your usage and manage billing</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plan">Plan & Usage</TabsTrigger>
          <TabsTrigger value="payment">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">

      {/* Current Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <DollarSign className="h-5 w-5 text-blue-600" />
              </div>
              <div className={`flex items-center gap-1 text-sm ${
                currentMonth.trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentMonth.trend.isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                {currentMonth.trend.value}
              </div>
            </div>
            <div className="text-3xl mb-1">${currentMonth.cost.toFixed(2)}</div>
            <div className="text-sm text-slate-600">Current Month Cost</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="p-3 rounded-lg bg-purple-100 mb-4 inline-block">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-3xl mb-1">{currentMonth.calls}</div>
            <div className="text-sm text-slate-600">Total Calls</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="p-3 rounded-lg bg-green-100 mb-4 inline-block">
              <CreditCard className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-3xl mb-1">{Math.floor(currentMonth.minutes / 60)}h {currentMonth.minutes % 60}m</div>
            <div className="text-sm text-slate-600">Total Minutes</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="p-3 rounded-lg bg-orange-100 mb-4 inline-block">
              <DollarSign className="h-5 w-5 text-orange-600" />
            </div>
            <div className="text-3xl mb-1">${(currentMonth.cost / currentMonth.calls).toFixed(2)}</div>
            <div className="text-sm text-slate-600">Avg Cost per Call</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Cost Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Cost Trend</CardTitle>
            <CardDescription>Cost per day over the last week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  formatter={(value: any) => `$${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area type="monotone" dataKey="cost" stroke="#3B82F6" fill="#93C5FD" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Cost Breakdown</CardTitle>
            <CardDescription>Current month by service</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2">
              {costBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-500">{item.percentage}%</span>
                    <span className="text-sm">${item.value.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        {/* Plan & Usage Tab */}
        <TabsContent value="plan" className="space-y-6 mt-6">
          {/* Current Plan */}
          <Card className="border-2 border-blue-200 dark:border-blue-800">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plans[currentPlan].name} Plan
                    <Badge variant="default">Current</Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">
                    ${plans[currentPlan].price}/month
                  </CardDescription>
                </div>
                <Button onClick={() => setIsUpgradeDialogOpen(true)}>
                  <Zap className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {plans[currentPlan].features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Usage Limits */}
          <Card>
            <CardHeader>
              <CardTitle>Usage This Month</CardTitle>
              <CardDescription>Track your usage against plan limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Calls */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Calls</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {usage.calls.used.toLocaleString()} / {usage.calls.limit === -1 ? '∞' : usage.calls.limit.toLocaleString()}
                  </span>
                </div>
                {usage.calls.limit !== -1 && (
                  <>
                    <Progress value={getUsagePercentage(usage.calls.used, usage.calls.limit)} />
                    {getUsagePercentage(usage.calls.used, usage.calls.limit) > 80 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          You've used {Math.round(getUsagePercentage(usage.calls.used, usage.calls.limit))}% of your call limit
                        </AlertDescription>
                      </Alert>
                    )}
                  </>
                )}
              </div>

              {/* Minutes */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Minutes</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {usage.minutes.used.toLocaleString()} / {usage.minutes.limit === -1 ? '∞' : usage.minutes.limit.toLocaleString()}
                  </span>
                </div>
                {usage.minutes.limit !== -1 && (
                  <Progress value={getUsagePercentage(usage.minutes.used, usage.minutes.limit)} />
                )}
              </div>

              {/* Agents */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">AI Agents</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    {usage.agents.used} / {usage.agents.limit === -1 ? '∞' : usage.agents.limit}
                  </span>
                </div>
                {usage.agents.limit !== -1 && (
                  <Progress value={getUsagePercentage(usage.agents.used, usage.agents.limit)} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Methods Tab */}
        <TabsContent value="payment" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods</CardDescription>
                </div>
                <Button onClick={() => setIsAddPaymentDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center gap-4 p-4 border dark:border-slate-700 rounded-lg">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
                    <CreditCard className="h-6 w-4" />
                  </div>
                  <div className="flex-1">
                    <div>{method.brand} ending in {method.last4}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">
                      {method.expiry ? `Expires ${method.expiry}` : 'Bank account'}
                    </div>
                  </div>
                  {method.isDefault && <Badge variant="outline">Default</Badge>}
                  <div className="flex gap-2">
                    {!method.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefaultPayment(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeletePayment(method.id)}
                      disabled={method.isDefault}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View and download past invoices</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.id}</TableCell>
                      <TableCell>{formatDate(invoice.date)}</TableCell>
                      <TableCell>{invoice.period}</TableCell>
                      <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(invoice.status)} variant="outline">
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade Plan Dialog */}
      <Dialog open={isUpgradeDialogOpen} onOpenChange={setIsUpgradeDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose Your Plan</DialogTitle>
            <DialogDescription>
              Select the plan that best fits your needs
            </DialogDescription>
          </DialogHeader>

          <div className="grid md:grid-cols-3 gap-6 py-6">
            {(Object.keys(plans) as Plan[]).map((planKey) => {
              const plan = plans[planKey];
              const isCurrent = planKey === currentPlan;
              const isSelected = planKey === selectedPlan;

              return (
                <Card 
                  key={planKey}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'border-2 border-blue-600' : ''
                  } ${isCurrent ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                  onClick={() => setSelectedPlan(planKey)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      {plan.name}
                      {isCurrent && <Badge variant="default">Current</Badge>}
                    </CardTitle>
                    <div className="text-3xl font-bold">${plan.price}<span className="text-sm font-normal text-slate-500">/mo</span></div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                    <Button 
                      className="w-full" 
                      variant={isSelected ? "default" : "outline"}
                      disabled={isCurrent}
                    >
                      {isCurrent ? 'Current Plan' : isSelected ? 'Selected' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
            <Button variant="outline" onClick={() => setIsUpgradeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpgradePlan}
              disabled={selectedPlan === currentPlan}
            >
              {plans[selectedPlan].price > plans[currentPlan].price ? 'Upgrade' : 'Downgrade'} to {plans[selectedPlan].name}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Dialog */}
      <Dialog open={isAddPaymentDialogOpen} onOpenChange={setIsAddPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a credit card or bank account
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="card-number">Card Number</Label>
              <Input id="card-number" placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input id="cvc" placeholder="123" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Cardholder Name</Label>
              <Input id="name" placeholder="John Doe" />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsAddPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPaymentMethod}>
              Add Payment Method
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

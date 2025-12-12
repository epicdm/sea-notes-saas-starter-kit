import { useState } from 'react';
import { X, Plus, Play, Pause, Trophy, TrendingUp, Users, Phone, CheckCircle, Copy, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';

interface ABTestingModalProps {
  open: boolean;
  onClose: () => void;
  funnelId?: string;
  funnelName?: string;
}

export function ABTestingModal({ open, onClose, funnelId, funnelName }: ABTestingModalProps) {
  const [tests, setTests] = useState<any[]>([
    {
      id: 'test_1',
      name: 'Greeting Message Test',
      status: 'running',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      trafficSplit: 50,
      variants: [
        {
          id: 'var_a',
          name: 'Variant A (Control)',
          description: 'Original greeting: "Hi, thanks for calling!"',
          calls: 234,
          qualified: 89,
          conversionRate: 38.0,
          avgCallDuration: 245,
        },
        {
          id: 'var_b',
          name: 'Variant B',
          description: 'New greeting: "Hello! How can I help you find your dream home today?"',
          calls: 241,
          qualified: 103,
          conversionRate: 42.7,
          avgCallDuration: 268,
        },
      ],
      winner: null,
      confidence: 87,
    },
    {
      id: 'test_2',
      name: 'Qualification Questions Order',
      status: 'completed',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      trafficSplit: 50,
      variants: [
        {
          id: 'var_a',
          name: 'Variant A',
          description: 'Budget first, then location',
          calls: 512,
          qualified: 187,
          conversionRate: 36.5,
          avgCallDuration: 234,
        },
        {
          id: 'var_b',
          name: 'Variant B (Winner)',
          description: 'Location first, then budget',
          calls: 498,
          qualified: 213,
          conversionRate: 42.8,
          avgCallDuration: 251,
        },
      ],
      winner: 'var_b',
      confidence: 95,
    },
  ]);

  const [showCreateTest, setShowCreateTest] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    description: '',
    variantA: { name: 'Variant A', description: '' },
    variantB: { name: 'Variant B', description: '' },
    trafficSplit: 50,
  });

  const handleCreateTest = () => {
    if (!newTest.name || !newTest.variantA.description || !newTest.variantB.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const test = {
      id: `test_${Date.now()}`,
      name: newTest.name,
      status: 'draft',
      startDate: new Date().toISOString(),
      trafficSplit: newTest.trafficSplit,
      variants: [
        {
          id: 'var_a',
          name: newTest.variantA.name,
          description: newTest.variantA.description,
          calls: 0,
          qualified: 0,
          conversionRate: 0,
          avgCallDuration: 0,
        },
        {
          id: 'var_b',
          name: newTest.variantB.name,
          description: newTest.variantB.description,
          calls: 0,
          qualified: 0,
          conversionRate: 0,
          avgCallDuration: 0,
        },
      ],
      winner: null,
      confidence: 0,
    };

    setTests([test, ...tests]);
    setShowCreateTest(false);
    setNewTest({
      name: '',
      description: '',
      variantA: { name: 'Variant A', description: '' },
      variantB: { name: 'Variant B', description: '' },
      trafficSplit: 50,
    });
    toast.success('A/B test created!');
  };

  const handleStartTest = (testId: string) => {
    setTests(tests.map(test => 
      test.id === testId ? { ...test, status: 'running', startDate: new Date().toISOString() } : test
    ));
    toast.success('Test started!');
  };

  const handleStopTest = (testId: string) => {
    setTests(tests.map(test => 
      test.id === testId ? { ...test, status: 'paused' } : test
    ));
    toast.success('Test paused');
  };

  const handleDeclareWinner = (testId: string, variantId: string) => {
    setTests(tests.map(test => 
      test.id === testId 
        ? { ...test, status: 'completed', winner: variantId, endDate: new Date().toISOString() } 
        : test
    ));
    toast.success('Winner declared! This variant will be applied to all traffic.');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500">Running</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getWinnerInfo = (test: any) => {
    if (!test.winner) return null;
    
    const winner = test.variants.find((v: any) => v.id === test.winner);
    const loser = test.variants.find((v: any) => v.id !== test.winner);
    
    if (!winner || !loser) return null;
    
    const improvement = ((winner.conversionRate - loser.conversionRate) / loser.conversionRate * 100).toFixed(1);
    
    return { winner, loser, improvement };
  };

  if (showCreateTest) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create A/B Test</DialogTitle>
            <DialogDescription>
              Test different variations to optimize your funnel performance
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Test Info */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="test-name">Test Name *</Label>
                <Input
                  id="test-name"
                  placeholder="e.g., Greeting Message Test"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="test-description">Description (Optional)</Label>
                <Textarea
                  id="test-description"
                  placeholder="What are you testing and why?"
                  value={newTest.description}
                  onChange={(e) => setNewTest({ ...newTest, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <Separator />

            {/* Variants */}
            <div className="space-y-4">
              <h4 className="font-medium">Variants</h4>
              
              {/* Variant A */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Variant A (Control)</CardTitle>
                  <CardDescription>This is your current version</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="var-a-name">Name</Label>
                    <Input
                      id="var-a-name"
                      value={newTest.variantA.name}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        variantA: { ...newTest.variantA, name: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="var-a-desc">Description *</Label>
                    <Textarea
                      id="var-a-desc"
                      placeholder="Describe this variant (e.g., script, questions, approach)"
                      value={newTest.variantA.description}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        variantA: { ...newTest.variantA, description: e.target.value }
                      })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Variant B */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Variant B</CardTitle>
                  <CardDescription>This is the new version you want to test</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor="var-b-name">Name</Label>
                    <Input
                      id="var-b-name"
                      value={newTest.variantB.name}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        variantB: { ...newTest.variantB, name: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="var-b-desc">Description *</Label>
                    <Textarea
                      id="var-b-desc"
                      placeholder="Describe this variant (e.g., script, questions, approach)"
                      value={newTest.variantB.description}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        variantB: { ...newTest.variantB, description: e.target.value }
                      })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Traffic Split */}
            <div>
              <Label>Traffic Split</Label>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Variant A: {newTest.trafficSplit}%
                  </div>
                  <Progress value={newTest.trafficSplit} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">
                    Variant B: {100 - newTest.trafficSplit}%
                  </div>
                  <Progress value={100 - newTest.trafficSplit} />
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                We recommend 50/50 for most tests. Adjust only if you have a specific reason.
              </p>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t dark:border-slate-700">
            <Button variant="outline" onClick={() => setShowCreateTest(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTest}>
              Create Test
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">A/B Testing</DialogTitle>
              <DialogDescription>
                {funnelName ? `Optimize ${funnelName} with A/B testing` : 'Run experiments to improve performance'}
              </DialogDescription>
            </div>
            <Button onClick={() => setShowCreateTest(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Test
            </Button>
          </div>
        </DialogHeader>

        {tests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <TrendingUp className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
              <h3 className="text-xl mb-2">No A/B Tests Yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6 text-center max-w-md">
                Start testing different variations of your funnel to find what converts best
              </p>
              <Button onClick={() => setShowCreateTest(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Test
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Tests</div>
                  <div className="text-2xl font-bold">{tests.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Running</div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {tests.filter(t => t.status === 'running').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Completed</div>
                  <div className="text-2xl font-bold">
                    {tests.filter(t => t.status === 'completed').length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Avg Improvement</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    +12.5%
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tests List */}
            <div className="space-y-6">
              {tests.map((test) => {
                const winnerInfo = getWinnerInfo(test);
                const comparisonData = test.variants.map((variant: any) => ({
                  name: variant.name,
                  'Conversion Rate': variant.conversionRate,
                  'Calls': variant.calls,
                }));

                return (
                  <Card key={test.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-xl">{test.name}</CardTitle>
                            {getStatusBadge(test.status)}
                            {test.winner && (
                              <Badge className="bg-yellow-500">
                                <Trophy className="h-3 w-3 mr-1" />
                                Winner Declared
                              </Badge>
                            )}
                          </div>
                          <CardDescription>
                            Started {new Date(test.startDate).toLocaleDateString()}
                            {test.endDate && ` • Ended ${new Date(test.endDate).toLocaleDateString()}`}
                            {test.confidence > 0 && ` • ${test.confidence}% confidence`}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {test.status === 'draft' && (
                            <Button size="sm" onClick={() => handleStartTest(test.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              Start Test
                            </Button>
                          )}
                          {test.status === 'running' && (
                            <Button variant="outline" size="sm" onClick={() => handleStopTest(test.id)}>
                              <Pause className="h-4 w-4 mr-2" />
                              Pause
                            </Button>
                          )}
                          {test.status === 'paused' && (
                            <Button size="sm" onClick={() => handleStartTest(test.id)}>
                              <Play className="h-4 w-4 mr-2" />
                              Resume
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Winner Banner */}
                      {winnerInfo && (
                        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">{winnerInfo.winner.name} is the winner!</h4>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                  Achieved {winnerInfo.winner.conversionRate}% conversion rate, a{' '}
                                  <span className="font-medium text-green-600 dark:text-green-400">
                                    +{winnerInfo.improvement}% improvement
                                  </span>{' '}
                                  over the control variant.
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Variants Comparison */}
                      <div className="grid grid-cols-2 gap-4">
                        {test.variants.map((variant: any) => {
                          const isWinner = test.winner === variant.id;
                          
                          return (
                            <Card 
                              key={variant.id}
                              className={isWinner ? 'border-green-500 border-2' : ''}
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base">{variant.name}</CardTitle>
                                  {isWinner && (
                                    <Badge className="bg-green-500">
                                      <Trophy className="h-3 w-3 mr-1" />
                                      Winner
                                    </Badge>
                                  )}
                                </div>
                                <CardDescription className="text-sm">
                                  {variant.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <div className="text-slate-600 dark:text-slate-400">Calls</div>
                                    <div className="text-xl font-bold">{variant.calls}</div>
                                  </div>
                                  <div>
                                    <div className="text-slate-600 dark:text-slate-400">Qualified</div>
                                    <div className="text-xl font-bold">{variant.qualified}</div>
                                  </div>
                                </div>
                                
                                <Separator />
                                
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                      Conversion Rate
                                    </span>
                                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                      {variant.conversionRate}%
                                    </span>
                                  </div>
                                  <Progress value={variant.conversionRate} className="h-2" />
                                </div>
                                
                                <div className="text-sm">
                                  <span className="text-slate-600 dark:text-slate-400">Avg Call Duration:</span>{' '}
                                  <span className="font-medium">
                                    {Math.floor(variant.avgCallDuration / 60)}:{String(variant.avgCallDuration % 60).padStart(2, '0')}
                                  </span>
                                </div>

                                {test.status === 'running' && !test.winner && variant.conversionRate > 0 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-2"
                                    onClick={() => handleDeclareWinner(test.id, variant.id)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Declare Winner
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>

                      {/* Performance Chart */}
                      {test.variants[0].calls > 0 && (
                        <div>
                          <h4 className="font-medium mb-3">Performance Comparison</h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={comparisonData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis yAxisId="left" />
                              <YAxis yAxisId="right" orientation="right" />
                              <Tooltip />
                              <Legend />
                              <Bar yAxisId="left" dataKey="Conversion Rate" fill="#3b82f6" name="Conversion Rate (%)" />
                              <Bar yAxisId="right" dataKey="Calls" fill="#10b981" name="Total Calls" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}

                      {/* Statistical Significance */}
                      {test.status === 'running' && test.confidence > 0 && !test.winner && (
                        <Card className={test.confidence >= 95 ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {test.confidence >= 95 ? (
                                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                              ) : (
                                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                              )}
                              <div className="flex-1">
                                <h4 className="font-medium mb-1">
                                  Statistical Confidence: {test.confidence}%
                                </h4>
                                <p className="text-sm">
                                  {test.confidence >= 95 
                                    ? 'This test has reached statistical significance! You can declare a winner.'
                                    : 'Keep the test running to reach 95% confidence before declaring a winner.'
                                  }
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

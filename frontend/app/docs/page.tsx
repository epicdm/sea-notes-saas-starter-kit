'use client'

import Link from 'next/link'
import { Button } from '@heroui/react'
import { ArrowLeft, Book, Zap, Phone, Code, Settings } from 'lucide-react'

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Documentation</h1>
            <Link href="/">
              <Button variant="bordered" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Introduction */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">Getting Started</h2>
          <p className="text-lg text-muted-foreground mb-6">
            Welcome to Epic.ai! This guide will help you build and deploy your first AI voice agent in minutes.
          </p>
          <Link href="/dashboard">
            <Button color="primary" size="lg">
              Start Building Now
            </Button>
          </Link>
        </section>

        {/* Quick Start Guide */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Step 1 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">1. Create Your Agent</h3>
              <p className="text-muted-foreground mb-4">
                Navigate to the dashboard and create your first AI agent. Configure its personality,
                voice, and behavior to match your use case.
              </p>
              <Link href="/dashboard/agents/new">
                <Button variant="bordered" size="sm">
                  Create Agent
                </Button>
              </Link>
            </div>

            {/* Step 2 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">2. Get a Phone Number</h3>
              <p className="text-muted-foreground mb-4">
                Provision a phone number and assign it to your agent. Your agent will be ready
                to receive calls immediately.
              </p>
              <Link href="/dashboard/phone-numbers">
                <Button variant="bordered" size="sm">
                  Get Number
                </Button>
              </Link>
            </div>

            {/* Step 3 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">3. Test Your Agent</h3>
              <p className="text-muted-foreground mb-4">
                Make a test call to your agent's phone number. Monitor the conversation in real-time
                and review the transcript.
              </p>
              <Link href="/dashboard/calls">
                <Button variant="bordered" size="sm">
                  View Calls
                </Button>
              </Link>
            </div>

            {/* Step 4 */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="rounded-lg bg-primary/10 p-3 w-fit mb-4">
                <Settings className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">4. Integrate & Deploy</h3>
              <p className="text-muted-foreground mb-4">
                Use our REST API to integrate your agent with your existing systems.
                Deploy to production with confidence.
              </p>
              <Link href="/dashboard/settings">
                <Button variant="bordered" size="sm">
                  View Settings
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* API Documentation */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">API Documentation</h2>
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-start gap-4">
              <Code className="h-6 w-6 text-primary mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-2">REST API</h3>
                <p className="text-muted-foreground mb-4">
                  Integrate Epic.ai into your applications using our REST API. Create agents,
                  make calls, and retrieve transcripts programmatically.
                </p>
                <pre className="bg-muted/50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                  <code className="text-muted-foreground"># Example: Create an agent</code>
                  {'\n'}
                  <code className="text-foreground">
{`curl -X POST https://api.epic.ai/v1/agents \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Support Agent", "voice": "echo"}'`}
                  </code>
                </pre>
                <div className="mt-4">
                  <Link href="/dashboard/settings">
                    <Button variant="bordered" size="sm">
                      Get API Key
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Resources */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Example Agents</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Browse pre-built agent templates for common use cases.
              </p>
              <Link href="/dashboard/agents">
                <Button variant="light" size="sm" className="text-primary">
                  View Examples →
                </Button>
              </Link>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Best Practices</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Learn how to optimize your agents for production.
              </p>
              <Link href="/dashboard">
                <Button variant="light" size="sm" className="text-primary">
                  Learn More →
                </Button>
              </Link>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-2">Support</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Get help from our team or community.
              </p>
              <Link href="/dashboard/settings">
                <Button variant="light" size="sm" className="text-primary">
                  Contact Support →
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

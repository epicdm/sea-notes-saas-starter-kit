import { Button } from "@/components/ui/button";
import { Bot, MessageSquare, Mic, Zap, Shield, Code, ArrowRight } from "lucide-react";

interface LandingPageProps {
  onGetStarted: () => void;
}

export function LandingPage({ onGetStarted }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navbar */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            <span className="text-xl">AI Agent Studio</span>
          </div>
          <Button onClick={onGetStarted}>Get Started</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm mb-4">
            <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            Trusted by 10,000+ developers worldwide
          </div>
          <h1 className="text-7xl tracking-tight">
            Build Powerful AI Agents
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              In Minutes, Not Months
            </span>
          </h1>
          <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            The complete platform for building, deploying, and managing AI voice and chat agents. 
            <span className="text-slate-900"> No coding required.</span> Production-ready in minutes.
          </p>
          <div className="flex gap-4 justify-center pt-6">
            <Button size="lg" className="h-14 px-8 text-lg" onClick={onGetStarted}>
              Start Building Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg">
              View Live Demo
            </Button>
          </div>
          <p className="text-sm text-slate-500 pt-4">
            Free tier available • No credit card required • Deploy in minutes
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-6 py-20">
        <h2 className="text-4xl text-center mb-16">
          Everything You Need to Build AI Agents
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Mic className="h-10 w-10 text-blue-600" />}
            title="Voice AI Agents"
            description="Build natural-sounding voice agents with advanced speech recognition and synthesis capabilities."
          />
          <FeatureCard
            icon={<MessageSquare className="h-10 w-10 text-blue-600" />}
            title="Chat AI Agents"
            description="Create intelligent chatbots with context awareness and multi-turn conversation support."
          />
          <FeatureCard
            icon={<Zap className="h-10 w-10 text-blue-600" />}
            title="Lightning Fast"
            description="Deploy and scale your agents instantly with our optimized infrastructure and low latency."
          />
          <FeatureCard
            icon={<Shield className="h-10 w-10 text-blue-600" />}
            title="Secure & Private"
            description="Enterprise-grade security with end-to-end encryption and compliance certifications."
          />
          <FeatureCard
            icon={<Code className="h-10 w-10 text-blue-600" />}
            title="Developer Friendly"
            description="Simple APIs, extensive documentation, and SDKs for all major programming languages."
          />
          <FeatureCard
            icon={<Bot className="h-10 w-10 text-blue-600" />}
            title="Advanced AI Models"
            description="Access to the latest AI models including GPT-4, Claude, and custom fine-tuned models."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of developers building the future of AI
          </p>
          <Button size="lg" variant="secondary" onClick={onGetStarted}>
            Create Your First Agent
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-6 text-center text-slate-600">
          <p>&copy; 2024 AI Agent Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-6 rounded-lg border bg-white hover:shadow-lg transition-shadow">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Bot, Phone, BarChart3, Settings, Home, Moon, Sun, LogOut, Key, Store, Shield, TestTube2, Building2, Users, BellRing, Webhook, ChevronDown } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useSession, signOut } from 'next-auth/react'
import { BalanceWidget } from '@/components/BalanceWidget'
import { useState } from 'react'

// Organize navigation into logical sections
const navigationSections = [
  {
    section: 'Core',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'AI Agents', href: '/dashboard/agents', icon: Bot },
      { name: 'Phone Numbers', href: '/dashboard/phone-numbers', icon: Phone },
    ],
  },
  {
    section: 'Engagement',
    items: [
      { name: 'Calls', href: '/dashboard/calls', icon: Phone },
      { name: 'Leads', href: '/dashboard/leads', icon: Users },
      { name: 'Campaigns', href: '/dashboard/campaigns', icon: BellRing },
    ],
  },
  {
    section: 'Tools',
    items: [
      { name: 'Testing', href: '/dashboard/testing', icon: TestTube2 },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Marketplace', href: '/dashboard/marketplace', icon: Store },
    ],
  },
  {
    section: 'Developer',
    items: [
      { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
      { name: 'Webhooks', href: '/dashboard/integrations/webhooks', icon: Webhook },
    ],
  },
  {
    section: 'Account',
    items: [
      { name: 'White-Label', href: '/dashboard/white-label', icon: Building2 },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ],
  },
]

const ADMIN_EMAILS = ['admin@epic.dm']

export default function Sidebar() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useTheme()
  const { data: session } = useSession()
  const [expandedSections, setExpandedSections] = useState<string[]>(['Core', 'Engagement'])

  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section)
        ? prev.filter((s) => s !== section)
        : [...prev, section]
    )
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border">
      {/* Logo Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-md">
            <Bot className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Epic.ai</h1>
            <p className="text-xs font-medium text-muted-foreground">Voice AI</p>
          </div>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Sun className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navigationSections.map((section) => {
          const isExpanded = expandedSections.includes(section.section)
          const hasActiveItem = section.items.some((item) => pathname === item.href)

          return (
            <div key={section.section} className="mb-4">
              <button
                onClick={() => toggleSection(section.section)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
              >
                <span>{section.section}</span>
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              {isExpanded && (
                <div className="space-y-1 mt-2">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        )}
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {/* Admin Panel Link - Only visible to admins */}
        {isAdmin && (
          <>
            <div className="border-t border-border my-4" />
            <Link
              href="/admin"
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200',
                pathname === '/admin'
                  ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              )}
            >
              <Shield className="h-4 w-4 flex-shrink-0" />
              Admin Panel
            </Link>
          </>
        )}
      </nav>

      {/* Balance Widget */}
      <BalanceWidget compact />

      {/* User Profile */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-xs font-bold text-primary-foreground shadow-md flex-shrink-0">
            {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{session?.user?.name || 'User'}</p>
            <p className="text-xs text-muted-foreground truncate">{session?.user?.email || 'user@example.com'}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/auth/signin' })}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

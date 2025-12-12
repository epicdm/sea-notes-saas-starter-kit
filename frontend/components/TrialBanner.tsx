"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { AlertCircle, Clock, CreditCard } from "lucide-react"
import { useEffect, useState } from "react"

export function TrialBanner() {
  const { data: session } = useSession()
  const [daysLeft, setDaysLeft] = useState<number | null>(null)

  useEffect(() => {
    if (session?.user?.trialEndsAt) {
      const trialEnd = new Date(session.user.trialEndsAt)
      const now = new Date()
      const diffTime = trialEnd.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setDaysLeft(diffDays)
    }
  }, [session?.user?.trialEndsAt])

  if (!session?.user) return null

  const subscriptionStatus = session.user.subscriptionStatus
  const hasActiveSub = session.user.hasActiveSubscription

  // Don't show banner if user has active paid subscription
  if (subscriptionStatus === "active") {
    return null
  }

  // Trial expired
  if (subscriptionStatus === "trialing" && daysLeft !== null && daysLeft <= 0) {
    return (
      <div className="bg-gradient-to-r from-red-50 to-red-50/50 dark:from-red-950/30 dark:to-red-950/20 border-b border-red-200 dark:border-red-900 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div className="text-left">
              <p className="font-semibold text-red-900 dark:text-red-200">Your trial has expired</p>
              <p className="text-sm text-red-800 dark:text-red-300">
                Upgrade to continue using Epic Voice
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="bg-red-600 text-white hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <CreditCard className="h-4 w-4" />
            Upgrade Now
          </Link>
        </div>
      </div>
    )
  }

  // Trial active - show warning if less than 3 days left
  if (subscriptionStatus === "trialing" && daysLeft !== null && daysLeft <= 3) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-950/20 border-b border-amber-200 dark:border-amber-900 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <div className="text-left">
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                {daysLeft} {daysLeft === 1 ? "day" : "days"} left in your trial
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Upgrade now to continue using all features
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/billing"
            className="bg-amber-600 text-white hover:bg-amber-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 flex-shrink-0"
          >
            <CreditCard className="h-4 w-4" />
            View Plans
          </Link>
        </div>
      </div>
    )
  }

  // Trial active - show info banner
  if (subscriptionStatus === "trialing" && daysLeft !== null && daysLeft > 3) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-blue-50/50 dark:from-blue-950/30 dark:to-blue-950/20 border-b border-blue-200 dark:border-blue-900 px-6 py-3">
        <div className="container mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-blue-900 dark:text-blue-200">
              <span className="font-semibold">{daysLeft} days</span> left in your free trial
            </p>
          </div>
          <Link
            href="/dashboard/billing"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-semibold transition-colors"
          >
            View Plans →
          </Link>
        </div>
      </div>
    )
  }

  return null
}

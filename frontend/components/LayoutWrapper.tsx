'use client'

import { usePathname } from 'next/navigation'
import { AppLayoutNext } from '@/components/AppLayoutNext'
import { TrialBanner } from '@/components/TrialBanner'

const PUBLIC_PAGES = ['/']

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicPage = PUBLIC_PAGES.includes(pathname)
  const isAuthPage = pathname.startsWith('/auth/')
  const isAdminPage = pathname.startsWith('/admin')

  // For public pages (splash page), render without sidebar
  if (isPublicPage) {
    return <>{children}</>
  }

  // For auth pages, render without sidebar
  if (isAuthPage) {
    return <>{children}</>
  }

  // For admin pages, render without sidebar (admin has its own layout)
  if (isAdminPage) {
    return <>{children}</>
  }

  // For protected pages (middleware handles auth), show NEW AppLayout
  return (
    <AppLayoutNext>
      <TrialBanner />
      {children}
    </AppLayoutNext>
  )
}

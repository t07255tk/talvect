import { AppSidebar } from '@/components/app-sidebar'
import Header from '@/components/site-header'
import { SidebarProvider } from '@/components/ui/sidebar'
import { requireAuth } from '@/lib/requreAuth'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <div className='w-full'>
        <Header />
        {/* The main content area */}
        <main className='flex-1 flex items-center justify-center p-4'>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}

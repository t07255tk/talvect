import Header from '@/components/site-header'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-1 flex items-center justify-center p-4'>
        {children}
      </main>
    </div>
  )
}

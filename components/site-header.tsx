import { ModeToggle } from './ModeToggle'
import { SidebarTrigger } from './ui/sidebar'

export default function Header() {
  return (
    <header className='flex p-2 border-b w-full sticky top-0 bg-background'>
      <nav className='w-full flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <SidebarTrigger className='cursor-pointer' />
          <span className='show md:hidden text-lg font-bold'>Talvect</span>
        </div>
        <div className='flex gap-2'>
          <ModeToggle />
        </div>
      </nav>
    </header>
  )
}

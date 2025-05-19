'use client'

import { Avatar, AvatarImage, AvatarFallback } from '@radix-ui/react-avatar'
import { Dot } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { UserDto } from '@/types/user'

const items = [
  { title: 'Dashboard', url: '/dashboard', icon: Dot },
  { title: 'Assessments', url: '/assessments', icon: Dot },
  { title: 'Generate', url: '/generate-assessment', icon: Dot },
  { title: 'Tags', url: '/tags', icon: Dot },
  { title: 'Results', url: '/results', icon: Dot },
]

export function AppSidebar({ user }: { user: UserDto }) {
  const { state, isMobile } = useSidebar()
  const pathname = usePathname()

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <div
          className={cn(
            'flex items-center gap-2 p-1 justify-start',
            state === 'collapsed' ? 'md:justify-center' : '',
          )}
        >
          <SidebarTrigger className='cursor-pointer show md:hidden' />
          <div className='flex items-center'>
            <span
              className={cn(
                'text-lg font-bold transition-opacity duration-200',
                isMobile || state === 'expanded' ? 'show' : 'hidden',
              )}
            >
              Evalent
            </span>
            <span className='text-lg font-bold'>8</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={`flex items-center gap-2 ${
                        pathname.startsWith(item.url)
                          ? 'text-primary font-semibold'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <item.icon size={18} />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton size='lg'>
          <Avatar className='w-8 h-8 rounded-full'>
            <AvatarImage src={user.image ?? ''} alt={user.name ?? ''} />
            <AvatarFallback />
          </Avatar>
          <div
            className={cn(
              'grid flex-1 text-left text-sm leading-tight',
              state === 'expanded' ? 'show' : 'hidden',
            )}
          >
            <span className='truncate font-semibold'>{user.name}</span>
            <span className='truncate text-xs'>{user.email}</span>
          </div>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  )
}

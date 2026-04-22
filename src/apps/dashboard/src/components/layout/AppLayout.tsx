import React from 'react'
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom'
import pb from '@/lib/pocketbase'
import { useRole } from '@/lib/RoleContext'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import {
  LayoutDashboard,
  CalendarRange,
  Building2,
  Users,
  UserPlus,
  LogOut,
} from 'lucide-react'

interface NavItem {
  label: string
  to: string
  icon: React.ElementType
}

const mainNav: NavItem[] = [
  { label: 'Overview', to: '/', icon: LayoutDashboard },
  { label: 'Years', to: '/years', icon: CalendarRange },
  { label: 'Sponsors', to: '/sponsors', icon: Building2 },
  { label: 'People', to: '/people', icon: Users },
]

const adminNav: NavItem[] = [
  { label: 'Add User', to: '/admin/users', icon: UserPlus },
]

export function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = pb.authStore.record
  const { can } = useRole()

  const handleLogout = () => {
    pb.authStore.clear()
    navigate('/login')
  }

  const isActive = (to: string) =>
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild>
                <div className="flex items-center gap-2.5">
                  <img
                    src="/schild.png"
                    alt="Fenrir"
                    className="size-8 shrink-0 object-contain"
                  />
                  <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="text-sm font-semibold">Fenrir</span>
                    <span className="text-xs text-muted-foreground">Dashboard</span>
                  </div>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {mainNav.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.to)
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.label}
                        className={active
                          ? 'bg-primary/15! text-primary! hover:bg-primary/20! hover:text-primary!'
                          : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-transparent!'
                        }
                      >
                        <NavLink to={item.to} end={item.to === '/'}>
                          <Icon />
                          <span>{item.label}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {can('manageUsers') && (
            <>
              <SidebarSeparator />
              <SidebarGroup>
                <SidebarGroupLabel>Admin</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="gap-0.5">
                    {adminNav.map((item) => {
                      const Icon = item.icon
                      const active = isActive(item.to)
                      return (
                        <SidebarMenuItem key={item.to}>
                          <SidebarMenuButton
                            asChild
                            isActive={active}
                            tooltip={item.label}
                            className={active
                              ? '!bg-primary/15 !text-primary hover:!bg-primary/20 hover:!text-primary'
                              : 'text-sidebar-foreground/60 hover:text-sidebar-foreground hover:!bg-transparent'
                            }
                          >
                            <NavLink to={item.to}>
                              <Icon />
                              <span>{item.label}</span>
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      )
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </>
          )}
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border">
          <SidebarMenu className="gap-0.5">
            <SidebarMenuItem>
              <SidebarMenuButton
                size="lg"
                tooltip={user?.name || user?.email || 'Account'}
                className="cursor-default hover:bg-transparent!"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                  {(user?.name || user?.email || '?')[0].toUpperCase()}
                </div>
                <div className="flex min-w-0 flex-col leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-xs font-medium text-sidebar-foreground">
                    {user?.name || user?.email}
                  </span>
                  {user?.name && (
                    <span className="truncate text-[10px] text-sidebar-foreground/50">
                      {user.email}
                    </span>
                  )}
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                tooltip="Log out"
                className="text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-transparent!"
              >
                <LogOut />
                <span>Log out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <BreadcrumbTitle />
        </header>
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function BreadcrumbTitle() {
  const location = useLocation()
  const titles: Record<string, string> = {
    '/': 'Overview',
    '/years': 'Years',
    '/sponsors': 'Sponsors',
    '/people': 'People',
    '/admin/users': 'Add User',
  }
  return (
    <span className="text-sm font-medium text-foreground">
      {titles[location.pathname] ?? 'Dashboard'}
    </span>
  )
}

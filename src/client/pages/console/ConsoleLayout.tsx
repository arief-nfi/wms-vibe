import { AppSidebar } from '@client/components/app-sidebar'
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@client/components/ui/breadcrumb'
import { Separator } from '@client/components/ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@client/components/ui/sidebar'
import { useAuth } from '@client/provider/AuthProvider'
import { Navigate, Outlet } from 'react-router'
import ConsoleErrorBoundary from '@client/components/error/ConsoleErrorBoundary'
import { ModeToggle } from '@client/components/ModeToggle'

const ConsoleLayout = () => {
  const { token } = useAuth();

  // Check if the user is authenticated
  if (!token) {
    // If not authenticated, redirect to the login page
    const redirectTo = window.location.pathname + window.location.search;
    const params = new URLSearchParams({redirectTo});
    const to = `/auth/login?${params}`;
    return <Navigate to={to} />;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 z-10 sticky top-0 items-center bg-background border-b  gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            {/* <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            /> */}
          </div>
          <div className="ml-auto px-4">
              <div className="flex items-center gap-2 text-sm">
                <ModeToggle />
              </div>
          </div>
        </header>
        <div className="flex flex-1 flex-col p-4 pt-4">
          <ConsoleErrorBoundary resetOnLocationChange={true}>
            <Outlet />
          </ConsoleErrorBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default ConsoleLayout
import { ChevronsUpDown, GalleryVerticalEnd, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@client/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@client/components/ui/sidebar"
import { useAuth } from "@client/provider/AuthProvider"
import { use, useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"

interface Tenant {
  id: string
  code: string
  name: string
  description: string
}

export function TeamSwitcher() {
  const { isMobile } = useSidebar()
  const [userTenants, setUserTenants] = useState<Tenant[]>([])  
  const { user: authUser, setUser } = useAuth();

  async function setActiveTenant(tenant: Tenant) {
    try {
      await axios.post("/api/system/user/switch-tenant", { tenantId: tenant.id });
      const userResponse = await axios.get("/api/auth/user");
      setUser(userResponse.data);
      toast(`Switched to tenant: ${tenant.name}`);
      window.location.reload();
    } catch (error) {
      console.error("Error switching tenant:", error);
      toast.error("Failed to switch tenant.");
    }
  }

  useEffect(() => {
    axios.get("/api/system/user/user-tenants")
    .then((response) => {
      setUserTenants(response.data); 
    })
  }, [])

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{authUser?.activeTenant?.description}</span>
                <span className="truncate text-xs">{authUser?.activeTenant?.name}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-muted-foreground text-xs">
              Tenants
            </DropdownMenuLabel>
            {userTenants.map((tenant, index) => (
              <DropdownMenuItem
                key={tenant.name}
                onClick={() => setActiveTenant(tenant)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-md border">
                  <GalleryVerticalEnd className="size-3.5 shrink-0" />
                </div>
                {tenant.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <Plus className="size-4" />
              </div>
              <div className="text-muted-foreground font-medium">Add team</div>
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

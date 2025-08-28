"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@client/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@client/components/ui/sidebar";
import { useState } from "react";
import { NavLink } from "react-router";
import Authorized from "./auth/Authorized";


export function NavMain({
  items,
}: {
  items: {
    id: string;
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    roles?: string | string[];
    permissions?: string | string[];
    items?: {
      id: string;
      title: string;
      url: string;
      isActive?: boolean;
      roles?: string | string[];
      permissions?: string | string[];
    }[];
  }[];
}) {

  const [activePath, setActivePath] = useState(window.location.pathname);

  function isActive(path:string) : boolean {
    return (activePath.startsWith(path));
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) =>
          item.items ? (
            <Authorized roles={item.roles} permissions={item.permissions} key={item.id}>
              <Collapsible
                key={item.id}
                asChild
                defaultOpen={isActive(item.url)}
                className="group/collapsible"
              >
                <SidebarMenuItem key={item.id}>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <Authorized roles={item.roles}  permissions={subItem.permissions} key={subItem.id}>
                          <SidebarMenuSubItem key={subItem.id}>
                            <SidebarMenuSubButton asChild isActive={isActive(subItem.url)} onClick={() => setActivePath(subItem.url)}>
                              <NavLink to={subItem.url}>
                                <span>{subItem.title}</span>
                              </NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </Authorized>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </Authorized>
          ) : (
            <Authorized roles={item.roles} permissions={item.permissions} key={item.id}>
              <SidebarMenuItem key={item.id}>
                <NavLink to={item.url}>
                  <SidebarMenuButton className="cursor-pointer" tooltip={item.title} isActive={isActive(item.url)} onClick={() => setActivePath(item.url)}>
                    {item.icon && <item.icon />}
                      <span>{item.title}</span>
                  </SidebarMenuButton>
                </NavLink>
              </SidebarMenuItem>
            </Authorized>
          )
        )}
      </SidebarMenu>
    </SidebarGroup>
  );
}

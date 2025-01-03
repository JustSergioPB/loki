"use client";

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
} from "@/components/ui/sidebar";
import {
  /**
   * BrickWall,
  Cable,
  FileArchive,
  FilePenLine,
  */
  FileJson,
  LayoutGrid,
  User,
  Building,
} from "lucide-react";
import { useTranslations } from "next-intl";
import NavUser from "./nav-user";
import Banner from "./banner";

export default function AppSidebar({
  user,
}: {
  user: {
    fullName: string;
    email: string;
    role: string;
  };
}) {
  const t = useTranslations("Navigation");

  const groups = [
    {
      label: t("home"),
      children: [
        { title: t("dashboard"), url: "/dashboard", icon: LayoutGrid },
        //{ title: t("credentials"), url: "/credentials", icon: FilePenLine },
      ],
    },
  ];

  if (user.role == "admin") {
    groups.push({
      label: t("administration"),
      children: [
        {
          title: t("orgs"),
          url: "/orgs",
          icon: Building,
        },
        /**
         * {
          title: t("certificates"),
          url: "/certificates",
          icon: FileArchive,
        },
         */
      ],
    });
  }

  if (user.role == "admin" || "org-admin") {
    groups.push({
      label: t("management"),
      children: [
        {
          title: t("users"),
          url: "/users",
          icon: User,
        },
        {
          title: t("forms"),
          url: "/forms",
          icon: FileJson,
        },
        /*
        
        {
          title: t("bridges"),
          url: "/bridges",
          icon: Cable,
        },
        {
          title: t("wall"),
          url: "/wall",
          icon: BrickWall,
        },
        */
      ],
    });
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Banner />
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.children.map((child) => (
                  <SidebarMenuItem key={child.title}>
                    <SidebarMenuButton asChild>
                      <a href={child.url}>
                        <child.icon />
                        <span>{child.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ ...user, avatar: "" }} />
      </SidebarFooter>
    </Sidebar>
  );
}

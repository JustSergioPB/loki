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
  */
  FilePenLine,
  FileJson,
  LayoutGrid,
  User,
  Building,
  Fingerprint,
  Cable,
} from "lucide-react";
import { useTranslations } from "next-intl";
import NavUser from "./nav-user";
import Banner from "./banner";
import { AuthUser } from "@/db/schema/users";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

export default function AppSidebar({ user }: { user: AuthUser }) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  const groups = [
    {
      label: t("home"),
      children: [
        { title: t("dashboard"), url: "/dashboard", icon: LayoutGrid },
        { title: t("credentials"), url: "/credentials", icon: FilePenLine },
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
        {
          title: t("dids"),
          url: "/dids",
          icon: Fingerprint,
        },
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
        {
          title: t("bridges"),
          url: "/bridges",
          icon: Cable,
        },
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
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.includes(child.url)}
                    >
                      <Link href={child.url}>
                        <child.icon />
                        <span>{child.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}

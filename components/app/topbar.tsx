"use client";

import { AuthUser } from "@/db/schema/users";
import {
  FilePenLine,
  FileJson,
  LayoutGrid,
  User,
  Building,
  Fingerprint,
  Cable,
} from "lucide-react";
import { useTranslations } from "next-intl";
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
} from "../ui/navigation-menu";
import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import Banner from "./banner";
import NavUser from "./nav-user";
import { usePathname } from "next/navigation";
import { buttonVariants } from "../ui/button";
import { cn } from "@/lib/utils";

type Props = {
  user: AuthUser;
};

export default function Topbar({ user }: Props) {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  const ROUTES = [
    { title: t("dashboard"), url: "dashboard", icon: LayoutGrid },
    { title: t("credentials"), url: "credentials", icon: FilePenLine },
    {
      title: t("orgs"),
      url: "orgs",
      icon: Building,
    },
    {
      title: t("dids"),
      url: "dids",
      icon: Fingerprint,
    },
    {
      title: t("users"),
      url: "users",
      icon: User,
    },
    {
      title: t("forms"),
      url: "forms",
      icon: FileJson,
    },
    {
      title: t("bridges"),
      url: "bridges",
      icon: Cable,
    },
  ];

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-32">
      <Banner />
      <NavigationMenu>
        <NavigationMenuList>
          {ROUTES.map((route) => (
            <Link
              href={`/${route.url}`}
              key={route.title}
              legacyBehavior
              passHref
            >
              <NavigationMenuLink
                className={cn(
                  buttonVariants({
                    variant: pathname.includes(`/${route.url}`)
                      ? "default"
                      : "ghost",
                    size: "sm",
                  })
                )}
              >
                <route.icon className="size-4" />
                {route.title}
              </NavigationMenuLink>
            </Link>
          ))}
        </NavigationMenuList>
      </NavigationMenu>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <NavUser user={user} />
      </div>
    </header>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Clock, FileJson } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FormTabs() {
  const items = [
    {
      title: "content",
      url: "content",
      icon: FileJson,
    },
    {
      title: "validityTitle",
      url: "validity",
      icon: Clock,
    },
  ];

  const t = useTranslations("FormVersion");
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "content";
  const router = useRouter();

  function onTabClick(tab: string) {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <section className="flex flex-col space-y-2">
      {items.map((item) => (
        <Button
          key={item.url}
          className={cn(
            "justify-start",
            activeTab === item.url
              ? "bg-muted hover:bg-muted"
              : "hover:bg-transparent hover:underline"
          )}
          variant="ghost"
          onClick={() => onTabClick(item.url)}
        >
          <item.icon />
          {t(item.title)}
        </Button>
      ))}
    </section>
  );
}

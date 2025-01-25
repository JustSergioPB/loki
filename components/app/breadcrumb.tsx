"use client";

import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export default function AppBreadcrumb() {
  const pathName = usePathname();
  const t = useTranslations("Navigation");
  const parts = pathName.split("/").filter((part) => part !== "");

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {parts[1] ? (
            <BreadcrumbLink href={`/${parts[0]}`}>{t(parts[0])}</BreadcrumbLink>
          ) : (
            <BreadcrumbPage className="font-semibold">
              {t(parts[0])}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>
        {parts[1] && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{parts[1]}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

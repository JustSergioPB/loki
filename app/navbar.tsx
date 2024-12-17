"use client";

import * as React from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import Banner from "@/components/app/banner";
import { useTranslations } from "next-intl";

export default function Navbar({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const t = useTranslations("Generic");

  return (
    <header
      className={cn("sticky top-0 z-50 bg-white border-b shadow-sm", className)}
      {...props}
    >
      <nav className="flex h-16 items-center p-6">
        <Link href="/">
          <Banner />
        </Link>
        <div className="ml-auto flex items-center space-x-4">
          <Link
            href="/sign-up"
            className={cn(
              "hidden lg:inline-flex",
              buttonVariants({ variant: "outline" })
            )}
          >
            {t("signUp")}
          </Link>
          <Link
            href="/login"
            className={cn("hidden lg:inline-flex", buttonVariants())}
          >
            {t("login")}
          </Link>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">{t("openMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[300px] flex flex-col justify-between"
            >
              <SheetTitle>
                <Banner />
              </SheetTitle>
              <SheetDescription></SheetDescription>
              <div className="flex gap-2">
                <Link
                  href="/sign-up"
                  className={cn(
                    "flex-1",
                    buttonVariants({ variant: "outline" })
                  )}
                >
                  {t("signUp")}
                </Link>
                <Link href="/login" className={cn("flex-1", buttonVariants())}>
                  {t("login")}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}

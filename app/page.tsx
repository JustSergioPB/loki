import { ThemeToggle } from "@/components/app/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import Navbar from "./navbar";

export default function Home() {
  const t = useTranslations("Home");
  return (
    <>
      <Navbar />
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Button>{t("title")}</Button>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
}

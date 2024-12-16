import { ThemeToggle } from "@/components/app/theme-toggle";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("HomePage");
  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        <Button>{t("title")}</Button>
        <ThemeToggle />
      </div>
    </div>
  );
}

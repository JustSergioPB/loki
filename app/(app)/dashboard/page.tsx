import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function Dashboard() {
  const t = useTranslations("Dashboard");
  return <Button variant="outline">{t("title")}</Button>;
}

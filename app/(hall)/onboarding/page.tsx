import FormHeader from "@/components/app/form-header";
import { getTranslations } from "next-intl/server";

export default async function Page() {
  const t = await getTranslations("Onboarding");

  return (
    <>
      <FormHeader title={t("title")} subtitle={t("subtitle")} />
    </>
  );
}

import FormHeader from "@/components/app/form-header";
import ResendConfirmationForm from "./resend-confirmation-form";
import { getTranslations } from "next-intl/server";

export default async function Hall() {
  const t = await getTranslations("Hall");

  return (
    <>
      <FormHeader title={t("title")} subtitle={t("subtitle")} />
      <ResendConfirmationForm />
    </>
  );
}

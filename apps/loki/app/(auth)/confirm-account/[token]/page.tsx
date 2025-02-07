import FormHeader from "@/components/app/form-header";
import ConfirmForm from "./confirm-form";
import { getTranslations } from "next-intl/server";

export default async function ConfirmAccount({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const t = await getTranslations("ConfirmAccount");
  const token = (await params).token;

  return (
    <>
      <FormHeader title={t("title")} subtitle={t("subtitle")} />
      <ConfirmForm token={token} />
    </>
  );
}

import FormHeader from "@/components/app/form-header";
import ConfirmButton from "./confirm-button";
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
      <ConfirmButton token={token} />
    </>
  );
}

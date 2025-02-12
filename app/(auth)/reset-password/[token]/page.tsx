import { getTranslations } from "next-intl/server";
import ResetPasswordForm from "./reset-password-form";
import Link from "next/link";
import FormHeader from "@/components/app/form-header";

export default async function ResetPassword({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const t = await getTranslations("ResetPassword");
  const tGeneric = await getTranslations("Generic");
  const token = (await params).token;

  return (
    <>
      <FormHeader title={t("title")} subtitle={t("subtitle")} />
      <ResetPasswordForm token={token} />
      <div className="mt-6 text-center text-sm">
        {tGeneric("haveYouRemembered")}{" "}
        <Link href="/login" className="underline font-semibold">
          {tGeneric("login")}
        </Link>
      </div>
    </>
  );
}

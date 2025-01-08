import Link from "next/link";
import ForgotPasswordForm from "./forgot-password-form";
import { getTranslations } from "next-intl/server";
import FormHeader from "@/components/app/form-header";

export default async function ForgotPassword() {
  const t = await getTranslations("ForgotPassword");
  const tGeneric = await getTranslations("Generic");

  return (
    <>
      <FormHeader title={t("title")} subtitle={t("subtitle")} />
      <ForgotPasswordForm />
      <div className="mt-6 text-center text-sm">
        {tGeneric("haveYouRemembered")}{" "}
        <Link href="/login" className="underline font-semibold">
          {tGeneric("login")}
        </Link>
      </div>
    </>
  );
}

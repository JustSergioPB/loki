import { getTranslations } from "next-intl/server";
import SignUpForm from "./sign-up-form";
import Link from "next/link";
import FormHeader from "@/components/app/form-header";

export default async function SignUp() {
  const t = await getTranslations("SignUp");
  const tGeneric = await getTranslations("Generic");

  return (
    <>
      <FormHeader title={t("title")} subtitle={t("subtitle")} />
      <SignUpForm />
      <div className="mt-6 text-center text-sm">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/login" className="underline font-semibold">
          {tGeneric("login")}
        </Link>
      </div>
    </>
  );
}

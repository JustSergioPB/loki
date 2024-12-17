import LoginForm from "./login-form";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import FormHeader from "@/components/app/form-header";

export default async function Login() {
  const t = await getTranslations("Login");
  const tGeneric = await getTranslations("Generic");

  return (
    <>
      <FormHeader title={t("title")} subtitle={t("subtitle")} />
      <LoginForm />
      <div className="mt-6 text-center text-sm">
        {t("alreadyHaveAccount")}{" "}
        <Link href="/sign-up" className="underline font-semibold">
          {tGeneric("signUp")}
        </Link>
      </div>
    </>
  );
}

import FormHeader from "@/components/app/form-header";
import { getTranslations } from "next-intl/server";
import ReactiveButton from "./reactive-button";

export default async function Page() {
  const t = await getTranslations("Inactive");

  return (
    <>
      <FormHeader title={t("title")} subtitle={t("subtitle")} />
      <section>
        <p>{t("content")}</p>
      </section>
      <section className="space-y-2">
        <p>{t("reasons.title")}</p>
        <ul className="list-disc pl-6">
          <li>{t("reasons.1")}</li>
          <li>{t("reasons.2")}</li>
          <li>{t("reasons.3")}</li>
        </ul>
      </section>
      <ReactiveButton />
    </>
  );
}

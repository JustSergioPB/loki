import { getUser } from "@/lib/helpers/dal";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import RootDIDButton from "./root-did-button";

export default async function Dashboard() {
  const t = await getTranslations("Dashboard");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      {user.role === "admin" ? (
        <RootDIDButton />
      ) : (
        <p>{t("title")}</p>
      )}
    </div>
  );
}

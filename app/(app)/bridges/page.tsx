import { getTranslations } from "next-intl/server";
import { getUser } from "@/lib/helpers/dal";
import { redirect } from "next/navigation";
import PageHeader from "@/components/app/page-header";
import Page from "@/components/app/page";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BridgeDialog from "./dialog";
import { searchBridgesByOrg } from "@/lib/models/email-bridge.model";

export default async function Bridges() {
  const t = await getTranslations("Bridge");
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const bridges = await searchBridgesByOrg(user.orgId);

  return (
    <Page>
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      <section className="px-6 grid gap-6 grid-cols-4">
        {bridges.map((bridge) => (
          <Card key={bridge.type} className="space-y-2">
            <CardHeader className="p-4 pb-0 flex flex-row items-center justify-between">
              <CardTitle>{t(`bridges.${bridge.type}.title`)}</CardTitle>
              <BridgeDialog
                checked={bridge.active}
                type={bridge.type}
                formVersion={bridge.formVersion}
              />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <CardDescription>
                {t(`bridges.${bridge.type}.description`)}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </section>
    </Page>
  );
}

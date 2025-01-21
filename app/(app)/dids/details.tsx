import {
  Building,
  Calendar,
  Clock,
  Database,
  FileCheck,
  Key,
  Router,
  SquareArrowOutUpRight,
  Trash,
  User,
} from "lucide-react";
import Field from "@/components/app/field";
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import { DIDWithOwner } from "@/db/schema/dids";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Date from "@/components/app/date";
import DIDStatus from "@/components/app/did-status";
import KeyStatus from "@/components/app/key-status";

type Props = {
  did: DIDWithOwner;
  deleteHref: string;
};

export default function DIDDetails({ did, deleteHref }: Props) {
  const t = useTranslations("Did");
  const tGeneric = useTranslations("Generic");
  const tOrg = useTranslations("Org");
  const tUser = useTranslations("User");

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("seeTitle")}</DialogTitle>
        <DialogDescription>{t("seeDescription")}</DialogDescription>
      </DialogHeader>
      <div className="space-x-2">
        <Link
          href={deleteHref}
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-red-500"
          )}
        >
          <Trash className="size-3" />
          {tGeneric("delete")}
        </Link>
      </div>
      <section className="space-y-4">
        <Field
          icon={<Database className="size-4" />}
          label={t("did")}
          type="vertical"
        >
          {did.did}
        </Field>
        <Field icon={<Building className="size-4" />} label={tOrg("org")}>
          {did.org.name}
        </Field>
        <Field icon={<User className="size-4" />} label={tUser("user")}>
          {did.user?.fullName}
        </Field>
        <Field icon={<FileCheck className="size-4" />} label={t("status")}>
          <DIDStatus status={did.isActive}>
            {t(`statuses.${did.isActive ? "active" : "inactive"}`)}
          </DIDStatus>
        </Field>
        <Field
          icon={<Router className="size-4" />}
          label={t("services")}
          type="vertical"
        >
          <div className="space-x-2">
            {did.document.service.map((service) => (
              <Link
                key={`${service.type}`}
                href={service.serviceEndpoint}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" })
                )}
              >
                <SquareArrowOutUpRight className="size-3" />
                {service.type}
              </Link>
            ))}
          </div>
        </Field>
        <Field
          icon={<Key className="size-4" />}
          label={t("keys")}
          type="vertical"
        >
          <ul className="w-full">
            {did.document.verificationMethod.map((vm, idx) => (
              <li key={vm.id} className="flex items-center justify-between">
                <label className="block font-normal">
                  {t("key")} {idx}
                </label>
                <KeyStatus status={!!vm.revoked}>
                  {t(`keyStatuses.${vm.revoked ? "revoked" : "active"}`)}
                </KeyStatus>
              </li>
            ))}
          </ul>
        </Field>
        <Field
          icon={<Calendar className="size-4" />}
          label={tGeneric("createdAt")}
        >
          <Date date={did.createdAt} />
        </Field>
        <Field
          icon={<Clock className="size-4" />}
          label={tGeneric("updatedAt")}
        >
          <Date date={did.updatedAt} />
        </Field>
      </section>
    </>
  );
}

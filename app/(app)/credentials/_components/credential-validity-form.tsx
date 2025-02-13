import { LoadingButton } from "@/components/app/loading-button";
import PageHeader from "@/components/app/page-header";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DbFormVersion } from "@/db/schema/form-versions";
import { validitySchema, ValiditySchema } from "@/lib/schemas/validity.schema";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";

type Props = {
  validFrom: Date | null;
  validUntil: Date | null;
  formVersion: DbFormVersion;
  isLoading: boolean;
  className?: string;
  onSubmit: (validity: ValiditySchema) => void;
};

export default function CredentialValidityForm({
  formVersion,
  validFrom,
  validUntil,
  isLoading,
  className,
  onSubmit,
}: Props) {
  const t = useTranslations("FormVersion");
  const tGeneric = useTranslations("Generic");

  const form = useForm<ValiditySchema>({
    resolver: zodResolver(validitySchema),
    defaultValues: {
      validUntil: getValidUntil(formVersion, validUntil),
      validFrom: getValidFrom(formVersion, validFrom),
    },
  });

  function getValidFrom(
    formVersion: DbFormVersion,
    validFrom: Date | null
  ): Date | undefined {
    if (formVersion.validFrom) validFrom = formVersion.validFrom;
    if (validFrom) validFrom = new Date(validFrom);

    return validFrom ?? undefined;
  }

  function getValidUntil(
    formVersion: DbFormVersion,
    validUntil: Date | null
  ): Date | undefined {
    if (formVersion.validUntil) validUntil = formVersion.validUntil;
    if (validUntil) validUntil = new Date(validUntil);

    return validUntil ?? undefined;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex-1 flex flex-col", className)}
      >
        <section className="space-y-4 flex-auto overflow-y-auto h-0 flex flex-col p-12 xl:w-2/3">
          <PageHeader
            title={t("fillValidityTitle")}
            subtitle={t("fillValidityDescription")}
          />
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("validFrom")}</FormLabel>
                  <FormControl>
                    <DatetimePicker
                      {...field}
                      className="w-full"
                      format={[
                        ["days", "months", "years"],
                        ["hours", "minutes", "seconds"],
                      ]}
                      dtOptions={{
                        hour12: false,
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>{t("validUntil")}</FormLabel>
                  <FormControl>
                    <DatetimePicker
                      {...field}
                      className="w-full"
                      format={[
                        ["days", "months", "years"],
                        ["hours", "minutes", "seconds"],
                      ]}
                      dtOptions={{
                        hour12: false,
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
        <section className="flex justify-end py-4 px-12 gap-2 border-t">
          <LoadingButton loading={isLoading} type="submit">
            {tGeneric("next")}
          </LoadingButton>
        </section>
      </form>
    </Form>
  );
}

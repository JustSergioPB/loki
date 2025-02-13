import { toast } from "sonner";
import { DbFormVersion } from "@/db/schema/form-versions";
import { validitySchema, ValiditySchema } from "@/lib/schemas/validity.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useTranslations } from "next-intl";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import { LoadingButton } from "@/components/app/loading-button";
import { useState } from "react";
import { updateFormVersionValidityAction } from "@/lib/actions/form-version.actions";
import PageHeader from "@/components/app/page-header";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  formVersion?: DbFormVersion | null;
  disabled?: boolean;
  className?: string;
  onSubmit: () => void;
  onReset: () => void;
};

export default function FormValidityForm({
  formVersion,
  disabled,
  className,
  onSubmit,
  onReset,
}: Props) {
  const t = useTranslations("FormVersion");
  const tGeneric = useTranslations("Generic");

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ValiditySchema>({
    resolver: zodResolver(validitySchema),
    defaultValues: {
      validFrom: formVersion?.validFrom
        ? new Date(formVersion.validFrom)
        : undefined,
      validUntil: formVersion?.validUntil
        ? new Date(formVersion.validUntil)
        : undefined,
    },
  });

  async function handleSubmit(values: ValiditySchema) {
    setIsLoading(true);

    if (!formVersion) {
      throw new Error("This cant be");
    }

    const { success, error } = await updateFormVersionValidityAction(
      formVersion.id,
      values
    );

    if (success) {
      toast.success(success.message);
      onSubmit();
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form
        className={cn("flex-1 flex-col", className)}
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <section className="space-y-6 flex-1 p-12 border-b">
          <PageHeader
            title={t("validityTitle")}
            subtitle={t("validitySubtitle")}
          />
          <div className="flex gap-6">
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("validFrom")}</FormLabel>
                  <FormControl>
                    <DatetimePicker
                      format={[
                        ["days", "months", "years"],
                        ["hours", "minutes", "seconds"],
                      ]}
                      dtOptions={{
                        hour12: false,
                      }}
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                      disabled={disabled}
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
                <FormItem>
                  <FormLabel>{t("validUntil")}</FormLabel>
                  <FormControl>
                    <DatetimePicker
                      format={[
                        ["days", "months", "years"],
                        ["hours", "minutes", "seconds"],
                      ]}
                      dtOptions={{
                        hour12: false,
                      }}
                      value={field.value}
                      onChange={(date) => field.onChange(date)}
                      disabled={disabled}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>
        <div className="flex justify-end px-12 py-4 gap-2">
          <Button variant="outline" onClick={onReset}>
            {tGeneric("back")}
          </Button>
          <LoadingButton loading={isLoading} type="submit" disabled={disabled}>
            {tGeneric("submit")}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}

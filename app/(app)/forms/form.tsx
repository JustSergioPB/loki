"use client";

import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { FormSchema, formSchema } from "@/lib/schemas/form.schema";
import { createFormAction, updateFormAction } from "@/lib/actions/form.actions";
import { useState } from "react";
import { LoadingButton } from "@/components/app/loading-button";
import { Textarea } from "@/components/ui/textarea";
import InfoPanel from "@/components/app/info-panel";
import { DatetimePicker } from "@/components/ui/datetime-picker";
import { redirect } from "next/navigation";
import PageHeader from "@/components/app/page-header";
import { TagsInput } from "@/components/ui/tags-input";
import { DbFormVersion } from "@/db/schema/form-versions";

export default function FormForm({
  formVersion,
}: {
  formVersion?: DbFormVersion;
}) {
  const t = useTranslations("Form");
  const tVersion = useTranslations("FormVersion");
  const tGeneric = useTranslations("Generic");
  const validFrom = formVersion?.credentialSchema.properties.validFrom;
  const validUntil = formVersion?.credentialSchema.properties.validUntil;

  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: formVersion?.credentialSchema.title ?? "",
      type: formVersion?.credentialSchema.properties.type.const.slice(1) ?? [],
      description: formVersion?.credentialSchema.description ?? "",
      content:
        JSON.stringify(
          formVersion?.credentialSchema.properties.credentialSubject,
          null,
          1
        ) ?? "",
      validFrom: validFrom ? new Date(validFrom.const) : undefined,
      validUntil: validUntil ? new Date(validUntil.const) : undefined,
    },
  });

  async function handleSubmit(values: FormSchema) {
    setIsLoading(true);

    const { success, error } = formVersion
      ? await updateFormAction(formVersion.formId, values)
      : await createFormAction(values);

    if (success) {
      toast.success(success.message);
      redirect(
        formVersion ? `/forms/${formVersion.formId}?action=see` : "/forms"
      );
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <section className="p-6 space-y-6 lg:w-[640px]">
      <PageHeader
        title={t(formVersion ? "editTitle" : "createTitle")}
        subtitle={t(formVersion ? "editDescription" : "createDescription")}
        className="p-0"
      />
      {formVersion && formVersion?.status !== "draft" && (
        <InfoPanel
          variant="warning"
          type="vertical"
          label={tGeneric("warning")}
          message={tVersion("formNotInDraft")}
        />
      )}
      {formVersion &&
        formVersion?.credentialSchema.properties.type.const.includes(
          "Bridge"
        ) && (
          <InfoPanel
            variant="danger"
            type="vertical"
            label={tGeneric("warning")}
            message={tVersion("dontEditBridge")}
          />
        )}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-6"
          id={formVersion ? `form-form-${formVersion.formId}` : "new"}
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("titleProp")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("titlePlaceholder")}
                    type="text"
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tVersion("type")}</FormLabel>
                <FormControl>
                  <TagsInput
                    value={field.value}
                    onValueChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tVersion("description")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={tVersion("descriptionPlaceholder")}
                    className="resize-none"
                    rows={4}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              {tVersion("validityTitle")}
            </h3>
            <p className="text-sm text-muted-foreground">
              {tVersion("validitySubtitle")}
            </p>
          </div>
          <div className="flex items-end justify-between">
            <FormField
              control={form.control}
              name="validFrom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tVersion("validFrom")}</FormLabel>
                  <FormControl>
                    <DatetimePicker
                      {...field}
                      format={[
                        ["days", "months", "years"],
                        ["hours", "minutes", "am/pm"],
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <span className="text-sm font-semibold mb-3">-</span>
            <FormField
              control={form.control}
              name="validUntil"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tVersion("validUntil")}</FormLabel>
                  <FormControl>
                    <DatetimePicker
                      {...field}
                      format={[
                        ["days", "months", "years"],
                        ["hours", "minutes", "am/pm"],
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{tVersion("content")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={tVersion("contentPlaceholder")}
                    className="resize-none"
                    rows={12}
                    required
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton loading={isLoading} type="submit">
            {tGeneric("submit")}
          </LoadingButton>
        </form>
      </Form>
    </section>
  );
}

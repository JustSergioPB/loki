"use client";

import { toast } from "sonner";
import { DialogFooter } from "@/components/ui/dialog";
import { DbFormVersion } from "@/db/schema/form-versions";
import {
  createEmailBridgeAction,
  updateEmailBridgeAction,
} from "@/lib/actions/email-bridge.actions";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  emailBridgeSchema,
  EmailBridgeSchema,
} from "@/lib/schemas/email-bridge.schema";
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
import { LoadingButton } from "@/components/app/loading-button";
import { TagsInput } from "@/components/ui/tags-input";
import InfoPanel from "@/components/app/info-panel";

type Props = {
  formVersion?: DbFormVersion;
  onSubmit: () => void;
};

export default function EmailBridgeForm({ formVersion, onSubmit }: Props) {
  const tGeneric = useTranslations("Generic");
  const t = useTranslations("Bridge");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EmailBridgeSchema>({
    resolver: zodResolver(emailBridgeSchema),
    defaultValues: {
      domains: formVersion ? extractDomainsFromForm(formVersion) : [],
    },
  });

  function extractDomainsFromForm(formVersion: DbFormVersion): string[] {
    const emailJsonSchema = formVersion.credentialSubject.properties?.["email"];

    if (
      !emailJsonSchema ||
      emailJsonSchema.type !== "string" ||
      !emailJsonSchema.pattern
    ) {
      throw new Error("malformedEmailJsonSchema");
    }

    try {
      // Look for the domain part of the pattern after @
      const domainMatch = emailJsonSchema.pattern.match(/@\((.*?)\)\$/);

      if (!domainMatch || !domainMatch[1]) {
        throw new Error("No valid domain pattern found");
      }

      // Remove escape characters and split
      return domainMatch[1]
        .split("|")
        .map((domain) =>
          domain
            .replace(/\\/g, "") // Remove escape characters
            .trim()
        )
        .filter((domain) => domain.length > 0); // Remove empty entries
    } catch {
      throw new Error("Invalid regex pattern format");
    }
  }

  async function handleSubmit(values: EmailBridgeSchema) {
    setIsLoading(true);

    const { success, error } = formVersion
      ? await updateEmailBridgeAction(values)
      : await createEmailBridgeAction(values);

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
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
        id={formVersion ? `form-version-${formVersion.id}` : "new"}
      >
        <InfoPanel
          variant="warning"
          type="vertical"
          label={tGeneric("warning")}
          message={t("bridges.email.emailBridgeWillBePublished")}
        />
        <FormField
          control={form.control}
          name="domains"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("bridges.email.domains")}</FormLabel>
              <FormControl>
                <TagsInput value={field.value} onValueChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter>
          <LoadingButton loading={isLoading} type="submit">
            {tGeneric("submit")}
          </LoadingButton>
        </DialogFooter>
      </form>
    </Form>
  );
}

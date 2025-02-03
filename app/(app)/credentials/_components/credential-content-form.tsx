import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
import { LoadingButton } from "@/components/app/loading-button";
import {
  credentialSubjectToZod,
  getDefaultCredentialSubject,
} from "@/lib/helpers/json-schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import JsonSchemaForm from "./json-schema-form";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DbFormVersion } from "@/db/schema/form-versions";
import { useState } from "react";
import { toast } from "sonner";
import { DbCredential } from "@/db/schema/credentials";
import { createCredentialAction } from "@/lib/actions/credential.actions";
import { Button } from "@/components/ui/button";

type Props = {
  formVersion: DbFormVersion | null;
  className?: string;
  disabled?: boolean;
  onSubmit: (credential: DbCredential) => void;
  onReset: () => void;
};

export default function CredentialContentForm({
  formVersion,
  className,
  disabled,
  onSubmit,
  onReset,
}: Props) {
  const tGeneric = useTranslations("Generic");
  const t = useTranslations("Credential");
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<object>({
    resolver: zodResolver(
      credentialSubjectToZod(
        formVersion?.credentialSubject ?? { title: "", type: "object" }
      )
    ),
    defaultValues: getDefaultCredentialSubject(
      formVersion?.credentialSubject ?? { title: "", type: "object" }
    ),
  });

  async function handleSubmit(values: object) {
    if (!formVersion) {
      return toast.error(t("missingForm"));
    }

    setIsLoading(true);

    const { success, error } = await createCredentialAction(
      formVersion.id,
      values
    );

    if (success) {
      onSubmit(success.data);
      toast.success(success.message);
    } else {
      toast.error(error.message);
    }

    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("flex-1 flex-col", className)}
      >
        <section className="space-y-6 flex-auto overflow-y-auto h-0 flex flex-col p-12 border-b">
          <section className="space-y-2">
            <h1 className="text-2xl font-bold">{formVersion?.title}</h1>
            <p className="text-muted-foreground">{formVersion?.description}</p>
            <div className="flex items-center gap-1">
              {formVersion?.types.map((type, idx) => (
                <Badge variant="secondary" key={`${type}-${idx}`}>
                  {type}
                </Badge>
              ))}
            </div>
          </section>
          <FormField
            name="credentialSubject"
            render={() => (
              <FormItem>
                <FormControl>
                  <div className="space-y-12">
                    {Object.entries(
                      formVersion?.credentialSubject.properties ?? {}
                    )
                      .filter(([key]) => key !== "id")
                      .map(([key, schema]) => (
                        <JsonSchemaForm
                          key={key}
                          path={key}
                          jsonSchema={schema}
                          className="w-full"
                          required
                        />
                      ))}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>
        <section className="flex justify-end py-4 px-12 gap-2">
          <Button variant="outline" onClick={onReset}>
            {tGeneric("back")}
          </Button>
          <LoadingButton loading={isLoading} type="submit" disabled={disabled}>
            {tGeneric("submit")}
          </LoadingButton>
        </section>
      </form>
    </Form>
  );
}

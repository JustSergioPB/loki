import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslations } from "next-intl";
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
import { LoadingButton } from "@/components/app/loading-button";
import PageHeader from "@/components/app/page-header";

type Props = {
  claims: object | null;
  formVersion: DbFormVersion;
  isLoading: boolean;
  className?: string;
  disabled?: boolean;
  onSubmit: (claims: object) => void;
};

export default function CredentialClaimsForm({
  claims,
  formVersion,
  isLoading,
  className,
  disabled,
  onSubmit,
}: Props) {
  const tGeneric = useTranslations("Generic");
  const form = useForm<object>({
    resolver: zodResolver(
      credentialSubjectToZod(formVersion.credentialSubject)
    ),
    defaultValues:
      claims ?? getDefaultCredentialSubject(formVersion.credentialSubject),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex-1 flex flex-col", className)}
      >
        <section className="space-y-6 flex-auto overflow-y-auto h-0 flex flex-col p-12 border-b xl:w-2/3">
          <section className="space-y-2">
            <PageHeader
              title={formVersion.title}
              subtitle={formVersion.description ?? undefined}
            />
            <div className="flex items-center gap-1">
              {formVersion.types.map((type, idx) => (
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
                      formVersion.credentialSubject.properties ?? {}
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
          <LoadingButton type="submit" disabled={disabled} loading={isLoading}>
            {tGeneric("next")}
          </LoadingButton>
        </section>
      </form>
    </Form>
  );
}

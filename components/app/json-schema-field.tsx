import { JsonSchemaType } from "@/lib/types/json-schema";
import { cn } from "@/lib/utils";
import JsonSchemaHeader from "./json-schema-header";

type Props = {
  jsonSchema: JsonSchemaType;
  value?: unknown;
  className?: string;
};

export default function JsonSchemaField({ jsonSchema, className }: Props) {
  if (jsonSchema.type === "object" && jsonSchema.properties) {
    return (
      <section className="space-y-4">
        <JsonSchemaHeader jsonSchema={jsonSchema} />
        <div className="space-y-2">
          {Object.entries(jsonSchema.properties).map(([key, schema]) => (
            <JsonSchemaField key={key} jsonSchema={schema} />
          ))}
        </div>
      </section>
    );
  }

  if (jsonSchema.type === "array" && jsonSchema.items) {
    return (
      <section className="space-y-4">
        <JsonSchemaHeader jsonSchema={jsonSchema} />
        <JsonSchemaField jsonSchema={jsonSchema.items} className="w-full" />
      </section>
    );
  }

  if (jsonSchema.type != "object" && jsonSchema.type != "array") {
    return (
      <div
        className={cn("flex items-center justify-between", className)}
      >
        <p className="text-muted-foreground text-sm">{jsonSchema.title}</p>
        <p className="flex items-center h-9 w-72 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm font-semibold">
          {jsonSchema.const ?? jsonSchema.default ?? jsonSchema.examples?.[0]}
        </p>
      </div>
    );
  }
}

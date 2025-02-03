import JsonSchemaHeader from "@/components/app/json-schema-header";
import { Button } from "@/components/ui/button";
import { JsonArrayType } from "@/lib/types/json-schema";
import { cn } from "@/lib/utils";
import { PlusCircle, Trash } from "lucide-react";
import JsonSchemaField from "./json-schema-field";

type Props = {
  path: string;
  jsonSchema: JsonArrayType;
  className?: string;
};

export default function JsonArrayField({ path, jsonSchema, className }: Props) {
  if (!jsonSchema.items) {
    return <p>This property is missing items, please reconfigure the form.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <JsonSchemaHeader jsonSchema={jsonSchema} />
        <Button type="button" size="sm" disabled>
          <PlusCircle className="size-4" />
          Add
        </Button>
      </div>
      <ul className={cn("space-y-4 w-full", className)}>
        <li>
          <JsonSchemaField
            path={`${path}.0`}
            jsonSchema={jsonSchema.items!}
            className="flex-1"
            headerVariant="secondary"
          >
            <Button type="button" variant="outline" size="icon" disabled>
              <Trash className="size-4" />
            </Button>
          </JsonSchemaField>
        </li>
      </ul>
    </div>
  );
}

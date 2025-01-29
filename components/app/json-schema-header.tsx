import { JsonSchemaType, JsonType } from "@/lib/types/json-schema";
import {
  Binary,
  CircleSlash2,
  Group,
  LayoutList,
  Sigma,
  Text,
} from "lucide-react";
import { ReactNode } from "react";

type Props = {
  jsonSchema: JsonSchemaType;
};

export const ICON_MAP: Record<JsonType, ReactNode> = {
  string: <Text className="size-4" />,
  number: <Sigma className="size-4" />,
  boolean: <Binary className="size-4" />,
  object: <Group className="size-5" />,
  integer: <Sigma className="size-4" />,
  null: <CircleSlash2 className="size-4" />,
  array: <LayoutList className="size-5" />,
};

export default function JsonSchemaHeader({
  jsonSchema: { title, description },
}: Props) {
  return (
    (title || description) && (
      <div>
        {title && <p className="font-semibold text-xl leading-none mb-1">{title}</p>}
        {description && (
          <p className="text-muted-foreground leading-tight">{description}</p>
        )}
      </div>
    )
  );
}

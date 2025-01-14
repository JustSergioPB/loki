export const formVersionStatuses = ["draft", "published", "archived"] as const;
export type FormVersionStatus = (typeof formVersionStatuses)[number];
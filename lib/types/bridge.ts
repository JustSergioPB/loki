import { DbFormVersion } from "@/db/schema/form-versions";

export const bridgeTypes = ["email"] as const;
export type BridgeType = (typeof bridgeTypes)[number];

export const BRIDGE_CREDENTIAL_TYPE: Record<BridgeType, string> = {
  email: "EmailBridge",
};

export type Bridge = {
  active: boolean;
  type: BridgeType;
  formVersion: DbFormVersion | undefined;
};

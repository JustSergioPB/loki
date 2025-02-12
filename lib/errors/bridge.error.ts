export const bridgeErrorMessages = ["notConfigured", "notActive"] as const;
export type BridgeErrorMessage = (typeof bridgeErrorMessages)[number];

export class BridgeError extends Error {
  constructor(message: BridgeErrorMessage) {
    super(message);
    this.name = message;
  }
}

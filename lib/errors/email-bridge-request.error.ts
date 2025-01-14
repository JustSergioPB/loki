export const emailBridgeRequestErrorMessages = [
  "notFound",
  "invalidChallenge",
  "isBurnt",
  "isExpired",
] as const;
export type EmailBridgeRequestErrorMessage =
  (typeof emailBridgeRequestErrorMessages)[number];

export class EmailBridgeRequestError extends Error {
  constructor(message: EmailBridgeRequestErrorMessage) {
    super(message);
    this.name = message;
  }
}

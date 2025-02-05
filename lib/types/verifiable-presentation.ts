import { VerifiableCredential } from "./verifiable-credential";

export type VerifiablePresentation = {
  "@context": string[];
  type: string[];
  verifiableCredential: VerifiableCredential[];
};

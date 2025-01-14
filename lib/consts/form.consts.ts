import { FormSchema } from "../schemas/form.schema";

export const FORMS: FormSchema[] = [
  {
    title: "Delegation Proof",
    description:
      "This credential proves that the holder is an issuer from the organization in belongs to",
    type: ["DelegationProof"],
    content: {
      properties: {
        organization: {
          type: "string",
          title: "Organization",
          examples: ["Stachelabs"],
        },
        user: {
          properties: {
            fullName: {
              type: "string",
              title: "Full name",
              examples: ["John Doe"],
            },
            email: {
              type: "string",
              format: "email",
              title: "Email",
              examples: ["johndoe@gmail.com"],
            },
          },
          required: ["fullName", "email"],
          type: "object",
        },
      },
      required: ["organization", "user"],
    },
  },
];

import { validateCredentialRequest } from "@/lib/models/credential-request.model";
import { signCredential } from "@/lib/models/credential.model";
import { credentialChallengeSchema } from "@/lib/schemas/credential-challenge.schema";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const id = (await params).id;
  const body = await request.json();

  try {
    const parsed = await credentialChallengeSchema.parseAsync(body);
    const credentialRequest = await validateCredentialRequest(id, parsed);
    const [verifiableCredential] = await signCredential(
      credentialRequest.credentialId,
      parsed.holder
    );

    return NextResponse.json(verifiableCredential, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          code: "invalidArguments",
          message: "invalidArguments",
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        code: "somethingWentWrong",
        message: "somethingWentWrong",
      },
      { status: 500 }
    );
  }
}

import { CredentialRequestError } from "@/lib/errors/credential-request.error";
import { presentCredentialRequest } from "@/lib/models/credential-request.model";
import { credentialChallengeSchema } from "@/lib/schemas/credential-challenge.schema";
import { revalidatePath } from "next/cache";
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
    const [, credential] = await presentCredentialRequest(id, parsed);
    revalidatePath(`/credentials/${credential.id}/fill`);

    return NextResponse.json({}, { status: 200 });
  } catch (error) {
    console.error(error);
    if (error instanceof CredentialRequestError) {
      return NextResponse.json({ valid: false }, { status: 200 });
    }
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

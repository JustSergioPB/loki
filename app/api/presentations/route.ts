import { CredentialRequestError } from "@/lib/errors/credential-request.error";
import { CredentialError } from "@/lib/errors/credential.error";
import { KeyError } from "@/lib/errors/key.error";
import { SignatureError } from "@/lib/errors/signature.error";
import { credentialChallengeSchema } from "@/lib/schemas/credential-challenge.schema";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiErrorResult } from "@/lib/generics/api-error";
import { createPresentation } from "@/lib/models/presentation.model";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();

  try {
    const parsed = await credentialChallengeSchema.parseAsync(body);
    const [, credential] = await createPresentation(parsed);
    revalidatePath(`/credentials/${credential.id}/fill`);

    return NextResponse.json({ data: credential.content }, { status: 200 });
  } catch (error) {
    console.error(error);
    let response: ApiErrorResult<null> = {
      code: "somethingWentWrong",
      message: "somethingWentWrong",
      status: 500,
    };

    if (error instanceof SignatureError) {
      response = { data: null, status: 200 };
    }

    if (
      error instanceof KeyError ||
      error instanceof CredentialError ||
      error instanceof CredentialRequestError ||
      error instanceof ZodError
    ) {
      response = { code: error.message, message: error.message, status: 400 };
    }

    const { status, ...body } = response;

    return NextResponse.json(body, { status });
  }
}

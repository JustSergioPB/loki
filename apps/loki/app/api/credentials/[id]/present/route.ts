import { ChallengeError } from "@/lib/errors/credential-request.error";
import { CredentialError } from "@/lib/errors/credential.error";
import { KeyError } from "@/lib/errors/key.error";
import { SignatureError } from "@/lib/errors/signature.error";
import { challengeSchema } from "@/lib/schemas/credential-challenge.schema";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiErrorResult } from "@/lib/generics/api-error";
import { createCredentialPresentation } from "@/lib/models/credential.model";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const body = await request.json();
  const { id } = await params;

  try {
    const parsed = await challengeSchema.parseAsync(body);

    await createCredentialPresentation(id, parsed);

    return NextResponse.json({ data: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    let response: ApiErrorResult = {
      code: "SOMETHING_WENT_WRONG",
      message: "somethingWentWrong",
      status: 500,
    };

    if (error instanceof SignatureError) {
      response = {
        code: error.message,
        message: error.message,
        status: 401,
      };
    }

    if (
      error instanceof KeyError ||
      error instanceof CredentialError ||
      error instanceof ChallengeError ||
      error instanceof ZodError
    ) {
      response = { code: error.message, message: error.message, status: 400 };
    }

    const { status, ...body } = response;

    return NextResponse.json(body, { status });
  }
}

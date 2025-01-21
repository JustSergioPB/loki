import { createEmailCredentialRequest } from "@/lib/models/email-credential-request.model";
import { emailBridgeRequestSchema } from "@/lib/schemas/email-bridge-request.schema";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = await request.json();

  try {
    const parsed = await emailBridgeRequestSchema.parseAsync(body);
    const { id } = await createEmailCredentialRequest(parsed);

    return NextResponse.json({ id }, { status: 200 });
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

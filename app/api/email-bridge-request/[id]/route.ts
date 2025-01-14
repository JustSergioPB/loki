import { verifyEmailBridgeRequestAndEmitVC } from "@/lib/models/email-bridge-request.model";
import { emailBridgeChallengeSchema } from "@/lib/schemas/email-bridge-request.schema";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const id = (await params).id;
  const body = await request.json();

  try {
    const parsed = await emailBridgeChallengeSchema.parseAsync(body);
    const verifiableCredential = await verifyEmailBridgeRequestAndEmitVC(
      id,
      parsed
    );

    return NextResponse.json({ ...verifiableCredential }, { status: 200 });
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

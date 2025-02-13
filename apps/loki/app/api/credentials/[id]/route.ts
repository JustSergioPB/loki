import { AuthError } from "@/lib/errors/auth.error";
import { CredentialError } from "@/lib/errors/credential.error";
import { ApiErrorResult } from "@/lib/generics/api-error";
import { authorize } from "@/lib/helpers/dal";
import { getCredentialById } from "@/lib/models/credential.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;

  try {
    const authUser = await authorize(["admin", "org-admin"]);

    const credential = await getCredentialById(id, authUser);

    if (!credential) {
      throw new CredentialError("NOT_FOUND");
    }

    return NextResponse.json({ data: credential }, { status: 200 });
  } catch (error) {
    let response: ApiErrorResult = {
      code: "SOMETHING_WENT_WRONG",
      message: "somethingWentWrong",
      status: 500,
    };

    if (error instanceof AuthError) {
      response = {
        code: error.message,
        message: error.message,
        status: 403,
      };
    }

    if (error instanceof CredentialError) {
      response = {
        code: error.message,
        message: error.message,
        status: error.message === "NOT_FOUND" ? 400 : 500,
      };
    }

    const { status, ...body } = response;

    return NextResponse.json(body, { status });
  }
}

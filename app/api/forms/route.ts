import { searchFormVersions } from "@/lib/models/form-version.model";
import { FormVersionStatus } from "@/lib/types/form-version";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const params = request.nextUrl.searchParams;
    const page = params.get("page");
    const pageSize = params.get("pageSize");

    const querResult = await searchFormVersions({
      page: page ? Number.parseInt(page) : 10,
      pageSize: pageSize ? Number.parseInt(pageSize) : 10,
      orgId: params.get("orgId") ?? undefined,
      status: params.get("status")
        ? (params.get("status") as FormVersionStatus)
        : undefined,
    });

    return NextResponse.json({ data: querResult }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        code: "somethingWentWrong",
        message: "somethingWentWrong",
      },
      { status: 500 }
    );
  }
}

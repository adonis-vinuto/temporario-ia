// src/app/api/data-config/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import serverFetch from "@/lib/api/server-fetch";
import { DataConfig } from "@/types/schemas/data-config.schema";
import { handleApiError } from "@/lib/utils/api-error-handler";

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const data = await serverFetch<DataConfig>(
      `/api/data-config/${id}`,
      "PUT",
      body
    );

    return NextResponse.json(data, { status: 200 });
  } catch (err) {
    return handleApiError(err);
  }
}

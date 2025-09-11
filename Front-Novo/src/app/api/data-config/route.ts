// src/app/api/data-config/route.ts
import { NextRequest, NextResponse } from "next/server";
import serverFetch from "@/lib/api/server-fetch";
import { DataConfig } from "@/types/interfaces/data-config.intf";

export async function GET() {
  try {
    const data = await serverFetch<DataConfig[]>("/api/data-config", "GET");
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro inesperado";
    const status = /HTTP (\d+)/.exec(msg)?.[1] ?? "500";
    return NextResponse.json({ error: msg }, { status: Number(status) });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = await serverFetch<DataConfig>("/api/data-config", "POST", body);
    return NextResponse.json(data, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro inesperado";
    const status = /HTTP (\d+)/.exec(msg)?.[1] ?? "500";
    return NextResponse.json({ error: msg }, { status: Number(status) });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id é obrigatório no PUT" }, { status: 400 });
    }

    const body = await req.json();
    const data = await serverFetch<DataConfig>(`/api/data-config/${id}`, "PUT", body);
    return NextResponse.json(data, { status: 200 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erro inesperado";
    const status = /HTTP (\d+)/.exec(msg)?.[1] ?? "500";
    return NextResponse.json({ error: msg }, { status: Number(status) });
  }
}

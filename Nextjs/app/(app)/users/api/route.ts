import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  //aqui pode-se buscar dados de outra api, dados do banco, etc etc
  const data = [
    {
      name: "Murilo Farias",
      email: "murilo@example.com",
      role: "Admin",
      lastLogin: "2h ago",
    },
    {
      name: "Joana Costa",
      email: "joana@example.com",
      role: "User",
      lastLogin: "1d ago",
    },
  ];

  return NextResponse.json(data);
}

import type { NextRequest } from "next/server";
import bot from "~/server/telegram";

export async function POST(req: NextRequest) {
  const body = await req.json();
  await bot.handleUpdate(body);
  return Response.json("ok", { status: 200 });
}

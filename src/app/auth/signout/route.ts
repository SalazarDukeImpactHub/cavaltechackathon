import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/** Cierra la sesión y vuelve al inicio. */
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}

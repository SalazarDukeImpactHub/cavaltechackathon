import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

/** Next 16: convención "proxy" (antes "middleware"). Refresca la sesión de Supabase. */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Todo menos assets estáticos e imágenes.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

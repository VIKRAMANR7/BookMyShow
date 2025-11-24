import type { Request } from "express";

export function getUserId(req: Request): string | null {
  const auth = req.auth();
  return auth?.userId ?? null;
}

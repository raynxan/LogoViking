import type { Request } from "express";
import { db, usageHistoryTable } from "@workspace/db";
import { getUserFromRequest } from "./auth";

export async function logHistory(req: Request, tool: string, summary: string) {
  try {
    const user = await getUserFromRequest(req);
    if (user) {
      await db.insert(usageHistoryTable).values({
        userId: user.id,
        tool,
        summary,
      });
    }
  } catch {
    // best-effort logging
  }
}

import { Router, type IRouter } from "express";
import { SubmitContactBody } from "@workspace/api-zod";
import { db, contactsTable } from "@workspace/db";

const router: IRouter = Router();

router.post("/contact", async (req, res) => {
  const body = SubmitContactBody.parse(req.body);
  await db.insert(contactsTable).values({
    name: body.name,
    email: body.email,
    subject: body.subject ?? null,
    message: body.message,
  });
  return res.json({ ok: true, message: "Thanks — we'll get back to you within 24 hours." });
});

export default router;

import { EMAIL } from "@/lib/contact";
import { sql } from "@/lib/db";

type Payload = {
  name?: string;
  email?: string;
  services?: string[];
  budget?: string;
  message?: string;
  website?: string;
};

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot field: real visitors never see or fill it.
  if (body.website) return Response.json({ ok: true });

  const name = body.name?.trim().slice(0, 120) ?? "";
  const email = body.email?.trim().slice(0, 200) ?? "";
  const services = (body.services ?? []).slice(0, 8).map((s) => String(s).slice(0, 60));
  const budget = body.budget?.trim().slice(0, 40) ?? "";
  const message = body.message?.trim().slice(0, 4000) ?? "";

  if (!name || !isEmail(email) || !message) {
    return Response.json({ error: "Missing required fields" }, { status: 422 });
  }

  try {
    const db = sql();
    await db`
      INSERT INTO client_requests (name, email, services, budget, message)
      VALUES (${name}, ${email}, ${services}, ${budget || null}, ${message})
    `;
  } catch (error) {
    console.error("Failed to save client request", error);
    return Response.json({ error: "Could not save request" }, { status: 502 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (apiKey) {
    const rows: [string, string][] = [
      ["Name", name],
      ["Email", email],
      ["Needs", services.join(", ") || "—"],
      ["Budget", budget ? `€${budget}` : "—"],
    ];

    const html = `
      <h2>New project request</h2>
      <table cellpadding="6">${rows
        .map(([k, v]) => `<tr><td><strong>${k}</strong></td><td>${escapeHtml(v)}</td></tr>`)
        .join("")}</table>
      <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM ?? "BLUEEYES <onboarding@resend.dev>",
        to: process.env.CONTACT_TO ?? EMAIL,
        reply_to: email,
        subject: `New website project — ${name}`,
        html,
      }),
    });

    if (!res.ok) {
      console.error("Email delivery failed after saving request");
    }
  }

  return Response.json({ ok: true });
}

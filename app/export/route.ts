import { getFeedbackList } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /export?status=...&feature=... -> downloads the (filtered) list as CSV for Excel
export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const items = await getFeedbackList({
    q: p.get("q") ?? undefined,
    status: p.get("status") ?? undefined,
    feature: p.get("feature") ?? undefined,
    priority: p.get("priority") ?? undefined,
  });

  const columns = [
    ["ID", "id"],
    ["Feature", "feature_name"],
    ["Submitted by", "submitted_by"],
    ["Department", "department"],
    ["Type", "type"],
    ["Feedback", "feedback"],
    ["Status", "status"],
    ["Priority", "priority"],
    ["Action taken", "action_taken"],
    ["Decision date", "decision_date"],
    ["Reason for decision", "decision_reason"],
    ["Decided by", "decided_by"],
    ["Created", "created_at"],
    ["Updated", "updated_at"],
  ] as const;

  const fmt = (v: unknown) =>
    v instanceof Date || (typeof v === "string" && /^\d{4}-\d{2}-\d{2}T/.test(v))
      ? new Date(v).toISOString().slice(0, 16).replace("T", " ")
      : String(v ?? "");
  const esc = (v: unknown) => `"${fmt(v).replace(/"/g, '""')}"`;
  const lines = [
    columns.map(([h]) => esc(h)).join(","),
    ...items.map((i) => columns.map(([, k]) => esc(i[k])).join(",")),
  ];

  return new Response("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feedback-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

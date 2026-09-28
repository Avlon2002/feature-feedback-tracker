import Link from "next/link";
import { notFound } from "next/navigation";
import DecisionTimeline from "@/components/DecisionTimeline";
import { getDecisions, getFeature, getFeedbackList, getStatusCounts } from "@/lib/db";
import { STATUSES, statusClass } from "@/lib/options";

export const dynamic = "force-dynamic";

// One feature, all the feedback about it, and every decision made on each piece of feedback
export default async function FeaturePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [feature, items, counts] = await Promise.all([
    getFeature(id),
    getFeedbackList({ feature: String(id) }),
    getStatusCounts(id),
  ]);
  if (!feature) notFound();

  const decisions = await getDecisions(items.map((i) => i.id));

  return (
    <>
      <p className="small">
        <Link href="/features">Features</Link> › {feature.name}
      </p>
      <div className="page-head">
        <div>
          <h1>{feature.name}</h1>
          {feature.description && <p className="muted">{feature.description}</p>}
        </div>
        <Link href={`/feedback/new?feature=${id}`} className="btn primary">+ Add feedback for this feature</Link>
      </div>

      <section className="stats">
        {STATUSES.filter((s) => counts[s]).map((s) => (
          <div key={s} className="stat">
            <span className="stat-n">{counts[s]}</span>
            <span>{s}</span>
          </div>
        ))}
      </section>

      {items.length === 0 ? (
        <div className="card empty">
          No feedback for this feature yet.{" "}
          <Link href={`/feedback/new?feature=${id}`}>Add the first one →</Link>
        </div>
      ) : (
        items.map((i) => (
          <article key={i.id} className="card thread">
            <div className="thread-head">
              <Link href={`/feedback/${i.id}`} className="muted">#{i.id}</Link>
              <span className={statusClass(i.status)}>{i.status}</span>
              <span className="muted small">
                {i.type} · {i.priority} priority · from <strong>{i.submitted_by}</strong>
                {i.department && <> ({i.department})</>} · {new Date(i.created_at).toLocaleDateString("en-GB")}
              </span>
              <Link href={`/feedback/${i.id}`} className="btn small push-right">Open / add decision</Link>
            </div>
            <p className="quote">“{i.feedback}”</p>
            <DecisionTimeline decisions={decisions.filter((d) => d.feedback_id === i.id)} />
          </article>
        ))
      )}
    </>
  );
}

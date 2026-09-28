import Link from "next/link";
import { notFound } from "next/navigation";
import SubmitButton from "@/components/SubmitButton";
import { deleteIssue } from "@/app/actions";
import { getFeature, getIssues } from "@/lib/db";
import { statusClass } from "@/lib/options";

export const dynamic = "force-dynamic";

// One feature and all its issue blocks
export default async function FeaturePage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [feature, issues] = await Promise.all([getFeature(id), getIssues(id)]);
  if (!feature) notFound();

  return (
    <>
      <p className="small"><Link href="/">← All features</Link></p>
      <div className="page-head">
        <div>
          <h1>{feature.name}</h1>
          {feature.description && <p className="muted">{feature.description}</p>}
        </div>
        <Link href={`/features/${id}/edit`} className="btn small">Edit feature</Link>
      </div>

      {issues.length === 0 && (
        <div className="card empty">No issues yet for this feature.</div>
      )}

      {issues.map((i, n) => (
        <article key={i.id} className="card issue">
          <div className="issue-head">
            <strong>Issue {n + 1}</strong>
            <span className={statusClass(i.status)}>{i.status}</span>
            <div className="push-right row">
              <Link href={`/features/${id}/issues/${i.id}`} className="btn small">Edit</Link>
              <form action={deleteIssue.bind(null, i.id, id)}>
                <SubmitButton className="btn small danger" pendingText="…" confirmMessage={`Delete Issue ${n + 1}? This cannot be undone.`}>
                  Delete
                </SubmitButton>
              </form>
            </div>
          </div>

          <dl className="fields">
            <Field label="Current process" value={i.current_process} />
            <Field label="Issue" value={i.issue} />
            <Field label="Action taken" value={i.action_taken} />
            <Field label="Raised by" value={i.raised_by} />
            <Field label="Idea by" value={i.idea_by} />
            {i.decision_date && <Field label="Decision date" value={i.decision_date} />}
            {i.decision_reason && <Field label="Reason" value={i.decision_reason} />}
          </dl>
        </article>
      ))}

      <Link href={`/features/${id}/issues/new`} className="btn primary add-issue">+ Add issue</Link>
    </>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value || <span className="muted">—</span>}</dd>
    </>
  );
}

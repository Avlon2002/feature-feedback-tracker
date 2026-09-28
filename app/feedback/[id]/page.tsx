import Link from "next/link";
import { notFound } from "next/navigation";
import DecisionForm from "@/components/DecisionForm";
import DecisionTimeline from "@/components/DecisionTimeline";
import FeedbackForm from "@/components/FeedbackForm";
import SubmitButton from "@/components/SubmitButton";
import { addDecision, deleteFeedback, updateFeedback } from "@/app/actions";
import { getDecisions, getFeatures, getFeedback } from "@/lib/db";
import { statusClass } from "@/lib/options";

export const dynamic = "force-dynamic";

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [item, features, decisions] = await Promise.all([getFeedback(id), getFeatures(), getDecisions([id])]);
  if (!item) notFound();

  const backHref = item.feature_id ? `/features/${item.feature_id}` : "/";

  return (
    <>
      <p className="small">
        <Link href="/">All feedback</Link>
        {item.feature_id && <> › <Link href={backHref}>{item.feature_name}</Link></>}
        {" "}› #{item.id}
      </p>
      <h1>
        Feedback #{item.id} <span className={statusClass(item.status)}>{item.status}</span>
      </h1>
      <p className="muted small">
        Logged {new Date(item.created_at).toLocaleString("en-GB")} · Last updated{" "}
        {new Date(item.updated_at).toLocaleString("en-GB")}
      </p>

      <div className="two-col">
        <div>
          <h2>Details</h2>
          <FeedbackForm
            features={features}
            item={item}
            action={updateFeedback.bind(null, id)}
            submitLabel="Save details"
            cancelHref={backHref}
          />
          <form action={deleteFeedback.bind(null, id, true)} className="danger-zone">
            <SubmitButton
              className="btn danger"
              pendingText="Deleting…"
              confirmMessage={`Delete feedback #${id} and all its decisions? This cannot be undone.`}
            >
              Delete this feedback
            </SubmitButton>
          </form>
        </div>

        <div>
          <h2>Decision history ({decisions.length})</h2>
          <div className="card">
            <DecisionTimeline decisions={decisions} canDelete />
          </div>
          <DecisionForm action={addDecision.bind(null, id)} currentStatus={item.status} featureId={item.feature_id} />
        </div>
      </div>
    </>
  );
}

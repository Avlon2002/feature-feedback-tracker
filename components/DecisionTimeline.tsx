import { deleteDecision } from "@/app/actions";
import type { Decision } from "@/lib/db";
import { statusClass } from "@/lib/options";
import SubmitButton from "./SubmitButton";

type Props = {
  decisions: Decision[];
  canDelete?: boolean; // show a delete button on each entry (on the feedback page)
};

// Vertical list of decisions, oldest at the top, latest marked "current"
export default function DecisionTimeline({ decisions, canDelete = false }: Props) {
  if (decisions.length === 0) {
    return <p className="muted small">No decisions yet.</p>;
  }
  return (
    <ol className="timeline">
      {decisions.map((d, idx) => (
        <li key={d.id} className={idx === decisions.length - 1 ? "current" : ""}>
          <div className="timeline-head">
            <span className={statusClass(d.status)}>{d.status}</span>
            <span className="muted small">
              {d.decision_date ?? "no date"}
              {d.decided_by && <> · {d.decided_by}</>}
              {idx === decisions.length - 1 && <> · <strong>current</strong></>}
            </span>
            {canDelete && (
              <form action={deleteDecision.bind(null, d.id, d.feedback_id)} className="push-right">
                <SubmitButton className="btn small danger" pendingText="…" confirmMessage="Delete this decision from the history?">
                  Delete
                </SubmitButton>
              </form>
            )}
          </div>
          {d.action_taken && <div><span className="muted small">Action:</span> {d.action_taken}</div>}
          {d.decision_reason && <div><span className="muted small">Reason:</span> {d.decision_reason}</div>}
        </li>
      ))}
    </ol>
  );
}

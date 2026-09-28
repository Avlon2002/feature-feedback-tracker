import { STATUSES } from "@/lib/options";
import SubmitButton from "./SubmitButton";

function today() {
  return new Date().toISOString().slice(0, 10);
}

// The decision inputs, shared by "New feedback" and "Add decision"
export function DecisionFields({ defaultStatus, defaultDate }: { defaultStatus: string; defaultDate?: string }) {
  return (
    <>
      <div className="grid">
        <label>
          Status
          <select name="status" defaultValue={defaultStatus}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
        <label>
          Decision date
          <input type="date" name="decision_date" defaultValue={defaultDate ?? ""} />
        </label>
        <label>
          Decided by
          <input name="decided_by" />
        </label>
      </div>
      <label>
        Action taken
        <textarea name="action_taken" rows={2} placeholder="What was done about it?" />
      </label>
      <label>
        Reason for decision
        <textarea name="decision_reason" rows={2} placeholder="Why was it approved / rejected / deferred?" />
      </label>
    </>
  );
}

type Props = {
  action: (form: FormData) => Promise<void>;
  currentStatus: string;
  featureId: number | null;
};

// Adds a new entry to a feedback item's decision history
export default function DecisionForm({ action, currentStatus, featureId }: Props) {
  return (
    // React clears the inputs automatically after a successful save
    <form action={action} className="card form">
      <input type="hidden" name="feature_id" value={featureId ?? ""} />
      <fieldset>
        <legend>Add a decision / update</legend>
        <DecisionFields defaultStatus={currentStatus} defaultDate={today()} />
      </fieldset>
      <SubmitButton className="btn primary">Add decision</SubmitButton>
    </form>
  );
}

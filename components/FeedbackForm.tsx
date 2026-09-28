import Link from "next/link";
import type { Feature, Feedback } from "@/lib/db";
import { PRIORITIES, STATUSES, TYPES } from "@/lib/options";

type Props = {
  features: Feature[];
  item?: Feedback;
  action: (form: FormData) => Promise<void>;
  submitLabel: string;
};

export default function FeedbackForm({ features, item, action, submitLabel }: Props) {
  return (
    <form action={action} className="card form">
      <fieldset>
        <legend>What the user said</legend>
        <div className="grid">
          <label>
            Feature
            <select name="feature_id" defaultValue={item?.feature_id ?? ""}>
              <option value="">— General / not specific —</option>
              {features.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </label>
          <label>
            Type
            <select name="type" defaultValue={item?.type ?? "Suggestion"}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </label>
          <label>
            Submitted by *
            <input name="submitted_by" required defaultValue={item?.submitted_by ?? ""} placeholder="e.g. Jane Smith" />
          </label>
          <label>
            Department
            <input name="department" defaultValue={item?.department ?? ""} placeholder="e.g. Finance" />
          </label>
        </div>
        <label>
          Feedback *
          <textarea name="feedback" required rows={4} defaultValue={item?.feedback ?? ""} placeholder="What did they say or ask for?" />
        </label>
      </fieldset>

      <fieldset>
        <legend>Decision</legend>
        <div className="grid">
          <label>
            Status
            <select name="status" defaultValue={item?.status ?? "New"}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label>
            Priority
            <select name="priority" defaultValue={item?.priority ?? "Medium"}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
          <label>
            Decision date
            <input type="date" name="decision_date" defaultValue={item?.decision_date ?? ""} />
          </label>
          <label>
            Decided by
            <input name="decided_by" defaultValue={item?.decided_by ?? ""} />
          </label>
        </div>
        <label>
          Action taken
          <textarea name="action_taken" rows={2} defaultValue={item?.action_taken ?? ""} placeholder="What was done about it?" />
        </label>
        <label>
          Reason for decision
          <textarea name="decision_reason" rows={2} defaultValue={item?.decision_reason ?? ""} placeholder="Why was it approved / rejected / deferred?" />
        </label>
      </fieldset>

      <div className="row">
        <button type="submit" className="btn primary">{submitLabel}</button>
        <Link href="/" className="btn">Cancel</Link>
      </div>
    </form>
  );
}

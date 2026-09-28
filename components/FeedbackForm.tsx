import Link from "next/link";
import type { Feature, Feedback } from "@/lib/db";
import { PRIORITIES, TYPES } from "@/lib/options";
import { DecisionFields } from "./DecisionForm";
import SubmitButton from "./SubmitButton";

type Props = {
  features: Feature[];
  item?: Feedback;            // set when editing
  defaultFeatureId?: number;  // pre-select a feature for new feedback
  returnTo?: string;          // where to go after saving a new item
  action: (form: FormData) => Promise<void>;
  submitLabel: string;
  cancelHref: string;
};

export default function FeedbackForm({ features, item, defaultFeatureId, returnTo, action, submitLabel, cancelHref }: Props) {
  const isNew = !item;
  return (
    <form action={action} className="card form">
      {returnTo && <input type="hidden" name="return_to" value={returnTo} />}
      <fieldset>
        <legend>What the user said</legend>
        <div className="grid">
          <label>
            Feature
            <select name="feature_id" defaultValue={item?.feature_id ?? defaultFeatureId ?? ""}>
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
          <label>
            Priority
            <select name="priority" defaultValue={item?.priority ?? "Medium"}>
              {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </label>
        </div>
        <label>
          Feedback *
          <textarea name="feedback" required rows={4} defaultValue={item?.feedback ?? ""} placeholder="What did they say or ask for?" />
        </label>
      </fieldset>

      {/* When editing, decisions are added separately so their history is kept */}
      {isNew && (
        <fieldset>
          <legend>First decision <span className="muted small">(optional — you can add more later)</span></legend>
          <DecisionFields defaultStatus="New" />
        </fieldset>
      )}

      <div className="row">
        <SubmitButton className="btn primary">{submitLabel}</SubmitButton>
        <Link href={cancelHref} className="btn">Cancel</Link>
      </div>
    </form>
  );
}

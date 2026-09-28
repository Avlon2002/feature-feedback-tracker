import Link from "next/link";
import type { Issue } from "@/lib/db";
import { STATUSES } from "@/lib/options";
import SubmitButton from "./SubmitButton";

type Props = {
  issue?: Issue; // set when editing
  action: (form: FormData) => Promise<void>;
  cancelHref: string;
};

// One issue block: current process -> issue -> action, who raised it, who had the idea, status
export default function IssueForm({ issue, action, cancelHref }: Props) {
  return (
    <form action={action} className="card form">
      <label>
        Current process
        <textarea name="current_process" rows={2} defaultValue={issue?.current_process ?? ""} placeholder="How it works today" autoFocus />
      </label>
      <label>
        Issue with it *
        <textarea name="issue" rows={3} required defaultValue={issue?.issue ?? ""} placeholder="What's the problem?" />
      </label>
      <label>
        Action taken
        <textarea name="action_taken" rows={2} defaultValue={issue?.action_taken ?? ""} placeholder="What was done / agreed" />
      </label>

      <div className="grid">
        <label>
          Raised by
          <input name="raised_by" defaultValue={issue?.raised_by ?? ""} placeholder="Who raised the issue" />
        </label>
        <label>
          Idea by
          <input name="idea_by" defaultValue={issue?.idea_by ?? ""} placeholder="Who gave the idea" />
        </label>
        <label>
          Status
          <select name="status" defaultValue={issue?.status ?? "New"}>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </label>
      </div>

      <details className="optional" open={!!(issue?.decision_date || issue?.decision_reason)}>
        <summary>Decision date &amp; reason (optional)</summary>
        <div className="grid">
          <label>
            Decision date
            <input type="date" name="decision_date" defaultValue={issue?.decision_date ?? ""} />
          </label>
        </div>
        <label>
          Reason for decision
          <textarea name="decision_reason" rows={2} defaultValue={issue?.decision_reason ?? ""} />
        </label>
      </details>

      <div className="row">
        <SubmitButton className="btn primary">{issue ? "Save" : "Add issue"}</SubmitButton>
        <Link href={cancelHref} className="btn">Cancel</Link>
      </div>
    </form>
  );
}

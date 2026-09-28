import Link from "next/link";
import type { Feature } from "@/lib/db";
import SubmitButton from "./SubmitButton";

type Props = {
  feature?: Feature; // set when editing
  action: (form: FormData) => Promise<void>;
  cancelHref: string;
};

export default function FeatureForm({ feature, action, cancelHref }: Props) {
  return (
    <form action={action} className="card form">
      <label>
        Feature name *
        <input name="name" required defaultValue={feature?.name ?? ""} placeholder="e.g. Starter form" autoFocus />
      </label>
      <label>
        Description
        <textarea name="description" rows={2} defaultValue={feature?.description ?? ""} placeholder="What this part of the portal does (optional)" />
      </label>
      <div className="row">
        <SubmitButton className="btn primary">{feature ? "Save" : "Create feature"}</SubmitButton>
        <Link href={cancelHref} className="btn">Cancel</Link>
      </div>
    </form>
  );
}

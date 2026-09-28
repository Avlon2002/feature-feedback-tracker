import Link from "next/link";
import { createFeature, deleteFeature } from "@/app/actions";
import { getFeatures } from "@/lib/db";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

export default async function FeaturesPage() {
  const features = await getFeatures();

  return (
    <>
      <h1>System features</h1>
      <p className="muted">The parts of the employee portal that feedback can be logged against.</p>

      <form action={createFeature} className="card filters">
        <input name="name" required placeholder="Feature name, e.g. Leave Requests" />
        <input name="description" placeholder="Short description (optional)" />
        <SubmitButton className="btn primary">Add feature</SubmitButton>
      </form>

      <div className="card table-wrap">
        <table>
          <thead>
            <tr><th>Feature</th><th>Description</th><th>Feedback</th><th></th></tr>
          </thead>
          <tbody>
            {features.length === 0 && (
              <tr><td colSpan={4} className="empty">No features yet — add one above.</td></tr>
            )}
            {features.map((f) => (
              <tr key={f.id}>
                <td><strong>{f.name}</strong></td>
                <td>{f.description}</td>
                <td><Link href={`/?feature=${f.id}`}>{f.feedback_count} items</Link></td>
                <td className="right">
                  <form action={deleteFeature.bind(null, f.id)}>
                    <SubmitButton
                      className="btn small danger"
                      pendingText="Deleting…"
                      confirmMessage={`Delete feature "${f.name}"? Its feedback will be kept and moved to General.`}
                    >
                      Delete
                    </SubmitButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

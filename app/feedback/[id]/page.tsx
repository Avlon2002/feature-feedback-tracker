import { notFound } from "next/navigation";
import FeedbackForm from "@/components/FeedbackForm";
import SubmitButton from "@/components/SubmitButton";
import { deleteFeedback, updateFeedback } from "@/app/actions";
import { getFeatures, getFeedback } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditFeedback({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const [item, features] = await Promise.all([getFeedback(id), getFeatures()]);
  if (!item) notFound();

  return (
    <>
      <h1>Feedback #{item.id}</h1>
      <p className="muted small">
        Logged {new Date(item.created_at).toLocaleString("en-GB")} · Last updated{" "}
        {new Date(item.updated_at).toLocaleString("en-GB")}
      </p>
      <FeedbackForm
        features={features}
        item={item}
        action={updateFeedback.bind(null, id)}
        submitLabel="Save changes"
      />
      <form action={deleteFeedback.bind(null, id, true)} className="danger-zone">
        <SubmitButton className="btn danger" pendingText="Deleting…" confirmMessage={`Delete feedback #${id}? This cannot be undone.`}>
          Delete this feedback
        </SubmitButton>
      </form>
    </>
  );
}

import FeedbackForm from "@/components/FeedbackForm";
import { createFeedback } from "@/app/actions";
import { getFeatures } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewFeedback() {
  const features = await getFeatures();
  return (
    <>
      <h1>New feedback</h1>
      <FeedbackForm features={features} action={createFeedback} submitLabel="Save feedback" />
    </>
  );
}

import FeedbackForm from "@/components/FeedbackForm";
import { createFeedback } from "@/app/actions";
import { getFeatures } from "@/lib/db";

export const dynamic = "force-dynamic";

// /feedback/new?feature=3 pre-selects that feature and returns to its page after saving
export default async function NewFeedback({ searchParams }: { searchParams: Promise<{ feature?: string }> }) {
  const featureParam = (await searchParams).feature;
  const features = await getFeatures();
  const feature = features.find((f) => String(f.id) === featureParam);
  const backHref = feature ? `/features/${feature.id}` : "/";

  return (
    <>
      <h1>New feedback{feature && <> for {feature.name}</>}</h1>
      <FeedbackForm
        features={features}
        defaultFeatureId={feature?.id}
        returnTo={backHref}
        action={createFeedback}
        submitLabel="Save feedback"
        cancelHref={backHref}
      />
    </>
  );
}

import { notFound } from "next/navigation";
import FeatureForm from "@/components/FeatureForm";
import SubmitButton from "@/components/SubmitButton";
import { deleteFeature, updateFeature } from "@/app/actions";
import { getFeature } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditFeature({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const feature = await getFeature(id);
  if (!feature) notFound();

  return (
    <>
      <h1>Edit feature</h1>
      <FeatureForm feature={feature} action={updateFeature.bind(null, id)} cancelHref={`/features/${id}`} />
      <form action={deleteFeature.bind(null, id)} className="danger-zone">
        <SubmitButton
          className="btn danger"
          pendingText="Deleting…"
          confirmMessage={`Delete "${feature.name}" and ALL its issues? This cannot be undone.`}
        >
          Delete feature
        </SubmitButton>
      </form>
    </>
  );
}

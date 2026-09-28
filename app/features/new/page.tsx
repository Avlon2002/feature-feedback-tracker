import FeatureForm from "@/components/FeatureForm";
import { createFeature } from "@/app/actions";

export default function NewFeature() {
  return (
    <>
      <h1>New feature</h1>
      <FeatureForm action={createFeature} cancelHref="/" />
    </>
  );
}

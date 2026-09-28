import Link from "next/link";
import { notFound } from "next/navigation";
import IssueForm from "@/components/IssueForm";
import { createIssue } from "@/app/actions";
import { getFeature } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NewIssue({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const feature = await getFeature(id);
  if (!feature) notFound();

  return (
    <>
      <p className="small"><Link href={`/features/${id}`}>← {feature.name}</Link></p>
      <h1>New issue for {feature.name}</h1>
      <IssueForm action={createIssue.bind(null, id)} cancelHref={`/features/${id}`} />
    </>
  );
}

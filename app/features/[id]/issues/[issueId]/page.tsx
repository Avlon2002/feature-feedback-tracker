import Link from "next/link";
import { notFound } from "next/navigation";
import IssueForm from "@/components/IssueForm";
import { updateIssue } from "@/app/actions";
import { getFeature, getIssue } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function EditIssue({ params }: { params: Promise<{ id: string; issueId: string }> }) {
  const p = await params;
  const id = Number(p.id);
  const issueId = Number(p.issueId);
  if (!Number.isInteger(id) || !Number.isInteger(issueId)) notFound();

  const [feature, issue] = await Promise.all([getFeature(id), getIssue(issueId)]);
  if (!feature || !issue || issue.feature_id !== id) notFound();

  return (
    <>
      <p className="small"><Link href={`/features/${id}`}>← {feature.name}</Link></p>
      <h1>Edit issue</h1>
      <IssueForm issue={issue} action={updateIssue.bind(null, issueId, id)} cancelHref={`/features/${id}`} />
    </>
  );
}

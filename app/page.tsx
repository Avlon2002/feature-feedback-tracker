import Link from "next/link";
import { getFeatures } from "@/lib/db";

export const dynamic = "force-dynamic";

// Home: the list of features. Click one to see and add its issues.
export default async function Home() {
  const features = await getFeatures();

  return (
    <>
      <div className="page-head">
        <h1>Features</h1>
        <Link href="/features/new" className="btn primary">+ New feature</Link>
      </div>

      {features.length === 0 ? (
        <div className="card empty">
          No features yet. Click <strong>+ New feature</strong> to add the first one.
        </div>
      ) : (
        <div className="feature-list">
          {features.map((f) => (
            <Link key={f.id} href={`/features/${f.id}`} className="card feature-card">
              <div className="feature-name">{f.name}</div>
              {f.description && <div className="muted">{f.description}</div>}
              <div className="small feature-meta">
                {f.issue_count === 0
                  ? "No issues yet"
                  : `${f.issue_count} issue${f.issue_count === 1 ? "" : "s"} · ${f.open_count} open`}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

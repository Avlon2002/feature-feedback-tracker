import Link from "next/link";
import { getFeatures, searchIssues, type Feature } from "@/lib/db";
import { statusClass } from "@/lib/options";

export const dynamic = "force-dynamic";

// Home: the list of features, with a search box. Click a feature to see and add its issues.
export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = (await searchParams).q?.trim() ?? "";

  const [features, issues] = await Promise.all([
    getFeatures(q || undefined),
    q ? searchIssues(q) : Promise.resolve([]),
  ]);

  return (
    <>
      <div className="page-head">
        <h1>Features</h1>
        <Link href="/features/new" className="btn primary">+ New feature</Link>
      </div>

      <form className="search" role="search">
        <input name="q" defaultValue={q} placeholder="Search features and issues…" aria-label="Search" />
        <button className="btn">Search</button>
        {q && <Link href="/" className="btn">Clear</Link>}
      </form>

      {q ? (
        <>
          <p className="muted">
            {features.length + issues.length === 0
              ? <>Nothing found for “{q}”.</>
              : <>Results for “{q}”</>}
          </p>

          {features.length > 0 && (
            <>
              <h2>Features ({features.length})</h2>
              <FeatureList features={features} />
            </>
          )}

          {issues.length > 0 && (
            <>
              <h2>Issues ({issues.length})</h2>
              <div className="feature-list">
                {issues.map((i) => (
                  <Link key={i.id} href={`/features/${i.feature_id}#issue-${i.id}`} className="card feature-card">
                    <div className="row">
                      <span className="small muted">{i.feature_name}</span>
                      <span className={statusClass(i.status) + " push-right"}>{i.status}</span>
                    </div>
                    <div className="result-issue">{i.issue}</div>
                    {(i.raised_by || i.idea_by) && (
                      <div className="small muted">
                        {i.raised_by && <>Raised by {i.raised_by}</>}
                        {i.raised_by && i.idea_by && " · "}
                        {i.idea_by && <>Idea by {i.idea_by}</>}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      ) : features.length === 0 ? (
        <div className="card empty">
          No features yet. Click <strong>+ New feature</strong> to add the first one.
        </div>
      ) : (
        <FeatureList features={features} />
      )}
    </>
  );
}

function FeatureList({ features }: { features: Feature[] }) {
  return (
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
  );
}

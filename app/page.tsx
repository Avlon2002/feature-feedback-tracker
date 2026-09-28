import Link from "next/link";
import { getFeatures, getFeedbackList, getStatusCounts } from "@/lib/db";
import { PRIORITIES, STATUSES, statusClass } from "@/lib/options";
import { deleteFeedback } from "@/app/actions";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";

type Search = { q?: string; status?: string; feature?: string; priority?: string };

export default async function Home({ searchParams }: { searchParams: Promise<Search> }) {
  const filters = await searchParams;
  const [items, features, counts] = await Promise.all([
    getFeedbackList(filters),
    getFeatures(),
    getStatusCounts(),
  ]);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const exportQuery = new URLSearchParams(filters as Record<string, string>).toString();

  return (
    <>
      <section className="stats">
        <Link href="/" className="stat">
          <span className="stat-n">{total}</span>
          <span>All</span>
        </Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/?status=${encodeURIComponent(s)}`} className={"stat" + (filters.status === s ? " active" : "")}>
            <span className="stat-n">{counts[s] ?? 0}</span>
            <span>{s}</span>
          </Link>
        ))}
      </section>

      <form className="filters card">
        <input name="q" placeholder="Search feedback, people, actions…" defaultValue={filters.q ?? ""} />
        <select name="feature" defaultValue={filters.feature ?? ""}>
          <option value="">All features</option>
          {features.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
        <select name="status" defaultValue={filters.status ?? ""}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select name="priority" defaultValue={filters.priority ?? ""}>
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
        </select>
        <button className="btn">Filter</button>
        <Link href="/" className="btn">Clear</Link>
        <a href={`/export?${exportQuery}`} className="btn">Export CSV</a>
      </form>

      {items.length === 0 ? (
        <div className="card empty">
          No feedback yet. <Link href="/feedback/new">Add the first one →</Link>
        </div>
      ) : (
        <div className="card table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Feature</th>
                <th>Submitted by</th>
                <th>Feedback</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Latest action</th>
                <th>Decision date</th>
                <th>Latest reason</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id}>
                  <td><Link href={`/feedback/${i.id}`}>{i.id}</Link></td>
                  <td>
                    {i.feature_id ? (
                      <Link href={`/features/${i.feature_id}`}>{i.feature_name}</Link>
                    ) : (
                      <em className="muted">General</em>
                    )}
                  </td>
                  <td>
                    {i.submitted_by}
                    {i.department && <div className="muted small">{i.department}</div>}
                  </td>
                  <td className="wrap">
                    <Link href={`/feedback/${i.id}`}>{i.feedback}</Link>
                    <div className="muted small">{i.type}</div>
                  </td>
                  <td>
                    <span className={statusClass(i.status)}>{i.status}</span>
                    {!!i.decision_count && (
                      <div className="muted small">
                        <Link href={`/feedback/${i.id}`}>
                          {i.decision_count} decision{i.decision_count === 1 ? "" : "s"}
                        </Link>
                      </div>
                    )}
                  </td>
                  <td>{i.priority}</td>
                  <td className="wrap">{i.action_taken}</td>
                  <td className="nowrap">{i.decision_date}</td>
                  <td className="wrap">{i.decision_reason}</td>
                  <td>
                    <div className="row-actions">
                      <Link href={`/feedback/${i.id}`} className="btn small">Edit</Link>
                      <form action={deleteFeedback.bind(null, i.id, false)}>
                        <SubmitButton
                          className="btn small danger"
                          pendingText="…"
                          confirmMessage={`Delete feedback #${i.id}? This cannot be undone.`}
                        >
                          Delete
                        </SubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// Edit this list to change the status choices across the app.
export const STATUSES = [
  "New",
  "Under Review",
  "Approved",
  "In Progress",
  "Done",
  "Rejected",
  "On Hold",
] as const;

// CSS class used for the coloured status badge
export function statusClass(status: string) {
  return "badge badge-" + status.toLowerCase().replace(/\s+/g, "-");
}

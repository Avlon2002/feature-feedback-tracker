// Edit these lists to change the dropdown choices across the app.

export const STATUSES = [
  "New",
  "Under Review",
  "Approved",
  "In Progress",
  "Done",
  "Rejected",
  "On Hold",
] as const;

export const PRIORITIES = ["Low", "Medium", "High", "Critical"] as const;

export const TYPES = ["Suggestion", "Bug", "Complaint", "Question", "Praise"] as const;

// CSS class used for the coloured status badge
export function statusClass(status: string) {
  return "badge badge-" + status.toLowerCase().replace(/\s+/g, "-");
}

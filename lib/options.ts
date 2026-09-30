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

// Project board columns, left to right
export const TASK_STATUSES = ["To do", "In progress", "Done"] as const;

export const PRIORITIES = ["Low", "Medium", "High"] as const;

// Today as YYYY-MM-DD (for "overdue" checks and default dates)
export function today() {
  return new Date().toISOString().slice(0, 10);
}

// CSS class used for the coloured status badge
export function statusClass(status: string) {
  return "badge badge-" + status.toLowerCase().replace(/\s+/g, "-");
}

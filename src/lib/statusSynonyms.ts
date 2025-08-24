export const STATUS_KEYS = {
  completed: ["Completed", "Done"],
  scheduled: ["Scheduled"],
  plannedNvd: ["Planned NVD", "Planned nvd", "Planned\nNVD"],
  pending: ["Pending"],
  cancelled: ["Cancelled", "Canceled", "Case Canceled", "Case Cancelled", "Rejected"],
};

export function pickCount(
  byStatus: Record<string, number> | undefined,
  keys: string[]
): number {
  if (!byStatus) return 0;
  for (const k of keys) {
    if (k in byStatus) return byStatus[k]!;
  }
  return 0;
}
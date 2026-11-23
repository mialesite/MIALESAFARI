/**
 * Public listings read the `destinations` collection, which has accumulated
 * duplicate documents because the import can be triggered from several admin
 * surfaces. De-duplicate on read so visitors never see the same park twice.
 */
export function uniqueByName<T extends { name?: string }>(rows: T[]): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = (row.name || "").trim().toLowerCase().replace(/\s+/g, " ");
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

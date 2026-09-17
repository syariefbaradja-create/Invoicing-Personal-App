export function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const escape = (val: unknown) => {
    if (val === null || val === undefined) return "";
    const str = val instanceof Date ? val.toISOString() : String(val);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const header = columns.join(",");
  const lines = rows.map((row) => columns.map((col) => escape(row[col])).join(","));
  return [header, ...lines].join("\r\n");
}

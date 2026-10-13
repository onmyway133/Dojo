import type { Table } from "./logic";

const maxRows = 500;

/** Read-only grid. Rows alternate fills instead of using grid lines. */
export function DataTable({ table }: { table: Table }) {
  const rows = table.rows.slice(0, maxRows);
  return (
    <div className="min-h-0 flex-1 overflow-auto px-2 pb-3">
      <table className="w-max min-w-full text-left text-[12.5px]">
        <thead className="sticky top-0 bg-section">
          <tr>
            {table.columns.map((column) => (
              <th key={column} className="px-2.5 py-1.5 font-semibold whitespace-nowrap">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="select-text">
          {rows.map((row, r) => (
            <tr key={r} className="odd:bg-field">
              {table.columns.map((_, c) => (
                <td key={c} className="max-w-80 truncate px-2.5 py-1 first:rounded-l-md last:rounded-r-md">
                  {row[c]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.rows.length > maxRows && (
        <p className="px-2.5 pt-2 text-xs text-muted-foreground">
          Showing the first {maxRows} of {table.rows.length} rows.
        </p>
      )}
    </div>
  );
}

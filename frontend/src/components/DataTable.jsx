export default function DataTable({ columns, rows, emptyMessage = "لا توجد بيانات بعد" }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="bg-surface border border-border rounded p-10 text-center text-muted text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded overflow-x-auto">
      <table className="w-full text-sm min-w-[640px]">
        <thead>
          <tr className="border-b border-border bg-paper">
            {columns.map((col) => (
              <th key={col.key} className="text-right px-4 py-3 font-semibold text-ink/80">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row._id || i} className="border-b border-border last:border-0 hover:bg-paper/60">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-ink">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

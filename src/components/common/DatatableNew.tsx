import { Fragment, useEffect } from "react";
import "../../assets/css/datatable.css";

export interface Column<T extends Record<string, any>> {
  key: keyof T | "action";
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T extends Record<string, any>> {
  columns?: Column<T>[];
  data?: T[];
  totalRecords?: number;
  pageSize: number;
  page: number;
  search: string;
  loading?: boolean;
  onPageChange: (p: number) => void;
  onSearchChange: (s: string) => void;
  onPageSizeChange: (size: number) => void;
  onFetch?: () => void;
  renderSubRow?: (row: T) => React.ReactNode;

  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
}

const Datatable = <T extends Record<string, any>>({
  columns,
  data,
  totalRecords = 0,
  pageSize,
  page,
  search,
  loading,
  onPageChange,
  onSearchChange,
  onPageSizeChange,
  onFetch = () => {},
  renderSubRow,
  onRowClick,
  rowClassName,
}: Props<T>) => {
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safeData = Array.isArray(data) ? data : [];



  const sortedData = [...safeData].sort((a, b) => {
  if (!search) return 0;

  const searchText = search.toLowerCase().trim();

  const aStr = String(a.pcts_name || "").toLowerCase();
  const bStr = String(b.pcts_name || "").toLowerCase();

  const aStarts = aStr.startsWith(searchText);
  const bStarts = bStr.startsWith(searchText);

  // ✅ Priority 1: startsWith
  if (aStarts && !bStarts) return -1;
  if (!aStarts && bStarts) return 1;

  // ✅ Priority 2: position (index)
  const aIndex = aStr.indexOf(searchText);
  const bIndex = bStr.indexOf(searchText);

  if (aIndex !== -1 && bIndex !== -1) {
    return aIndex - bIndex; // smaller index first
  }

  // ✅ Priority 3: fallback alphabetical
  return aStr.localeCompare(bStr);
});
  /* ✅ FETCH DATA */
  useEffect(() => {
    onFetch();
  }, [page, pageSize, search]);

  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const startRecord =
    totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;
    const half = Math.floor(maxVisible / 2);

    let start = currentPage - half;
    let end = currentPage + half;

    if (start < 1) {
      start = 1;
      end = Math.min(maxVisible, totalPages);
    }

    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, totalPages - maxVisible + 1);
    }

    if (start > 1) {
      pages.push(1);
      if (start > 2) pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) {
      if (end < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }



    

    return pages;
  };

  
  return (
    <div className="datatable-padding">
      {/* 🔹 HEADER */}
      <div className="datatable-header">
        <div style={{ display: "flex", gap: "10px" }}>
          <label style={{ marginTop: "4px" }}>Show</label>

          {/* ✅ FIXED: RESET PAGE */}
          <select
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              onPageSizeChange(newSize);
              onPageChange(1); // 🔥 FIX
            }}
            className="datatable-length"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>

          {/* ✅ FIXED: RESET PAGE ON SEARCH */}
          <input
            className="datatable-search"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageChange(1); // 🔥 FIX
            }}
          />
        </div>
      </div>

      {/* 🔹 TABLE */}
      <div style={{ overflowX: "auto" }}>
        <table className="tp-table">
          <thead>
            <tr>
              {safeColumns.map((c) => (
                <th key={String(c.key)}>{c.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
         {sortedData.map((row, i) => (
              <Fragment key={(row as any).id || i}>
                <tr
                  className={rowClassName ? rowClassName(row) : ""}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    cursor: onRowClick ? "pointer" : "default",
                  }}
                >
                  {safeColumns.map((c) => (
                    <td key={String(c.key)}>
                      {c.render
                        ? c.render(row)
                        : String(row[c.key as keyof T] ?? "")}
                    </td>
                  ))}
                </tr>

                {renderSubRow && renderSubRow(row)}
              </Fragment>
            ))}

            {safeData.length === 0 && (
              <tr>
                <td
                  colSpan={safeColumns.length || 1}
                  style={{ textAlign: "center" }}
                >
                  No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 FOOTER */}
      <div className="datatable-footer">
        <div className="datatable-info">
          Showing {startRecord} to {endRecord} of {totalRecords} entries
        </div>

        <ul className="pagination">
          {/* PREVIOUS */}
          <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => !loading && onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              Previous
            </button>
          </li>

          {/* PAGE NUMBERS */}
          {getPageNumbers().map((p, index) => {
            const key = p === "..." ? `dots-${index}` : `page-${p}`;

            return p === "..." ? (
              <li key={key} className="page-item disabled">
                <button className="page-link" disabled>
                  …
                </button>
              </li>
            ) : (
              <li
                key={key}
                className={`page-item ${currentPage === p ? "active" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => onPageChange(Number(p))}
                >
                  {p}
                </button>
              </li>
            );
          })}

          {/* NEXT */}
          <li
            className={`page-item ${
              currentPage === totalPages ? "disabled" : ""
            }`}
          >
            <button
              className="page-link"
              onClick={() => !loading && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              Next
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Datatable;
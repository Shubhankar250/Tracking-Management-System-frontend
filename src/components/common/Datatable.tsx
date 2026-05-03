import { useState, useMemo, Fragment } from "react";
import "../../assets/css/datatable.css";

export interface Column<T extends Record<string, any>> {
  key: keyof T | "action" | string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface Props<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  pageSize?: number;
  renderSubRow?: (row: T) => React.ReactNode; // ⭐ NEW
}

const Datatable = <T extends Record<string, any>>({
  columns,
  data,
  pageSize = 10,
  renderSubRow,
}: Props<T>) => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  /* 🔍 SEARCH */
  const filteredData = useMemo(() => {
    return data.filter((row) =>
      Object.values(row).some((val) => {
        if (val === null || val === undefined) return false;
        return String(val)
          .toLowerCase()
          .includes(search.toLowerCase());
      })
    );
  }, [search, data]);

  /* 📄 PAGINATION */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / pageSize)
  );

  const paginatedData = filteredData.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  return (
    <>
      {/* 🔍 SEARCH */}
      <div className="datatable-padding">
      <div className="datatable-header">
        <input
          className="datatable-search"
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      {/* 📋 TABLE */}
      <table className="tp-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)}>{c.label}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {paginatedData.map((row, i) => (
            <Fragment key={row.id ?? i}>
              {/* MAIN ROW */}
              <tr>
                {columns.map((c) => (
                  <td key={String(c.key)}>
                    {c.render
                      ? c.render(row)
                      : String(row[c.key as keyof T] ?? "")}
                  </td>
                ))}
              </tr>

              {/* ⭐ SUB ROW (JUST BELOW MAIN ROW) */}
              {renderSubRow && renderSubRow(row)}
            </Fragment>
          ))}

          {paginatedData.length === 0 && (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: "center" }}>
                No records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 📄 PAGINATION */}
      <div className="datatable-footer">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
      </div>
    </>
  );
};

export default Datatable;

import { useState, useMemo } from "react";
import DataTable from "react-data-table-component";
import type { TableColumn } from "react-data-table-component";

interface Props<T> {
  data: T[];
  columns: TableColumn<T>[];
  searchableFields?: (keyof T)[];
  progressPending?: boolean;
}

function CommonDataTable<T>({
  data,
  columns,
  searchableFields = [],
  progressPending = false,
}: Props<T>) {
  const [search, setSearch] = useState("");

  const filteredData = useMemo(() => {
    if (!search || searchableFields.length === 0) return data;

    return data.filter(row =>
      searchableFields.some(field =>
        String(row[field] ?? "")
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [search, data, searchableFields]);

  return (
    <div>
      {/* 🔍 SEARCH */}
      <div style={{ textAlign: "right", marginTop: 8 }}>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            padding: "6px 10px",
            border: "1px solid #ccc",
            borderRadius: 4,
          }}
        />
      </div>

     <DataTable
  columns={columns}
  data={filteredData}
  pagination
  striped
  dense
  highlightOnHover
  progressPending={progressPending}

  persistTableHead     // ✅ THIS IS THE FIX

  noDataComponent={
    <div style={{ padding: 20, textAlign: "center", color: "#888" }}>
      No data available in table
    </div>
  }
/>

    </div>
  );
}

export default CommonDataTable;

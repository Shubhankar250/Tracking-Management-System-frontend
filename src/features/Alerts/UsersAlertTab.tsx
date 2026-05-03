import { useState } from "react";

export interface User {
  id: number;
  name: string;
}

interface UsersTabProps {
  users: User[];
  value: number[];
  onChange: (selectedIds: number[]) => void;
  error?: string; // ✅ already added
}

export default function UsersTab({
  users,
  value,
  onChange,
  error,
}: UsersTabProps) {
  // ✅ include error in destructuring
  const [search, setSearch] = useState("");
  const toggleUser = (id: number) => {
    if (value.includes(id)) {
      onChange(value.filter((u) => u !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const selectAll = () => {
    onChange(filteredUsers.map((u) => u.id));
  };

  const deselectAll = () => {
    onChange([]);
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="users-card">
      <div className="alert-label">Users</div>

      <div className="alert-toolbar">
        <div className="right">
          <button
            type="button"
            className="alert-btn primary"
            onClick={selectAll}
          >
            Select All
          </button>

          <button
            type="button"
            className="alert-btn secondary"
            onClick={deselectAll}
          >
            Deselect All
          </button>

          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control-search"
          />
        </div>
      </div>

      {/* ✅ ERROR MESSAGE (IMPORTANT) */}
      {error && (
        <div className="text-danger" style={{ fontSize: 12, marginBottom: 8 }}>
          {error}
        </div>
      )}

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <div
          style={{
            fontSize: "14px",
            color: "#888",
            textAlign: "center",
            padding: "12px 0",
            width: "100%",
          }}
        >
          No users found
        </div>
      ) : (
        <div className="vehicles-grid">
          {filteredUsers.map((user) => (
            <label key={user.id} className="vehicle-item">
              <input
                type="checkbox"
                checked={value.includes(user.id)}
                onChange={() => toggleUser(user.id)}
              />
              <span>{user.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

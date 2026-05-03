import { useEffect, useMemo, useState } from "react";
import { FaEdit, FaMinusCircle, FaPlusCircle, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";

import Modal from "../../components/common/Modal";
import Datatable, { type Column } from "../../components/common/DatatableNew";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchUsers,
  setPage,
  setPageSize,
  setSearch,
} from "../../slices/usersSlice";
import { deleteUser, type UserDTO } from "../../api/users.api";
import AddUserForm from "./AddUserForm";
import { canWrite, canDelete } from "../../utils/permission";

interface Props {
  open: boolean;
  onClose: () => void;
}

const UsersModal: React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useAppDispatch();

  /* ---------- REDUX STATE ---------- */
  const users = useAppSelector((s) => s.users.list);
  const roles = useAppSelector((s) => s.auth.roles);
  const usersLoading = useAppSelector((s) => s.users.loading);

  /* ---------- LOCAL STATE ---------- */
  const [addOpen, setAddOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  /* ---------- ADMIN CHECK ---------- */
  const isAdmin = useMemo(() => roles.includes("ROLE_ADMIN"), [roles]);

  /* ---------- SIMPLE USERS ---------- */
  const simpleUsers = useMemo(
    () => users.filter((u) => !u.role.includes("ROLE_ADMIN")),
    [users],
  );

  const page = useAppSelector((s) => s.users.page);
  const pageSize = useAppSelector((s) => s.users.pageSize);
  const search = useAppSelector((s) => s.users.search);
  const totalRecords = useAppSelector((s) => s.users.totalRecords);
  const { permissions, loading } = useAppSelector((s) => s.auth);
  const canWriteUser = canWrite(permissions, "User");
  const canDeleteUser = canDelete(permissions, "User");

  /* ---------- GROUPED USERS (ADMIN) ---------- */
  const groupedUsers = useMemo(() => {
    if (!isAdmin) return [];

    const map: Record<string, any> = {};
    const main: any[] = [];

    users.forEach((u) => {
      if (u.role.includes("ROLE_USER")) {
        map[u.username] = { ...u, subusers: [] };
        main.push(map[u.username]);
      }
    });

    users.forEach((u) => {
      if (u.role.includes("ROLE_SUBUSER") && map[u.accountname]) {
        map[u.accountname].subusers.push(u);
      }
    });

    return main;
  }, [users, isAdmin]);
  // determine assignable roles for current user
const assignableRoles = useMemo(() => {
  if (roles.includes("ROLE_ADMIN")) {
    return ["ROLE_USER"];
  } 
  else if (roles.includes("ROLE_USER")) {
    return ["ROLE_SUBUSER"];
  } 
  else if (roles.includes("ROLE_SUBUSER")) {
    return ["ROLE_TASK"];
  }
  return [];
}, [roles]);
  /* ---------- FETCH USERS WHEN MODAL OPENS AND ROLES ARE READY ---------- */
  useEffect(() => {
    if (open && roles.length > 0) {
      dispatch(fetchUsers());
    }
  }, [open, page, pageSize, roles, dispatch]);

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setPage(1)); // reset page
      dispatch(setSearch(searchInput));
      dispatch(fetchUsers());
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchInput]);
 const displayRole = (role: string) => {
  switch (role) {
    case "ROLE_USER":
      return "Enterprise";
    case "ROLE_SUBUSER":
      return "Customer";
    case "ROLE_TASK":
      return "Task";
    default:
      return role.replace("ROLE_", "");
  }
};
  /* ---------- DELETE USER ---------- */
  const handleDelete = async (id: number) => {
    const res = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (res.isConfirmed) {
      await deleteUser(id);
      Swal.fire("Deleted!", "User deleted successfully.", "success");
      dispatch(fetchUsers());
    }
  };

  /* ---------- EXPAND ROWS ---------- */
  const toggleRow = (id: number) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  /* ---------- COLUMNS ---------- */
  const adminColumns: Column<any>[] = [
    {
      key: "expand",
      label: "",
      render: (row) => {
        const isOpen = expandedRows.includes(row.id);
        return (
          <span
            onClick={() => toggleRow(row.id)}
            style={{ cursor: "pointer", fontSize: 18 }}
          >
            {isOpen ? (
              <FaMinusCircle color="red" />
            ) : (
              <FaPlusCircle color="green" />
            )}
          </span>
        );
      },
    },
    { key: "username", label: "User Name" },
    { key: "firstname", label: "First Name" },
    { key: "lastname", label: "Last Name" },
    { key: "phoneNumber", label: "Phone" },
    {
      key: "role",
      label: "Role",
      render: (u) => (
        <span className="status role">{displayRole(u.role[0])}</span>
      ),
    },
    {
      key: "enabled",
      label: "Status",
      render: (u) =>
        u.enabled ? (
          <span className="status enabled">ENABLED</span>
        ) : (
          <span className="status disabled">DISABLED</span>
        ),
    },
    ...(canWriteUser || canDeleteUser
      ? [
          {
            key: "action",
            label: "Action",
            render: (row: any) => (
              <div style={{ display: "flex", gap: 10 }}>
                {canWriteUser && (
                  <FaEdit
                    style={{ cursor: "pointer", color: "#2563eb" }}
                    onClick={() => {
                      setEditId(row.id);
                      setAddOpen(true);
                    }}
                  />
                )}
                {canDeleteUser && (
                  <FaTrash
                    style={{ cursor: "pointer", color: "#dc2626" }}
                    onClick={() => handleDelete(row.id)}
                  />
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  const simpleColumns: Column<UserDTO>[] = [
    { key: "username", label: "User Name" },
    { key: "firstname", label: "First Name" },
    { key: "lastname", label: "Last Name" },
    { key: "phoneNumber", label: "Phone" },
    {
      key: "role",
      label: "Role",
      render: (u) => (
        <span className="status role">{displayRole(u.role[0])}</span>
      ),
    },
    {
      key: "enabled",
      label: "Status",
      render: (u) =>
        u.enabled ? (
          <span className="status enabled">ENABLED</span>
        ) : (
          <span className="status disabled">DISABLED</span>
        ),
    },
      ...(canWriteUser || canDeleteUser
    ? [
    {
        key: "action" as const,   // ✅ FIX
      label: "Action",
      render: (row : any) => (
        <div style={{ display: "flex", gap: 10 }}>
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => {
              setEditId(row.id);
              setAddOpen(true);
            }}
          />
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => handleDelete(row.id)}
          />
        </div>
      ),
    },
     ]
    : []),
  ];

  return (
    <>
      <Modal
        isOpen={open}
        title="Users"
        onClose={onClose}
        size="fullscreen"
        showAddButton={!loading && canWriteUser}
        onAddClick={() => {
          if (!loading && canWriteUser) {
            setEditId(null);
            setAddOpen(true);
          }
        }}
      >
        {/* 🔹 LOADING / ADMIN / NORMAL USER */}
        {roles.length === 0 ? (
          <div style={{ textAlign: "center", padding: 20 }}>Loading...</div>
        ) : isAdmin ? (
          <Datatable
            columns={adminColumns}
            data={groupedUsers}
            totalRecords={totalRecords}
            page={page}
            pageSize={pageSize}
            search={searchInput}
            loading={usersLoading}
            onSearchChange={(s) => setSearchInput(s)}
            onPageChange={(p) => dispatch(setPage(p))}
            onPageSizeChange={(size) => dispatch(setPageSize(size))}
            renderSubRow={(user) =>
              expandedRows.includes(user.id) ? (
                <tr className="sub-row">
                  <td colSpan={adminColumns.length} style={{ padding: 0 }}>
                    {user.subusers.length === 0 ? (
                      <div
                        style={{
                          width: "100%",
                          textAlign: "center",
                          padding: "20px",
                          fontStyle: "italic",
                          color: "#6b7280",
                          background: "#f9fafb",
                        }}
                      >
                        <i className="fa fa-info-circle me-1" />
                        No details found
                      </div>
                    ) : (
                      <table
                        className="table table-sm table-bordered mb-0"
                        style={{ width: "100%" }}
                      >
                        <thead className="table-light text-center">
                          <tr>
                            <th>User Name</th>
                            <th>Name</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody className="text-center">
                          {user.subusers.map((su: UserDTO) => (
                            <tr key={su.id}>
                              <td>{su.username}</td>
                              <td>
                                {su.firstname} {su.lastname}
                              </td>
                              <td>{su.phoneNumber}</td>
                              <td>
                                <span className="status subrole">
                                  {displayRole(su.role[0])}
                                </span>
                              </td>
                              <td>
                                {su.enabled ? (
                                  <span className="status enabled">
                                    ENABLED
                                  </span>
                                ) : (
                                  <span className="status disabled">
                                    DISABLED
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </td>
                </tr>
              ) : null
            }
          />
        ) : (
          <Datatable
            columns={simpleColumns}
            data={simpleUsers}
            totalRecords={totalRecords}
            page={page}
            pageSize={pageSize}
            search={search}
            loading={usersLoading}
            onPageChange={(p) => dispatch(setPage(p))}
            onPageSizeChange={(size) => dispatch(setPageSize(size))}
            onSearchChange={(s) => dispatch(setSearch(s))}
          />
        )}
      </Modal>

      {/* ADD / EDIT → ADMIN ONLY */}
      {
        <Modal
          isOpen={addOpen}
          title={editId ? "Update User" : "Add User"}
          size="large"
          onClose={() => setAddOpen(false)}
        >
          <AddUserForm
            editId={editId}
            availableRoles={assignableRoles} // ✅ pass roles
            onClose={() => setAddOpen(false)}
            onSuccess={() => {
              setAddOpen(false);
              setEditId(null);
              dispatch(fetchUsers());
            }}
          />
        </Modal>
      }
    </>
  );
};

export default UsersModal;

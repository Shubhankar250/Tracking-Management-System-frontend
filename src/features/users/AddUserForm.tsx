import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchDefaultPermissions,
  fetchMapSettings,
  createUser,
  editUser,
} from "../../slices/usersSlice";
import { fetchUserById } from "../../slices/usersSlice";
import { fetchGroups } from "../../slices/devicesSlice";
import { fetchGroupedDevices } from "../../slices/usersSlice";
import type { CustomUserDTO, UserModulePermission } from "../../api/users.api";
import "../../assets/css/add-user-modal.css";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface Props {
  editId?: number | null;
  availableRoles: string[];
  onSuccess: () => void;
  onClose: () => void;
}

const AddUserForm: React.FC<Props> = ({
  editId,
  availableRoles,
  onSuccess,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const { selected } = useAppSelector((s) => s.users);
  const { groups } = useAppSelector((state) => state.devices);

  /* ================= REDUX ================= */
  const { permissions, mapSettings } = useAppSelector((state) => state.users);

  /* ================= TABS ================= */
  const tabs = ["Main", "Permission", "Object", "Client", "Object List"];
  const [activeTab, setActiveTab] = useState("Main");

  /* ================= MAIN ================= */

  const [email, setEmail] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [subscriptionPoint, setSubscriptionPoint] = useState<number>(0);
  const isAdmin = true;

  /* ================= MAPS ================= */
  const [selectedMaps, setSelectedMaps] = useState<string[]>([]);

  /* ================= PERMISSIONS ================= */
  const [userPermissions, setUserPermissions] = useState<
    UserModulePermission[]
  >([]);

  /* ================= OBJECTS ================= */
  const { groupedDevices } = useAppSelector((state) => state.users);
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  /* ================= CLIENT TAB ================= */
  const [firstName, setfirstName] = useState("");
  const [lastName, setlastName] = useState("");
  const [username, setusername] = useState("");
  const [password, setpassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    firstName: "",
    username: "",
    role: "",
    group: "",
    password: "",
  });
  const [role, setRole] = useState("");
  const [enabled, setEnabled] = useState<number | "">("");
  const [accessType, setAccessType] = useState("ALL");
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [showPassword, setShowPassword] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  /* ================= OBJECT LIST ================= */
  const isTaskRole = role === "ROLE_TASK";
  type ColumnOption = {
    value: string;
    label: string;
  };

  const columnOptions: ColumnOption[] = [
    { value: "name", label: "Name" },
    { value: "uniqueid", label: "IMEI" },
    { value: "status", label: "Status" },
    { value: "speed", label: "Speed" },
    { value: "time", label: "Last Connection" },
    { value: "protocol", label: "Protocol" },
    { value: "position", label: "Position" },
    { value: "address", label: "Address" },
    { value: "sim_number", label: "SIM" },
    { value: "Object_model", label: "Object Model" },
    { value: "plate_number", label: "Plate No" },
    { value: "vin", label: "VIN" },
    { value: "registration_number", label: "Reg No" },
    { value: "object_owner", label: "Owner" },
    { value: "additional_notes", label: "Notes" },
    { value: "active", label: "Active" },
    { value: "Object_type_id", label: "Object Type" },
    { value: "group", label: "Group" },
    { value: "fuel", label: "Fuel" },
    { value: "stop_duration", label: "Stop Duration" },
    { value: "idle_duration", label: "Idle Duration" },
    { value: "ignition_duration", label: "Ignition Duration" },
    { value: "last_event_title", label: "Event Title" },
    { value: "last_event_type", label: "Event Type" },
    { value: "last_event_time", label: "Event Time" },
  ];

  /* Default selected (same as JSP) */
  const [selectedColumns, setSelectedColumns] = useState<ColumnOption[]>([
    { value: "name", label: "Name" },
    { value: "status", label: "Status" },
    { value: "uniqueid", label: "IMEI" },
  ]);

  const [columnSelect, setColumnSelect] = useState("");
  const addColumn = (value: string) => {
    const col = columnOptions.find((c) => c.value === value);
    if (!col) return;

    setSelectedColumns((prev) =>
      prev.some((c) => c.value === value) ? prev : [...prev, col],
    );
  };

  const removeColumn = (value: string) => {
    setSelectedColumns((prev) => prev.filter((c) => c.value !== value));
  };
  const onDragStart = (index: number) => (e: React.DragEvent) => {
    e.dataTransfer.setData("dragIndex", index.toString());
  };

  const onDrop = (index: number) => (e: React.DragEvent) => {
    const dragIndex = Number(e.dataTransfer.getData("dragIndex"));
    if (dragIndex === index) return;

    setSelectedColumns((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(dragIndex, 1);
      updated.splice(index, 0, moved);
      return updated;
    });
  };

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    dispatch(fetchDefaultPermissions());
    dispatch(fetchMapSettings());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);
  /* ================= DEFAULT MAP SELECTION ================= */
  useEffect(() => {
    if (mapSettings?.defaultSelectedMaps) {
      setSelectedMaps(mapSettings.defaultSelectedMaps);
    }
  }, [mapSettings]);

  /* ================= DEFAULT PERMISSIONS ================= */
  useEffect(() => {
    if (permissions.length) {
      setUserPermissions(permissions.map((p) => ({ ...p })));
    }
  }, [permissions]);

  /* ================= PERMISSION UPDATE ================= */
  const updatePermission = (
    index: number,
    field: "read" | "write" | "delete",
    value: boolean,
  ) => {
    setUserPermissions((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    );
  };
  useEffect(() => {
    dispatch(fetchGroupedDevices());
  }, [dispatch]);
  const toggleDevice = (deviceId: number) => {
    setSelectedDevices((prev) => {
      // 🔥 ROLE_TASK → only single selection
      if (isTaskRole) {
        return prev.includes(deviceId) ? [] : [deviceId];
      }

      // normal roles → multi select
      return prev.includes(deviceId)
        ? prev.filter((id) => id !== deviceId)
        : [...prev, deviceId];
    });
  };

  const toggleGroup = (devices: { id: number }[], checked: boolean) => {
    const ids = devices.map((d) => d.id);

    setSelectedDevices((prev) => {
      if (isTaskRole) {
        return checked ? [ids[0]] : [];
      }

      return checked
        ? Array.from(new Set([...prev, ...ids]))
        : prev.filter((id) => !ids.includes(id));
    });
  };

  const selectAllDevices = () => {
    if (!groupedDevices) return;

    const allIds = Object.values(groupedDevices)
      .flat()
      .map((d) => d.id);

    setSelectedDevices(isTaskRole ? [allIds[0]] : allIds);
  };
  const deselectAllDevices = () => {
    setSelectedDevices([]);
  };
  const objectListPayload = selectedColumns.reduce(
    (acc, col) => {
      acc[col.value] = col.label.toUpperCase();
      return acc;
    },
    {} as Record<string, string>,
  );
  // Fetch user data when editId is set
  useEffect(() => {
    if (editId) {
      dispatch(fetchUserById(editId));
    }
  }, [editId, dispatch]);

  // Populate form when selected changes
  useEffect(() => {
    if (selected && editId === selected.id) {
      setEmail(selected.email);
      setMobileNo(selected.phoneNumber ?? "");
      setSubscriptionPoint(selected.available_subscription_points ?? 0);
      setfirstName(selected.firstname);
      setlastName(selected.lastname);
      setusername(selected.username);
      setpassword(""); // usually empty for edit
      setRole(selected.role[0] || "");
      setEnabled(selected.enabled ?? "");
      setAccessType(selected.access_type || "ALL");
      setCountry(selected.country || "");
      setTimezone(selected.timezone || "Asia/Kolkata");
      setSelectedGroup(selected.groupId ?? 0);
      // MAPS
      setSelectedMaps(selected.available_maps?.split(",") || []);

      // PERMISSIONS
      if (selected.permissions) {
        const savedPerms = JSON.parse(selected.permissions);

        const merged = permissions.map((defaultPerm) => {
          const existing = savedPerms.find(
            (p: any) => p.permission === defaultPerm.permission,
          );

          return existing ? existing : { ...defaultPerm }; // new permission auto add
        });

        setUserPermissions(merged);
      } else {
        setUserPermissions(permissions.map((p) => ({ ...p })));
      }

      // DEVICES
      setSelectedDevices(
        selected.assign_device_ids
          ? selected.assign_device_ids.split(",").map(Number)
          : [],
      );

      // Object list columns
      const objList = selected.objectlist
        ? JSON.parse(selected.objectlist)
        : {};
      const cols = Object.entries(objList).map(([value, label]) => ({
        value,
        label: String(label), // <--- cast to string
      }));
      setSelectedColumns(cols.length ? cols : selectedColumns);
    }
  }, [selected, editId]);

  const validateFields = () => {
    let valid = true;
    let firstErrorTab: string | null = null;
    const missingFields: string[] = [];

    const setTabIfEmpty = (tab: string) => {
      if (!firstErrorTab) firstErrorTab = tab;
    };

    const addMissing = (field: string) => {
      if (!missingFields.includes(field)) {
        missingFields.push(field);
      }
    };

    const newErrors: any = {};

    // ===== MAIN TAB =====
    if (!email?.trim()) {
      newErrors.email = "Email is required";
      addMissing("Email");
      setTabIfEmpty("Main");
      valid = false;
    }

    if (!mobileNo) {
      newErrors.phone = "Phone is required";
      addMissing("Phone");
      setTabIfEmpty("Main");
      valid = false;
    }

    // ===== CLIENT TAB =====
    if (!firstName) {
      newErrors.firstName = "First Name is required";
      addMissing("First Name");
      setTabIfEmpty("Client");
      valid = false;
    }

    if (!username) {
      newErrors.username = "Username is required";
      addMissing("Username");
      setTabIfEmpty("Client");
      valid = false;
    }

    if (!role) {
      newErrors.role = "Role is required";
      addMissing("Role");
      setTabIfEmpty("Client");
      valid = false;
    }

    if (!selectedGroup || selectedGroup === 0) {
      newErrors.group = "Group is required";
      addMissing("Group");
      setTabIfEmpty("Client");
      valid = false;
    }

    if (!editId && !password) {
      newErrors.password = "Password is required";
      addMissing("Password");
      setTabIfEmpty("Client");
      valid = false;
    }

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (firstErrorTab) {
      setActiveTab(firstErrorTab);
    }

    return { valid, missingFields };
  };
  /* ================= SAVE ================= */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const { valid, missingFields } = validateFields();

    if (!valid) {
      if (missingFields.length) {
        toast.error(
          <div>
            <div>Please fill the following fields:</div>
            <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
              {missingFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          </div>,
        );
      }
      return;
    }

    const payload: CustomUserDTO = {
      ...(editId ? { id: editId } : {}),
      email,
      phone_number1: mobileNo,
      available_maps: selectedMaps.join(","),
      available_subscription_points: subscriptionPoint,
      permissions: JSON.stringify(userPermissions),
      assign_device_ids: selectedDevices.join(","),
      firstname: firstName,
      lastname: lastName,
      username: username,
      password: password || undefined,
      role: [role],
      enabled: enabled === "" ? undefined : enabled,
      access_type: accessType,
      country,
      timezone,
      objectlist: JSON.stringify(objectListPayload),
    };

    try {
      if (editId) {
        await dispatch(editUser({ payload, groupId: selectedGroup })).unwrap();
        toast.success("User updated successfully");
      } else {
        await dispatch(
          createUser({ payload, groupId: selectedGroup }),
        ).unwrap();
        toast.success("User created successfully");
      }
      onSuccess();
    } catch (err: any) {
      toast.error("Operation failed");
    }
  };

  const filteredGroupedDevices = Object.fromEntries(
    Object.entries(groupedDevices || {}).map(([groupName, devices]) => {
      const filteredDevices = devices.filter((d) =>
        (d.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()),
      );
      return [groupName, filteredDevices];
    }),
  );

  return (
    <div className="add-user-modal">
      <div className="user-modal-wrapper">
        {/* ================= TABS ================= */}
        <div className="modal-tabs">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ================= CONTENT ================= */}
        <div className="modal-body">
          <div className="tab-content">
            {/* ========= MAIN ========= */}
            {activeTab === "Main" && (
              <div className="tab-pane grid-2">
                <div>
                  <label className="form-label required">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEmail(value);

                      // email regex
                      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                      if (value && !emailRegex.test(value)) {
                        setErrors((prev) => ({
                          ...prev,
                          email: "Invalid email format",
                        }));
                      } else {
                        setErrors((prev) => ({ ...prev, email: "" }));
                      }
                    }}
                  />
                  {errors.email && (
                    <div className="error-text">{errors.email}</div>
                  )}
                </div>

                <div>
                  <label className="form-label required">Phone</label>
                  <input
                    className="form-control"
                    value={mobileNo}
                    onChange={(e) => {
                      // allow only digits
                      let value = e.target.value.replace(/\D/g, "");

                      // max 14 digits
                      if (value.length > 14) return;

                      setMobileNo(value);

                      // validation
                      if (value && (value.length < 10 || value.length > 14)) {
                        setErrors((prev) => ({
                          ...prev,
                          phone: "Phone must be 10 to 14 digits",
                        }));
                      } else {
                        setErrors((prev) => ({ ...prev, phone: "" }));
                      }
                    }}
                  />
                  {errors.phone && (
                    <div className="error-text">{errors.phone}</div>
                  )}
                </div>

                {/* MAPS */}
                <div style={{ gridColumn: "1 / -1", marginTop: "-16px" }}>
                  <label className="form-label">Maps</label>

                  <div className="maps-grid">
                    {mapSettings?.availableMaps.map((map) => (
                      <label key={map} className="form-check d-flex gap-2">
                        <input
                          type="checkbox"
                          checked={selectedMaps.includes(map)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedMaps((p) => [...p, map]);
                            } else {
                              setSelectedMaps((p) =>
                                p.filter((m) => m !== map),
                              );
                            }
                          }}
                        />
                        {map.replaceAll("_", " ")}
                      </label>
                    ))}
                  </div>
                </div>

                {isAdmin && (
                  <div>
                    <label className="form-label">Subscription Points</label>

                    <input
                      type="number"
                      className="form-control"
                      value={subscriptionPoint}
                      min={0}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") {
                          e.preventDefault();
                        }
                      }}
                      onChange={(e) => {
                        const value = e.target.value;

                        // ❌ don't allow empty → fallback to 0
                        if (value === "") {
                          setSubscriptionPoint(0);
                          return;
                        }

                        const num = Number(value);

                        if (num >= 0) {
                          setSubscriptionPoint(num);
                        }
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* ========= PERMISSION ========= */}
            {activeTab === "Permission" && (
              <div className="tab-pane permission-tab">
                {/* ===== Top Controls ===== */}
                <div className="permission-toolbar">
                  <div className="left">
                    <strong>Module Permissions</strong>
                  </div>

                  <div className="right">
                    <button
                      type="button"
                      className="permission-btn primary"
                      onClick={() =>
                        setUserPermissions((prev) =>
                          prev.map((p) => ({
                            ...p,
                            read: true,
                            write: true,
                            delete: true,
                          })),
                        )
                      }
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      className="permission-btn secondary"
                      onClick={() =>
                        setUserPermissions((prev) =>
                          prev.map((p) => ({
                            ...p,
                            read: false,
                            write: false,
                            delete: false,
                          })),
                        )
                      }
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* ===== Header Row ===== */}
                <div className="permission-header">
                  <div>Module</div>
                  <div className="actions">
                    <span>Read</span>
                    <span>Write</span>
                    <span>Delete</span>
                  </div>
                </div>

                {/* ===== Rows ===== */}
                {userPermissions.map((perm, index) => (
                  <div key={perm.permission} className="permission-row">
                    <div className="permission-name">{perm.permission}</div>

                    <div className="permission-actions">
                      <input
                        type="checkbox"
                        checked={perm.read}
                        onChange={(e) =>
                          updatePermission(index, "read", e.target.checked)
                        }
                      />

                      <input
                        type="checkbox"
                        checked={perm.write}
                        onChange={(e) =>
                          updatePermission(index, "write", e.target.checked)
                        }
                      />

                      <input
                        type="checkbox"
                        checked={perm.delete}
                        onChange={(e) =>
                          updatePermission(index, "delete", e.target.checked)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ========= OBJECT ========= */}
            {activeTab === "Object" && (
              <div className="tab-pane">
                {/* ===== Top Toolbar (same as Permission) ===== */}
                <div className="permission-toolbar">
                  <div className="left">
                    <strong>Objects</strong>
                  </div>

                  <div className="right">
                    <input
                      type="text"
                      placeholder="Search vehicle..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-control"
                    />

                    <button
                      type="button"
                      className="permission-btn primary"
                      onClick={selectAllDevices}
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      className="permission-btn secondary"
                      onClick={deselectAllDevices}
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* ===== Groups ===== */}
                <div className="vehicle-groups-container">
                  {groupedDevices &&
                    Object.entries(filteredGroupedDevices)
                      .filter(([_, devices]) => devices.length > 0)
                      .map(([groupName, devices]) => {
                        const groupChecked =
                          devices.length > 0 &&
                          devices.every((d) => selectedDevices.includes(d.id));

                        return (
                          <div className="group-block mb-3" key={groupName}>
                            {/* Group Header */}
                            <div className="group-header">
                              <label className="group-label">
                                <input
                                  type="checkbox"
                                  checked={groupChecked}
                                  onChange={(e) =>
                                    toggleGroup(devices, e.target.checked)
                                  }
                                />
                                <span>{groupName}</span>
                              </label>
                            </div>

                            {/* Vehicles */}
                            <div className="vehicles-grid">
                              {devices.map((vehicle) => (
                                <label
                                  className="vehicle-item"
                                  key={vehicle.id}
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedDevices.includes(
                                      vehicle.id,
                                    )}
                                    onChange={() => toggleDevice(vehicle.id)}
                                  />
                                  <span>{vehicle.name}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                </div>
              </div>
            )}

            {/* ========= CLIENT ========= */}
            {activeTab === "Client" && (
              <div className="tab-pane grid-2">
                {/* First Name */}
                <div>
                  <label className="form-label required">First Name</label>
                  <input
                    className="form-control"
                    value={firstName}
                    onChange={(e) => {
                      setfirstName(e.target.value);
                      setErrors((prev) => ({ ...prev, firstName: "" }));
                    }}
                  />
                  {errors.firstName && (
                    <div className="error-text">{errors.firstName}</div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    className="form-control"
                    value={lastName}
                    onChange={(e) => setlastName(e.target.value)}
                  />
                </div>

                {/* Username */}
                <div>
                  <label className="form-label required">Username</label>
                  <input
                    className="form-control"
                    value={username}
                    onChange={(e) => {
                      setusername(e.target.value);
                      setErrors((prev) => ({ ...prev, username: "" }));
                    }}
                    readOnly={!!editId}
                    style={
                      editId
                        ? { backgroundColor: "#e9ecef", cursor: "not-allowed" }
                        : {}
                    }
                  />
                  {errors.username && (
                    <div className="error-text">{errors.username}</div>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label className="form-label required">Password</label>
                  <div className="password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => {
                        setpassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }}
                    />
                    {errors.password && (
                      <div className="error-text">{errors.password}</div>
                    )}
                    <button
                      type="button"
                      className="toggle-eye"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>
                {/* Role */}
                <div className="mb-3">
                  <label className="form-label required">Role</label>
                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => {
                      setRole(e.target.value);
                      setErrors((prev) => ({ ...prev, role: "" }));
                    }}
                  >
                    {/* Placeholder option */}
                    <option value="" disabled>
                      Select Role
                    </option>

                    {availableRoles.map((r) => (
                      <option key={r} value={r}>
                        {r.replace("ROLE_", "")}
                      </option>
                    ))}
                  </select>
                  {errors.role && (
                    <div className="error-text">{errors.role}</div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={enabled}
                    onChange={(e) =>
                      setEnabled(
                        e.target.value === "" ? "" : Number(e.target.value),
                      )
                    }
                  >
                    <option value="">Select Status</option>
                    <option value="1">Enable</option>
                    <option value="0">Disable</option>
                  </select>
                </div>

                {/* Access */}
                <div>
                  <label className="form-label">Access</label>
                  <select
                    className="form-select"
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value)}
                  >
                    <option value="ALL">All</option>
                    <option value="WEB">Web</option>
                    <option value="APP">App</option>
                  </select>
                </div>

                {/* Group */}
                <div>
                  <label className="form-label required">Group</label>
                  <select
                    className="form-select"
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(Number(e.target.value));
                      setErrors((prev) => ({ ...prev, group: "" }));
                    }}
                  >
                    <option value={0}>Select Group</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  {errors.group && (
                    <div className="error-text">{errors.group}</div>
                  )}
                </div>

                {/* Country */}
                <div>
                  <label className="form-label">Country</label>
                  <select
                    className="form-select"
                    value={country}
                    onChange={(e) => {
                      setCountry(e.target.value);
                      setTimezone("Asia/Kolkata");
                    }}
                  >
                    <option value="">Select Country</option>
                    <option value="India">India</option>
                    <option value="USA">USA</option>
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="form-label">Time Zone</label>
                  <input className="form-control" value={timezone} readOnly />
                </div>
              </div>
            )}

            {/* ========= OBJECT LIST ========= */}
            {activeTab === "Object List" && (
              <div className="tab-pane">
                {/* Dropdown */}
                <div className="form-group mb-3">
                  <label className="form-label">Add Column</label>
                  <select
                    className="form-control"
                    value={columnSelect}
                    onChange={(e) => {
                      setColumnSelect(e.target.value);
                      addColumn(e.target.value);
                    }}
                  >
                    <option value="">Select column</option>
                    {columnOptions.map((col) => (
                      <option key={col.value} value={col.value}>
                        {col.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Columns (chips) */}
                <div id="selectedColumns" className="selected-columns">
                  {selectedColumns.map((col, index) => (
                    <div
                      key={col.value}
                      draggable
                      onDragStart={onDragStart(index)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={onDrop(index)}
                      className="column-chip"
                    >
                      <span className="chip-label">{col.label}</span>

                      <button
                        type="button"
                        className="chip-remove"
                        onClick={() => removeColumn(col.value)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {/* ================= FOOTER ================= */}
        <div className="modal-footer-custom">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>

          <button className="btn btn-primary" onClick={handleSubmit}>
            {editId ? "Update" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserForm;

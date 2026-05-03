import { useCallback, useEffect, useState } from "react";
import Modal from "../../components/common/Modal";
import Datatable from "../../components/common/DatatableNew";
import type { Column } from "../../components/common/DatatableNew";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import {
  fetchDrivers,
  removeDriver,
  fetchSMS,
  fetchEMAIL,
  fetchGPRS,
  removeTemplate,
  fetchObjects,
} from "../../slices/setupSlice";
import type {
  DriverSetupDTO,
  SetupDeviceDTO,
  SetupTemplateDTO,
} from "../../api/setupServices.api";
import { createDriver } from "../../slices/setupSlice";
import { editDriver } from "../../slices/setupSlice";
import { createSMSTemplate } from "../../slices/setupSlice";
import { editSMSTemplate } from "../../slices/setupSlice";
import { createEMAILTemplate } from "../../slices/setupSlice";
import { editEMAILTemplate } from "../../slices/setupSlice";
import { createGPRSTemplate } from "../../slices/setupSlice";
import { editGPRSTemplate } from "../../slices/setupSlice";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import "../../assets/css/setup.css";
import AddSetupDriver from "./AddSetupDriver";
import AddSMSTemplate from "./AddSMSTemplate";
import { updateusersetup } from "../../slices/setupSlice";
import { fetchUserSetup } from "../../slices/setupSlice";
import Device from "../Device";
import {  canWrite, canDelete } from "../../utils/permission";

const SetupModal = ({ open, onClose }: any) => {
  const dispatch = useAppDispatch();

  const { drivers, totalRecords, templates, objects, userSetup, loading } =
    useAppSelector((s) => s.setup);

  const SETUP_TABS = [
    "Drivers",
    "SMS Gateway",
    "SMS Template",
    "Email Gateway",
    "Email Template",
    "GPRS Template",
    "Widgets",
    "Dashboard",
    "Objects",
  ] as const;

  type SetupTab = (typeof SETUP_TABS)[number];
  const [activeTab, setActiveTab] = useState<SetupTab>("Drivers");

  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<
    DriverSetupDTO | undefined
  >(undefined);
  const [smsModalOpen, setSmsModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<
    SetupTemplateDTO | undefined
  >(undefined);

  const [smsEnabled, setSmsEnabled] = useState(true);
  const [gatewayType, setGatewayType] = useState("SMPP");
  const [gatewayUrl, setGatewayUrl] = useState("");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpUsername, setSmtpUsername] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpEncryption, setSmtpEncryption] = useState("NONE");
  const [widgets, setWidgets] = useState<string[]>([]);
  const [dashboard, setDashboard] = useState<string[]>([]);
  
      const { permissions } = useAppSelector((s) => s.auth);
    
    const canWriteSetup = canWrite(permissions, "Setup");
    const canDeleteSetup = canDelete(permissions, "Setup");

  /* Pagination & Search */
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [search, setSearch] = useState("");

  const refresh = useCallback(() => {
    dispatch(fetchDrivers({ page: page - 1, size: pageSize, search }));
  }, [dispatch, page, pageSize, search]);

  const toggleValue = (
    value: string,
    list: string[],
    setList: (v: string[]) => void,
  ) => {
    setList(
      list.includes(value) ? list.filter((v) => v !== value) : [...list, value],
    );
  };

  const resetForm = () => {
    setSmsEnabled(true);
    setGatewayType("SMPP");
    setGatewayUrl("");

    setSmtpHost("");
    setSmtpUsername("");
    setSmtpPassword("");
    setSmtpPort("");
    setSmtpEncryption("NONE");

    setWidgets([]);
    setDashboard([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    try {
      const payload: any = {};

      if (activeTab === "SMS Gateway") {
        payload.smsGatewayType = smsEnabled ? gatewayType : null;
        payload.smsGatewayUrl = smsEnabled ? gatewayUrl : null;
      }

      if (activeTab === "Email Gateway") {
        payload.smtpHost = smtpHost;
        payload.smtpUsername = smtpUsername;
        payload.smtpPort = smtpPort;
        payload.smtpEncryption = smtpEncryption;

        if (smtpPassword) {
          payload.smtpPassword = smtpPassword;
        }
      }
      if (activeTab === "Widgets") {
        payload.availableWidgets = widgets.join(",");
      }

      if (activeTab === "Dashboard") {
        payload.dashboardMenu = dashboard.join(",");
      }

      await dispatch(updateusersetup(payload)).unwrap();
      await dispatch(fetchUserSetup()).unwrap();
      toast.success("Settings updated successfully");
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const isSaveDisabled = () => {
    if (activeTab === "SMS Gateway") return smsEnabled && !gatewayUrl;
    if (activeTab === "Email Gateway") return !smtpHost || !smtpUsername;
    if (activeTab === "Widgets") return widgets.length === 0;
    if (activeTab === "Dashboard") return dashboard.length === 0;
    return true;
  };

  const SAVABLE_TABS = ["SMS Gateway", "Email Gateway", "Widgets", "Dashboard"];

  const canShowSave = SAVABLE_TABS.includes(activeTab);

  const saveDriver = async (data: DriverSetupDTO) => {
    try {
      if (data.id) {
        // 🔁 UPDATE
        await dispatch(editDriver(data)).unwrap();
        toast.success("Driver updated successfully");
      } else {
        // ➕ ADD
        await dispatch(createDriver(data)).unwrap();
        toast.success("Driver added successfully");
      }

      setDriverModalOpen(false);
      setSelectedDriver(undefined);
      refresh();
    } catch (err) {
      toast.error("Driver save failed");
    }
  };

  const saveTemplate = async (
    data: SetupTemplateDTO,
    templateType: "SMS" | "GPRS" | "EMAIL",
  ) => {
    try {
      if (templateType === "SMS") {
        if (data.id) {
          await dispatch(editSMSTemplate(data)).unwrap();
          toast.success("SMS Template updated successfully");
        } else {
          await dispatch(createSMSTemplate(data)).unwrap();
          toast.success("SMS Template added successfully");
        }
      }

      if (templateType === "EMAIL") {
        if (data.id) {
          await dispatch(editEMAILTemplate(data)).unwrap();
          toast.success("Email Template updated successfully");
        } else {
          await dispatch(createEMAILTemplate(data)).unwrap();
          toast.success("Email Template added successfully");
        }
      }

      if (templateType === "GPRS") {
        if (data.id) {
          await dispatch(editGPRSTemplate(data)).unwrap();
          toast.success("GPRS Template updated successfully");
        } else {
          await dispatch(createGPRSTemplate(data)).unwrap();
          toast.success("GPRS Template added successfully");
        }
      }

      setSmsModalOpen(false);
      setSelectedTemplate(undefined);
      refreshTemplates(); // based on active tab
    } catch (err) {
      toast.error("Template save failed");
    }
  };

  const handleTemplateSave = (data: SetupTemplateDTO) => {
    saveTemplate(data, getTemplateType());
  };

  const refreshTemplates = () => {
    if (activeTab === "SMS Template") fetchSmsTemplates();
    if (activeTab === "Email Template") fetchEmailTemplates();
    if (activeTab === "GPRS Template") fetchGprsTemplates();
  };

  const fetchSmsTemplates = useCallback(() => {
    dispatch(fetchSMS({ page: page - 1, size: pageSize, search }));
  }, [dispatch, page, pageSize, search]);

  const fetchEmailTemplates = useCallback(() => {
    dispatch(fetchEMAIL({ page: page - 1, size: pageSize, search }));
  }, [dispatch, page, pageSize, search]);

  const fetchGprsTemplates = useCallback(() => {
    dispatch(fetchGPRS({ page: page - 1, size: pageSize, search }));
  }, [dispatch, page, pageSize, search]);
  const fetchObjectsData = useCallback(() => {
    dispatch(fetchObjects({ page: page - 1, size: pageSize, search }));
  }, [dispatch, page, pageSize, search]);

  useEffect(() => {
    if (open) {
      setActiveTab("Drivers");
      setPage(1);
      setSearch("");
      setSelectedDriver(undefined);
      setSelectedTemplate(undefined);
    }
  }, [open]);

  useEffect(() => {
    if (open) {
      dispatch(fetchUserSetup());
    }
  }, [open, dispatch]);

  useEffect(() => {
    if (!userSetup) return;

    // SMS
    setSmsEnabled(!!userSetup.smsGatewayType);
    setGatewayType(userSetup.smsGatewayType || "SMPP");
    setGatewayUrl(userSetup.smsGatewayUrl || "");

    // EMAIL
    setSmtpHost(userSetup.smtpHost || "");
    setSmtpUsername(userSetup.smtpUsername || "");
    setSmtpPassword("");
    setSmtpPort(userSetup.smtpPort || "");
    setSmtpEncryption(userSetup.smtpEncryption || "NONE");

    // WIDGETS
    setWidgets(
      userSetup.availableWidgets ? userSetup.availableWidgets.split(",") : [],
    );

    // DASHBOARD
    setDashboard(
      userSetup.dashboardMenu ? userSetup.dashboardMenu.split(",") : [],
    );
  }, [userSetup]);

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This driver will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(removeDriver(id)).unwrap();
      toast.success("Driver deleted successfully");
      refresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This Template will be permanently deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(removeTemplate(id)).unwrap();
      toast.success("Template deleted successfully");
      refreshTemplates();
    } catch {
      toast.error("Delete failed");
    }
  };

  /* =====================
     TABLE COLUMNS
  ====================== */

  const columns: Column<DriverSetupDTO>[] = [
    { key: "name", label: "Name" },
    { key: "rfid", label: "RFID" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "description", label: "Description" },
    { key: "deviceName", label: "Object" },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
           {canWriteSetup && (
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => {
              setSelectedDriver(row);
              setDriverModalOpen(true);
            }}
          />
           )}
            {canDeleteSetup && (
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => handleDelete(row.id!)}
          />
            )}
        </div>
      ),
    },
  ];

  const smsGprsColumns: Column<SetupTemplateDTO>[] = [
    { key: "title", label: "Title" },
    { key: "adapted", label: "Adapted" },
    {
      key: "message",
      label: "Protocol",
      render: (row) => {
        const message = row.message ?? "";

        return (
          <span title={message}>
            {message.length > 30 ? message.slice(0, 30) + "..." : message}
          </span>
        );
      },
    },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => {
              setSelectedTemplate(row);
              setSmsModalOpen(true);
            }}
          />
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => handleDeleteTemplate(row.id!)}
          />
        </div>
      ),
    },
  ];

  const emailColumns: Column<SetupTemplateDTO>[] = [
    { key: "title", label: "Title" },
    { key: "templateName", label: "Name" },
    { key: "subject", label: "Subject" },
    {
      key: "message",
      label: "Message",
      render: (row) => {
        const message = row.message ?? "";

        return (
          <span title={message}>
            {message.length > 30 ? message.slice(0, 30) + "..." : message}
          </span>
        );
      },
    },
    ...(canWriteSetup || canDeleteSetup
      ? [
    {
      key: "action" as const,
      label: "Action",
      render: (row :any) => (
        <div style={{ display: "flex", gap: 10 }}>
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => {
              setSelectedTemplate(row);
              setSmsModalOpen(true);
            }}
          />
          <FaTrash
            style={{ cursor: "pointer", color: "#dc2626" }}
            onClick={() => handleDeleteTemplate(row.id!)}
          />
        </div>
      ),
    },
    ]
      : []),
  ];
  const [editDeviceId, setEditDeviceId] = useState<number | null>(null);
  const [deviceModalOpen, setDeviceModalOpen] = useState(false);

  const handleEditObject = (id: number) => {
    setEditDeviceId(id);
    setDeviceModalOpen(true);
  };
  const objectsColumns: Column<SetupDeviceDTO>[] = [
  {
  key: "vehicle_status",
  label: "Status",
  render: (row) => {
    const isActive = row.vehicle_status?.toUpperCase() === "ACTIVE";

    return (
      <span
        className={`status-badge ${isActive ? "status-active" : "status-inactive"}`}
      >
        {isActive ? "ACTIVE" : "INACTIVE"}
      </span>
    );
  },
},
    { key: "name", label: "Object Name" },
    { key: "uniqueid", label: "IMEI Number" },
    {
      key: "action",
      label: "Action",
      render: (row) => (
        <div style={{ display: "flex", gap: 10 }}>
          <FaEdit
            style={{ cursor: "pointer", color: "#2563eb" }}
            onClick={() => handleEditObject(row.id!)}
          />
        </div>
      ),
    },
  ];

  const getTemplateType = () => {
    if (activeTab === "SMS Template") return "SMS";
    if (activeTab === "GPRS Template") return "GPRS";
    if (activeTab === "Email Template") return "EMAIL";
    return "SMS";
  };

  const closeSetupModal = () => {
    setActiveTab("Drivers");
    onClose();
  };

  const closeDriverModal = () => {
    setDriverModalOpen(false);
    setSelectedDriver(undefined);
  };

  const closeTemplateModal = () => {
    setSmsModalOpen(false);
    setSelectedTemplate(undefined);
  };

  return (
    <>
      <Modal
        className="setup-modal"
        isOpen={open}
        title={`Setup - ${activeTab}`}
        onClose={closeSetupModal}
        size="large"
      >
        {/* MODAL CONTENT WRAPPER */}
        <div className="modal-body-flex">
          <div
              style={{
                display: "flex",
                borderBottom: "1px solid #e5e7eb",
                marginBottom: 12,
              }}
            >
              {SETUP_TABS.map((tab) => (
                <div
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setPage(1);
                    setSearch("");
                  }}
                  style={{
                    padding: "10px 16px",
                    cursor: "pointer",
                    fontWeight: activeTab === tab ? 600 : 400,
                    color: activeTab === tab ? "#2563eb" : "#374151",
                    borderBottom:
                      activeTab === tab
                        ? "3px solid #2563eb"
                        : "3px solid transparent",
                  }}
                >
                  {tab}
                </div>
              ))}
            </div>
          {/* ===== SCROLLABLE CONTENT ===== */}
          <div className="modal-content-scroll">
            

            {activeTab === "Drivers" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="sidebar-search-btn"
                  title="Add Driver"
                  onClick={() => {
                    setSelectedDriver(undefined);
                    setDriverModalOpen(true);
                  }}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            )}

            {/* ADD DRIVER MODAL (render once, clean) */}
            {driverModalOpen && (
              <AddSetupDriver
                onClose={closeDriverModal}
                onSave={saveDriver}
                editData={selectedDriver}
              />
            )}

            {activeTab === "Drivers" && (
              <Datatable
                columns={columns}
                data={drivers}
                totalRecords={totalRecords}
                page={page}
                pageSize={pageSize}
                search={search}
                loading={loading}
                onPageChange={(p) => {
                  if (p !== page) setPage(p);
                }}
                onSearchChange={setSearch}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                onFetch={refresh}
              />
            )}

            {activeTab === "SMS Gateway" && (
              <div style={{ padding: "8px 15px" }}>
                {/* Enable Toggle */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 20,
                  }}
                >
                  <label
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#374151",
                    }}
                  >
                    Enable SMS Gateway
                  </label>

                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={smsEnabled}
                      onChange={(e) => setSmsEnabled(e.target.checked)}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>

                {/* Gateway Type */}
                <div className="st-form-group" style={{ marginBottom: 20 }}>
                  <label>SMS Gateway Type</label>
                  <select
                    value={gatewayType}
                    onChange={(e) => setGatewayType(e.target.value)}
                    disabled={!smsEnabled}
                  >
                    <option value="">Select Gateway</option>
                    <option value="SMPP">SMPP</option>
                    <option value="HTTP">HTTP</option>
                  </select>
                </div>

                {/* Gateway URL */}
                <div className="st-form-group" style={{ marginBottom: 20 }}>
                  <label>SMS Gateway URL</label>
                  <textarea
                    value={gatewayUrl}
                    onChange={(e) => setGatewayUrl(e.target.value)}
                    disabled={!smsEnabled}
                    placeholder="Enter SMS Gateway URL"
                  />
                </div>
              </div>
            )}

            {smsModalOpen && (
              <AddSMSTemplate
                onClose={closeTemplateModal}
                onSave={handleTemplateSave}
                editData={selectedTemplate}
                templateType={getTemplateType()}
              />
            )}

            {activeTab === "SMS Template" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="sidebar-search-btn"
                  title="Add SMS Template"
                  onClick={() => {
                    setSelectedTemplate(undefined);
                    setSmsModalOpen(true);
                  }}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            )}

            {/* SMS TEMPLATE */}
            {activeTab === "SMS Template" && (
              <Datatable
                columns={smsGprsColumns}
                data={templates}
                totalRecords={totalRecords}
                page={page}
                pageSize={pageSize}
                search={search}
                loading={loading}
                onPageChange={(p) => {
                  if (p !== page) setPage(p);
                }}
                onSearchChange={setSearch}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                onFetch={fetchSmsTemplates}
              />
            )}

            {activeTab === "Email Gateway" && (
              <div style={{ padding: "8px 15px" }}>
                <div className="st-form-group">
                  <label>SMTP Host</label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="eg., smtp.gmail.com"
                  />
                </div>

                <div className="st-form-group">
                  <label>Email ID</label>
                  <input
                    type="text"
                    value={smtpUsername}
                    onChange={(e) => setSmtpUsername(e.target.value)}
                    placeholder="fleet.opr@admin"
                  />
                </div>

                <div className="st-form-group">
                  <label>SMTP Password</label>
                  <input
                    type="password"
                    value={smtpPassword}
                    onChange={(e) => setSmtpPassword(e.target.value)}
                    placeholder="********"
                  />
                </div>

                <div className="st-form-group">
                  <label>SMTP Port</label>
                  <input
                    type="text"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(e.target.value)}
                    placeholder="587"
                  />
                </div>

                <div className="st-form-group">
                  <label>SMTP Encryption</label>
                  <select
                    value={smtpEncryption}
                    onChange={(e) => setSmtpEncryption(e.target.value)}
                  >
                    <option value="NONE">None</option>
                    <option value="SSL">SSL</option>
                    <option value="TLS">TLS</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === "Email Template" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="sidebar-search-btn"
                  title="Add Email Template"
                  onClick={() => {
                    setSelectedTemplate(undefined);
                    setSmsModalOpen(true);
                  }}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            )}

            {/* EMAIL TEMPLATE */}
            {activeTab === "Email Template" && (
              <Datatable
                columns={emailColumns}
                data={templates}
                totalRecords={totalRecords}
                page={page}
                pageSize={pageSize}
                search={search}
                loading={loading}
                onPageChange={(p) => {
                  if (p !== page) setPage(p);
                }}
                onSearchChange={setSearch}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                onFetch={fetchEmailTemplates}
              />
            )}

            {activeTab === "GPRS Template" && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  className="sidebar-search-btn"
                  title="Add GPRS Template"
                  onClick={() => {
                    setSelectedTemplate(undefined);
                    setSmsModalOpen(true);
                  }}
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            )}

            {/* GPRS TEMPLATE */}
            {activeTab === "GPRS Template" && (
              <Datatable
                columns={smsGprsColumns}
                data={templates}
                totalRecords={totalRecords}
                page={page}
                pageSize={pageSize}
                search={search}
                loading={loading}
                onPageChange={(p) => {
                  if (p !== page) setPage(p);
                }}
                onSearchChange={setSearch}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
                onFetch={fetchGprsTemplates}
              />
            )}

            {activeTab === "Widgets" && (
              <div style={{ padding: "8px 15px" }}>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 12,
                    color: "#374151",
                  }}
                >
                  Widgets:
                </div>
                <div className="widget-box">
                  {[
                    "Street_view",
                    "Recent_Events",
                    "Driver",
                    "Device_details",
                    "Sensors",
                    "Services",
                    "GPRS_Commands",
                    "Today_Activity"
                  ].map((w) => (
                    <label key={w}>
                      <input
                        type="checkbox"
                        checked={widgets.includes(w)}
                        onChange={() => toggleValue(w, widgets, setWidgets)}
                      />
                      {w}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "Dashboard" && (
              <div style={{ padding: "8px 15px" }}>
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 12,
                    color: "#374151",
                  }}
                >
                  Dashboard:
                </div>
                <div className="widget-box">
                  {[
                    "Status",
                    "Maintenance",
                    "Usage",
                    "Expense",
                    "Events",
                    "Task",
                  ].map((d) => (
                    <label key={d}>
                      <input
                        type="checkbox"
                        checked={dashboard.includes(d)}
                        onChange={() => toggleValue(d, dashboard, setDashboard)}
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Objects */}
            {activeTab === "Objects" && (
              <div
                style={{
                  maxHeight: "40vh",
                  overflowY: "auto",
                }}
              >
                <Datatable
                  columns={objectsColumns}
                  data={objects}
                  totalRecords={totalRecords}
                  page={page}
                  pageSize={pageSize}
                  search={search}
                  loading={loading}
                  onPageChange={(p) => {
                    if (p !== page) setPage(p);
                  }}
                  onSearchChange={setSearch}
                  onPageSizeChange={(size) => {
                    setPageSize(size);
                    setPage(1);
                  }}
                  onFetch={fetchObjectsData}
                />
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="modal-footer-custom">
            <button className="btn btn-secondary" onClick={handleClose}>
              Close
            </button>
            {canShowSave && (
              <button
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isSaveDisabled()}
              >
                Save
              </button>
            )}
          </div>
        </div>
      </Modal>
      <Device
        open={deviceModalOpen}
        deviceId={editDeviceId ?? undefined}
        onClose={() => {
          setDeviceModalOpen(false);
          setEditDeviceId(null);
        }}
        onSaveSuccess={() => {
          fetchObjectsData(); // reload table
        }}
      />
    </>
  );
};

export default SetupModal;

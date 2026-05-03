import React, { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";

import Modal from "../../components/common/Modal";
import "../../assets/css/Transportroute.css";
import Datatable, { type Column } from "../../components/common/DatatableNew";
import { useDispatch, useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";
import {
  fetchStaff,
  fetchStaffById,
  createStaff,
  editStaff,
  removeStaff,
} from "../../slices/staffSlice";
import type { AppDispatch, RootState } from "../../redux/store";

interface Props {
  open: boolean;
  onClose: () => void;
}

const TransportStaffList : React.FC<Props> = ({ open, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();

  const { data, totalRecords, loading, selected } = useSelector(
  (state: RootState) => state.staff,
);

  const [wizardOpen, setWizardOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [errors, setErrors] = useState<any>({});

const validate = () => {
  const newErrors: any = {};

  if (!form.name.trim()) newErrors.name = "Name is required";
  if (!form.employeeCode.trim()) newErrors.employeeCode = "Employee Code is required";
  if (!form.designation.trim()) newErrors.designation = "Designation is required";
  if (!form.mobileNumber.trim()) {
    newErrors.mobileNumber = "Phone is required";
  } else if (form.mobileNumber.length !== 10) {
    newErrors.mobileNumber = "Phone must be 10 digits";
  }

  setErrors(newErrors);

  return Object.keys(newErrors).length === 0;
};
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset page on search
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

useEffect(() => {
  if (!open) return;

  dispatch(
    fetchStaff({
      page: page - 1,
      pageSize: pageSize,
      search: debouncedSearch,
    })
  );
}, [open, page, pageSize, debouncedSearch, dispatch]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);
  useEffect(() => {
  if (selected) {
    setForm({
      id: selected.id,
      name: selected.name || "",
      designation: selected.designation || "",
      email: selected.email || "",
      mobileNumber: selected.mobileNumber || "",
      employeeCode: selected.employeeCode || "",
    });
  }
}, [selected]);
 const [form, setForm] = useState({
  id: 0,
  name: "",
  designation: "",
  email: "",
  mobileNumber: "",
  employeeCode: "",
});
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setForm((prev) => ({ ...prev, [name]: value }));
};
const handleSave = async () => {
  if (!validate()) return; // ❌ stop if error

  const payload: any = { ...form };

  if (!payload.id) {
    delete payload.id;
  }

  if (form.id) {
    await dispatch(editStaff(payload));
  } else {
    await dispatch(createStaff(payload));
  }

  setWizardOpen(false);

  dispatch(
    fetchStaff({
      page: page - 1,
      pageSize,
      search: debouncedSearch,
    })
  );

  setForm({
    id: 0,
    name: "",
    designation: "",
    email: "",
    mobileNumber: "",
    employeeCode: "",
  });

  setErrors({}); // reset errors
};

  if (!open) return null;
const columns: Column<any>[] = [
  { key: "name", label: "Name" },
  { key: "employeeCode", label: "Employee Code" },
  { key: "designation", label: "Designation" },
  { key: "mobileNumber", label: "Phone" },
  { key: "email", label: "Email" },

  {
    key: "action",
    label: "Action",
    render: (row) => (
      <div className="rt-row-actions">
        <FaEdit
          style={{ cursor: "pointer", color: "#2563eb" }}
          onClick={() => {
            dispatch(fetchStaffById(row.id));
            setWizardOpen(true);
          }}
        />

        <FaTrash
          style={{ cursor: "pointer", color: "red", marginLeft: 10 }}
          onClick={async () => {
            await dispatch(removeStaff(row.id));

            dispatch(
              fetchStaff({
                page: page - 1,
                pageSize,
                search: debouncedSearch,
              })
            );
          }}
        />
      </div>
    ),
  },
];
  return (
    <Modal
      isOpen={open}
      title="Staff List"
      onClose={onClose}
      size="fullscreen"
    >
      <div className="rt-body">
        {/* TOPBAR */}
        <div className="rt-topbar">
          <div className="rt-topbar-inner">
           {/* RIGHT */}
            <div className="rt-right">
              
              <button
                className="rt-btn rt-btn-primary"
                onClick={() => {
  setForm({
    id: 0,
    name: "",
    designation: "",
    email: "",
    mobileNumber: "",
    employeeCode: "",
  });
  setWizardOpen(true);
}}
              >
                + New Staff
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <Datatable
          columns={columns}
          data={data}
          totalRecords={totalRecords}
          page={page}
          pageSize={pageSize}
          search={search}
          onPageChange={setPage}
          onSearchChange={setSearch}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(1);
          }}
          loading={loading}
        />

        {/* MODAL */}
          <Modal  
     title={form.id ? "Update Staff" : "Add Staff"}
      isOpen={wizardOpen}
   onClose={() => setWizardOpen(false)}
      size="medium"
    >
      <div className="st-modal-container">
        {/* BODY */}
        <div className="st-modal-body">
          <div className="st-form-group">
            <label>
              Name <span className="st-required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter Name"
            />   
            {errors.name && <span className="st-error">{errors.name}</span>}         
          </div>
      <div className="st-form-group">
            <label>
              Employee Code <span className="st-required">*</span>
            </label>
            <input
              type="text"
              name="employeeCode"
             value={form.employeeCode}
              onChange={handleChange}
              placeholder="Enter Your Employee Code"
            />    
            {errors.employeeCode && <span className="st-error">{errors.employeeCode}</span>}        
          </div>
          <div className="st-form-group">
            <label>
              Designation <span className="st-required">*</span>
            </label>
            <input
              type="text"
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="Your Designation"
            />    
            {errors.designation && <span className="st-error">{errors.designation}</span>}        
          </div>
          <div className="st-form-group">
            <label>
              Phone <span className="st-required">*</span>
            </label>
            <input
              type="text"
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={handleChange}
              placeholder="Enter Number"
              maxLength={10}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
         {errors.mobileNumber && (
  <span className="st-error">{errors.mobileNumber}</span>
)}
          </div>

          <div className="st-form-group">
            <label>E-Mail</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter Email"
            />
          </div>       
        </div>

        {/* FOOTER */}
        <div className="st-modal-footer">
          <button className="st-btn-secondary" onClick={onClose}>
            Close
          </button>
          <button className="st-btn-primary" onClick={handleSave}>
  {form.id ? "Update" : "Save"}
</button>
        </div>
      </div>
    </Modal>
      </div>
    </Modal>
  );
};

export default TransportStaffList ;
